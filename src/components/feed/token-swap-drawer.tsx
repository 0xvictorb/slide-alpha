import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerFooter,
	DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
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
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import NumberFlow from '@number-flow/react'
import { USDC_ADDRESS } from '@/constants/common'
import { NumericInput } from '../ui/numeric-input'

interface TokenSwapDrawerProps {
	token: TokenBalance
	kolAddress: string
}

export const TokenSwapDrawer = NiceModal.create(
	({ token, kolAddress }: TokenSwapDrawerProps) => {
		const modal = useModal()
		const [swapAmount, setSwapAmount] = useState('')
		const [slippage, setSlippage] = useState(0.5)
		const [showSlippageSettings, setShowSlippageSettings] = useState(false)
		const { data: tokens } = useTokenBalances()

		const USDC_Token = tokens?.find((t) => t.type === USDC_ADDRESS)

		const [selectedTokenIn, setSelectedTokenIn] = useState<
			TokenBalance | undefined
		>(USDC_Token)
		const [selectedTokenOut, setSelectedTokenOut] = useState<
			TokenBalance | undefined
		>(token)

		const {
			data: expectedAmount,
			isLoading: isLoadingQuote,
			error: quoteError
		} = useGet7kExpectedAmount({
			tokenIn: selectedTokenIn?.type || '',
			tokenOut: selectedTokenOut?.type || '',
			amountIn: toDecimals(swapAmount || '0', selectedTokenIn?.decimals || 9)
		})

		const swapMutation = use7kSwap()

		const handleSwapAmountChange = (value: string) => {
			setSwapAmount(value)
		}

		const handleTokenInSelect = (tokenData: TokenData) => {
			const tokenBalance = tokens?.find((t) => t.type === tokenData.type)
			if (tokenBalance) {
				if (selectedTokenOut?.type === tokenBalance.type) {
					setSelectedTokenOut(undefined)
				}
				setSelectedTokenIn(tokenBalance)
			}
		}

		const handleTokenOutSelect = (tokenData: TokenData) => {
			const tokenBalance = tokens?.find((t) => t.type === tokenData.type)

			if (tokenBalance) {
				if (selectedTokenIn?.type === tokenBalance.type) {
					setSelectedTokenIn(undefined)
				}
				setSelectedTokenOut(tokenBalance)
			}
		}

		const handleSwapDirection = () => {
			const tempToken = selectedTokenIn
			setSelectedTokenIn(selectedTokenOut)
			setSelectedTokenOut(tempToken)
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
					amountIn: toDecimals(
						swapAmount || '0',
						selectedTokenIn?.decimals || 9
					),
					slippage: slippage / 100,
					kolAddress
				})

				toast.success('Swap completed successfully!')
				modal.remove()
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

		useEffect(() => {
			if (!modal.visible) {
				setSwapAmount('')
				setShowSlippageSettings(false)
			}
		}, [modal.visible])

		useEffect(() => {
			if (tokens && tokens.length > 0 && !selectedTokenIn) {
				const initialToken = tokens[0]
				if (initialToken.type !== token.type) {
					setSelectedTokenIn(initialToken)
				} else if (tokens[1]) {
					setSelectedTokenIn(tokens[1])
				}
			}
		}, [tokens, selectedTokenIn, token.type])

		useEffect(() => {
			setSelectedTokenOut(token)
		}, [token])

		return (
			<Drawer
				open={modal.visible}
				onOpenChange={(open) => (open ? modal.show() : modal.hide())}>
				<DrawerContent className="max-h-[95vh] bg-background max-w-[780px] mx-auto">
					<DrawerHeader className="border-b border-border/20 backdrop-blur-sm px-6 py-4">
						<DrawerTitle>
							<h2 className="text-lg text-center font-bold mb-4">
								Swap Tokens
							</h2>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div className="relative flex items-center gap-0">
										{selectedTokenIn && (
											<Avatar className="size-10 ring-2 ring-background">
												<AvatarImage
													src={selectedTokenIn.iconUrl}
													alt={selectedTokenIn.symbol}
												/>
												<AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
													{selectedTokenIn.symbol?.charAt(0)}
												</AvatarFallback>
											</Avatar>
										)}
										{selectedTokenOut && (
											<Avatar className="-ml-2 size-10 ring-2 ring-background">
												<AvatarImage
													src={selectedTokenOut.iconUrl}
													alt={selectedTokenOut.symbol}
												/>
												<AvatarFallback className="bg-secondary/80 text-secondary-foreground font-bold text-sm">
													{selectedTokenOut.symbol?.charAt(0)}
												</AvatarFallback>
											</Avatar>
										)}
									</div>
									<div className="space-y-0.5">
										<h2 className="text-lg font-bold flex items-center gap-2">
											{selectedTokenIn?.symbol} → {selectedTokenOut?.symbol}
										</h2>
										{selectedTokenIn &&
											selectedTokenOut &&
											expectedAmount &&
											swapAmount && (
												<p className="text-sm text-muted-foreground">
													1 {selectedTokenIn.symbol} ≈{' '}
													<NumberFlow
														value={
															Number(expectedAmount.formatted) /
															Number(swapAmount)
														}
														format={{
															minimumFractionDigits: 2,
															maximumFractionDigits: 6
														}}
													/>{' '}
													{selectedTokenOut.symbol}
												</p>
											)}
									</div>
								</div>
								<Button
									variant="secondary"
									size="icon"
									onClick={() => setShowSlippageSettings(!showSlippageSettings)}
									className="h-8 w-8 -mt-1">
									<Settings className="h-4 w-4" />
								</Button>
							</div>
						</DrawerTitle>
					</DrawerHeader>

					<ScrollArea className="flex-1 h-[calc(95vh-180px)]">
						<div className="px-4 py-6 space-y-4">
							{showSlippageSettings && (
								<Card className="border-dashed">
									<CardContent className="space-y-3 p-4">
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
									</CardContent>
								</Card>
							)}

							<Card className="bg-white">
								<CardContent className="p-4 space-y-2">
									<Label className="block">You Pay</Label>
									<div className="flex gap-3">
										<Button
											variant="neutral"
											className="w-[130px]"
											onClick={() =>
												NiceModal.show(TokenSelector, {
													onSelect: handleTokenInSelect,
													selectedToken: selectedTokenIn
												})
											}>
											<div className="flex items-center gap-2">
												{selectedTokenIn?.iconUrl && (
													<img
														src={selectedTokenIn.iconUrl}
														alt={selectedTokenIn.symbol}
														className="w-5 h-5 rounded-full"
													/>
												)}
												<span>{selectedTokenIn?.symbol || 'Select'}</span>
											</div>
											<ChevronDown className="h-4 w-4 text-muted-foreground" />
										</Button>
										<NumericInput
											placeholder="0.0"
											value={swapAmount}
											onChange={(value) => handleSwapAmountChange(value)}
											className="flex-1 h-[42px] shadow-shadow bg-white text-base"
										/>
									</div>
									{selectedTokenIn && (
										<div className="text-xs text-neutral-500 flex items-center justify-between">
											<span>
												Balance: {selectedTokenIn.formattedBalance}{' '}
												{selectedTokenIn.symbol}
											</span>
											<Button
												variant="default"
												size="sm"
												className="h-6 text-xs"
												onClick={() =>
													setSwapAmount(selectedTokenIn.formattedBalance)
												}>
												Max
											</Button>
										</div>
									)}
								</CardContent>
							</Card>

							<div className="flex justify-center relative z-10">
								<Button
									variant="secondary"
									size="icon"
									onClick={handleSwapDirection}
									className="size-10">
									<ArrowUpDown className="h-4 w-4" />
								</Button>
							</div>

							<Card className="bg-white">
								<CardContent className="p-4 space-y-2">
									<Label className="block">You Receive</Label>
									<div className="flex gap-3">
										<Button
											key={selectedTokenOut?.type}
											variant="neutral"
											className="w-[130px]"
											onClick={() =>
												NiceModal.show(TokenSelector, {
													onSelect: handleTokenOutSelect,
													selectedToken: selectedTokenOut
												})
											}>
											<div className="flex items-center gap-2">
												{selectedTokenOut?.iconUrl && (
													<img
														src={selectedTokenOut.iconUrl}
														alt={selectedTokenOut.symbol}
														className="w-5 h-5 rounded-full"
													/>
												)}
												<span>{selectedTokenOut?.symbol || 'Select'}</span>
											</div>
											<ChevronDown className="h-4 w-4 text-muted-foreground" />
										</Button>
										<div className="flex-1 h-[42px] shadow-shadow rounded-md border-2 border-border bg-white px-3 py-2 text-base">
											{isLoadingQuote ? (
												<div className="flex items-center gap-2 justify-end">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span className="text-neutral-500 text-sm">
														Calculating...
													</span>
												</div>
											) : expectedAmount ? (
												expectedAmount.formatted
											) : (
												<span className="text-neutral-500">0.0</span>
											)}
										</div>
									</div>
									{selectedTokenOut && (
										<div className="text-xs text-neutral-500">
											Balance: {selectedTokenOut.formattedBalance}{' '}
											{selectedTokenOut.symbol}
										</div>
									)}
								</CardContent>
							</Card>

							{quoteError && (
								<div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
									Failed to get price quote. Please try again.
								</div>
							)}
						</div>
					</ScrollArea>

					<DrawerFooter className="p-4 border-t border-border/20">
						<Button
							onClick={handleSwap}
							size="lg"
							className="w-full h-12 text-base font-medium"
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
							<Button
								variant="neutral"
								size="lg"
								className="w-full h-12 text-base font-medium"
								onClick={() => modal.hide()}>
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		)
	}
)
