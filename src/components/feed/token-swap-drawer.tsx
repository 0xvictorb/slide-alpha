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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
import type { TokenBalance } from '@/types/token'

interface TokenSwapDrawerProps {
	token: TokenBalance
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function TokenSwapDrawer({
	token,
	isOpen,
	onOpenChange
}: TokenSwapDrawerProps) {
	const [swapAmount, setSwapAmount] = useState('')
	const [receiveAmount, setReceiveAmount] = useState('')

	// TODO: Replace with actual token list from your token registry
	const availableTokens = [
		{ symbol: 'SUI', name: 'Sui', coinType: '0x2::sui::SUI' }
		// Add other available tokens here
	]

	const handleSwapAmountChange = (value: string) => {
		setSwapAmount(value)
		// TODO: Calculate receive amount based on price and slippage
		if (token.usdPrice && !isNaN(Number(value))) {
			const estimated = Number(value) / token.usdPrice
			setReceiveAmount(estimated.toFixed(6))
		} else {
			setReceiveAmount('')
		}
	}

	const handleSwap = async () => {
		// TODO: Implement actual swap logic
		console.log('Swap:', {
			tokenIn: 'SUI',
			tokenOut: token.type,
			amountIn: swapAmount,
			amountOut: receiveAmount
		})
	}

	return (
		<Drawer open={isOpen} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle className="flex items-center gap-2">
						{token.iconUrl && (
							<img
								src={token.iconUrl}
								alt={token.symbol}
								className="w-6 h-6 rounded-full"
							/>
						)}
						Swap {token.symbol}
					</DrawerTitle>
					<DrawerDescription>
						Trade tokens instantly with best price routing
					</DrawerDescription>
				</DrawerHeader>

				<div className="p-4 space-y-6">
					{/* Pay section */}
					<div className="space-y-2">
						<label className="text-sm font-medium">You Pay</label>
						<div className="flex gap-2">
							<Select defaultValue="SUI">
								<SelectTrigger className="w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{availableTokens.map((t) => (
										<SelectItem key={t.coinType} value={t.symbol}>
											{t.symbol}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								type="number"
								placeholder="0.0"
								value={swapAmount}
								onChange={(e) => handleSwapAmountChange(e.target.value)}
								className="flex-1"
							/>
						</div>
					</div>

					<div className="flex justify-center">
						<ArrowDown className="w-6 h-6 text-muted-foreground" />
					</div>

					{/* Receive section */}
					<div className="space-y-2">
						<label className="text-sm font-medium">You Receive</label>
						<div className="flex gap-2">
							<div className="w-[140px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
								{token.symbol}
							</div>
							<Input
								type="number"
								placeholder="0.0"
								value={receiveAmount}
								readOnly
								className="flex-1"
							/>
						</div>
					</div>

					{/* Price info */}
					{token.usdPrice && (
						<div className="text-sm text-muted-foreground">
							1 {token.symbol} ≈ ${token.usdPrice.toFixed(2)}
						</div>
					)}
				</div>

				<DrawerFooter>
					<Button onClick={handleSwap} className="w-full">
						Swap
					</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
