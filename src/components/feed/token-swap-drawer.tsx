import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useState, useEffect } from 'react'
import { Settings, Loader2, ChevronDown, ArrowUpDown } from 'lucide-react'
import { use7kSwap, useGet7kExpectedAmount } from '@/hooks/use-7k-swap'
import { toast } from 'sonner'
import type { TokenBalance } from '@/types/token'
import { toDecimals } from '@/lib/number'
import { TokenSelector } from '@/components/shared/token-selector'
import type { TokenData } from '@/types/token'
import { useTokenBalances } from '@/hooks/use-token-balances'

interface TokenSwapDrawerProps {
	token: TokenBalance
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	kolAddress: string
}

export function TokenSwapDrawer({
	token,
	isOpen,
	onOpenChange,
	kolAddress
}: TokenSwapDrawerProps) {
	const [swapAmount, setSwapAmount] = useState('')
	const [slippage, setSlippage] = useState(0.5) // Default 0.5% slippage
	const [showSlippageSettings, setShowSlippageSettings] = useState(false)
	const [isTokenInSelectorOpen, setIsTokenInSelectorOpen] = useState(false)
	const [isTokenOutSelectorOpen, setIsTokenOutSelectorOpen] = useState(false)
	const { data: tokens } = useTokenBalances()

	const [selectedTokenIn, setSelectedTokenIn] = useState<
		TokenBalance | undefined
	>(tokens?.[0])
	const [selectedTokenOut, setSelectedTokenOut] = useState<
		TokenBalance | undefined
	>(token)

	// Get real-time quote from 7k protocol
	const {
		data: expectedAmount,
		isLoading: isLoadingQuote,
		error: quoteError
	} = useGet7kExpectedAmount({
		tokenIn: selectedTokenIn?.type || '',
		tokenOut: selectedTokenOut?.type || '',
		amountIn: toDecimals(swapAmount || '0', selectedTokenIn?.decimals || 9)
	})

	// Swap mutation
	const swapMutation = use7kSwap()

	const handleSwapAmountChange = (value: string) => {
		setSwapAmount(value)
	}

	const handleTokenInSelect = (tokenData: TokenData) => {
		// Find the corresponding TokenBalance from our available tokens
		const tokenBalance = tokens?.find((t) => t.type === tokenData.type)
		if (tokenBalance) {
			setSelectedTokenIn(tokenBalance)
		}
		setIsTokenInSelectorOpen(false)
	}

	const handleTokenOutSelect = (tokenData: TokenData) => {
		// Find the corresponding TokenBalance from our available tokens
		const tokenBalance = tokens?.find((t) => t.type === tokenData.type)
		if (tokenBalance) {
			setSelectedTokenOut(tokenBalance)
		}
		setIsTokenOutSelectorOpen(false)
	}

	const handleSwapDirection = () => {
		// Swap the tokens
		const tempToken = selectedTokenIn
		setSelectedTokenIn(selectedTokenOut)
		setSelectedTokenOut(tempToken)
		// Clear the amount when swapping direction
		setSwapAmount('')
	}

	const handleSwap = async () => {
		if (!swapAmount || !expectedAmount) {
			toast.error('Please enter an amount to swap')
			return
		}

		if (!selectedTokenIn || !selectedTokenOut) {
			toast.error('Please select both tokens to swap')
			return
		}

		try {
			await swapMutation.mutateAsync({
				tokenIn: selectedTokenIn.type,
				tokenOut: selectedTokenOut.type,
				amountIn: toDecimals(swapAmount || '0', selectedTokenIn?.decimals || 9),
				slippage: slippage / 100, // Convert percentage to decimal
				kolAddress
			})

			toast.success('Swap completed successfully!')
			onOpenChange(false)
			setSwapAmount('')
		} catch (error) {
			console.error('Swap failed:', error)
			toast.error(error instanceof Error ? error.message : 'Swap failed')
		}
	}

	const handleSlippageChange = (value: number[]) => {
		setSlippage(value[0])
	}

	const isSwapDisabled =
		!swapAmount ||
		!expectedAmount ||
		swapMutation.isPending ||
		isLoadingQuote ||
		!selectedTokenIn ||
		!selectedTokenOut

	// Reset form when drawer closes
	useEffect(() => {
		if (!isOpen) {
			setSwapAmount('')
			setShowSlippageSettings(false)
		}
	}, [isOpen])

	// Initialize tokens when available
	useEffect(() => {
		if (tokens && tokens.length > 0 && !selectedTokenIn) {
			setSelectedTokenIn(tokens[0])
		}
	}, [tokens, selectedTokenIn])

	// Reset selectedTokenOut when token prop changes
	useEffect(() => {
		setSelectedTokenOut(token)
	}, [token])

	return (
		<>
			<Drawer open={isOpen} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle className="flex items-center gap-2">
							<div className="flex items-center gap-1">
								{selectedTokenIn?.iconUrl && (
									<img
										src={selectedTokenIn.iconUrl}
										alt={selectedTokenIn.symbol}
										className="w-5 h-5 rounded-full"
									/>
								)}
								<ArrowUpDown className="w-4 h-4 text-muted-foreground" />
								{selectedTokenOut?.iconUrl && (
									<img
										src={selectedTokenOut.iconUrl}
										alt={selectedTokenOut.symbol}
										className="w-5 h-5 rounded-full"
									/>
								)}
							</div>
							Token Swap
						</DrawerTitle>
						<DrawerDescription>
							Trade tokens instantly with best price routing
						</DrawerDescription>
					</DrawerHeader>

					<div className="p-4 space-y-6">
						{/* Settings */}
						<div className="flex justify-end">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowSlippageSettings(!showSlippageSettings)}
								className="h-8 w-8 p-0">
								<Settings className="h-4 w-4" />
							</Button>
						</div>

						{/* Slippage Settings */}
						{showSlippageSettings && (
							<div className="space-y-3 p-4 border rounded-lg bg-muted/50">
								<Label className="text-sm font-medium">
									Slippage Tolerance
								</Label>
								<div className="space-y-2">
									<Slider
										value={[slippage]}
										onValueChange={handleSlippageChange}
										max={5}
										min={0.1}
										step={0.1}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>0.1%</span>
										<span className="font-medium">{slippage}%</span>
										<span>5%</span>
									</div>
								</div>
							</div>
						)}

						{/* Pay section */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">You Pay</Label>
							<div className="flex gap-2">
								<Button
									variant="outline"
									className="w-[140px] justify-between"
									onClick={() => setIsTokenInSelectorOpen(true)}>
									<div className="flex items-center gap-2">
										{selectedTokenIn?.iconUrl && (
											<img
												src={selectedTokenIn.iconUrl}
												alt={selectedTokenIn.symbol}
												className="w-4 h-4 rounded-full"
											/>
										)}
										<span>{selectedTokenIn?.symbol || 'Select'}</span>
									</div>
									<ChevronDown className="h-4 w-4" />
								</Button>
								<Input
									type="number"
									placeholder="0.0"
									value={swapAmount}
									onChange={(e) => handleSwapAmountChange(e.target.value)}
									className="flex-1"
								/>
							</div>
							{selectedTokenIn && (
								<div className="text-xs text-muted-foreground px-1">
									Balance: {selectedTokenIn.formattedBalance}{' '}
									{selectedTokenIn.symbol}
								</div>
							)}
						</div>

						{/* Swap direction button */}
						<div className="flex justify-center">
							<Button
								variant="outline"
								size="sm"
								onClick={handleSwapDirection}
								className="h-8 w-8 p-0 rounded-full border-2">
								<ArrowUpDown className="w-4 h-4" />
							</Button>
						</div>

						{/* Receive section */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">You Receive</Label>
							<div className="flex gap-2">
								<Button
									variant="outline"
									className="w-[140px] justify-between"
									onClick={() => setIsTokenOutSelectorOpen(true)}>
									<div className="flex items-center gap-2">
										{selectedTokenOut?.iconUrl && (
											<img
												src={selectedTokenOut.iconUrl}
												alt={selectedTokenOut.symbol}
												className="w-4 h-4 rounded-full"
											/>
										)}
										<span>{selectedTokenOut?.symbol || 'Select'}</span>
									</div>
									<ChevronDown className="h-4 w-4" />
								</Button>
								<div className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
									{isLoadingQuote ? (
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-muted-foreground">
												Calculating...
											</span>
										</div>
									) : expectedAmount ? (
										expectedAmount.formatted
									) : (
										<span className="text-muted-foreground">0.0</span>
									)}
								</div>
							</div>
							{selectedTokenOut && (
								<div className="text-xs text-muted-foreground px-1">
									Balance: {selectedTokenOut.formattedBalance}{' '}
									{selectedTokenOut.symbol}
								</div>
							)}
						</div>

						{/* Price info and errors */}
						<div className="space-y-2">
							{selectedTokenIn &&
								selectedTokenOut &&
								expectedAmount &&
								swapAmount && (
									<div className="text-sm text-muted-foreground">
										1 {selectedTokenIn.symbol} ≈{' '}
										{(
											Number(expectedAmount.formatted) / Number(swapAmount)
										).toFixed(6)}{' '}
										{selectedTokenOut.symbol}
									</div>
								)}
							{quoteError && (
								<div className="text-sm text-destructive">
									Failed to get price quote. Please try again.
								</div>
							)}
						</div>
					</div>

					<DrawerFooter>
						<Button
							onClick={handleSwap}
							className="w-full"
							disabled={isSwapDisabled}>
							{swapMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Swapping...
								</>
							) : (
								`Swap ${selectedTokenIn?.symbol || ''} for ${selectedTokenOut?.symbol || ''}`
							)}
						</Button>
						<DrawerClose asChild>
							<Button variant="outline">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Token In Selector */}
			<TokenSelector
				open={isTokenInSelectorOpen}
				onOpenChange={setIsTokenInSelectorOpen}
				onSelect={handleTokenInSelect}
				selectedToken={selectedTokenIn}
			/>

			{/* Token Out Selector */}
			<TokenSelector
				open={isTokenOutSelectorOpen}
				onOpenChange={setIsTokenOutSelectorOpen}
				onSelect={handleTokenOutSelect}
				selectedToken={selectedTokenOut}
			/>
		</>
	)
}
