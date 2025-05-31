import { Loader2 } from 'lucide-react'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle
} from '@/components/ui/drawer'
import { useGetDexScreenerPairAddress } from '@/hooks/use-dexscreener-pair-address'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import type { TokenBalance } from '@/types/token'
import { USDC_ADDRESS } from '@/constants/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface TokenChartDrawerProps {
	token: TokenBalance
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function TokenChartDrawer({
	token,
	isOpen,
	onOpenChange
}: TokenChartDrawerProps) {
	const [amount, setAmount] = useState('')
	const [activeTab, setActiveTab] = useState('buy')

	// Determine the token pair for DexScreener
	const tokenAddresses =
		token.type === SUI_TYPE_ARG
			? [token.type, USDC_ADDRESS]
			: token.type === USDC_ADDRESS
				? [SUI_TYPE_ARG, token.type]
				: [token.type, SUI_TYPE_ARG]

	const { data: pairAddress, isLoading: isLoadingPair } =
		useGetDexScreenerPairAddress(tokenAddresses)
	const dexScreenerPairUrl = pairAddress
		? `https://dexscreener.com/sui/${pairAddress}`
		: null

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// Implement buy/sell logic here
		console.log(`${activeTab.toUpperCase()} ${amount} ${token.symbol}`)
	}

	return (
		<Drawer open={isOpen} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[95vh]">
				<DrawerHeader className="border-b">
					<DrawerTitle className="flex items-center gap-3">
						{token.iconUrl && (
							<img
								src={token.iconUrl}
								alt={token.name || token.symbol}
								className="w-8 h-8 rounded-full"
							/>
						)}
						{token.name || token.symbol} Chart
					</DrawerTitle>
				</DrawerHeader>
				<div className="flex-1 h-[calc(95vh-80px)] flex flex-col">
					<div className="flex-1">
						{isLoadingPair ? (
							<div className="flex items-center justify-center h-full">
								<Loader2 className="w-8 h-8 animate-spin" />
							</div>
						) : !dexScreenerPairUrl ? (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								No trading pair found
							</div>
						) : (
							<iframe
								src={`${dexScreenerPairUrl}?embed=1&theme=dark&trades=0&info=0`}
								className="w-full h-full"
								title="Price Chart"
							/>
						)}
					</div>

					<Card className="mx-4 mb-4 mt-2">
						<CardContent className="p-4">
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="grid w-full grid-cols-2 mb-4">
									<TabsTrigger value="buy">Buy</TabsTrigger>
									<TabsTrigger value="sell">Sell</TabsTrigger>
								</TabsList>

								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<div className="flex items-center gap-2 mb-2">
											<Input
												type="number"
												placeholder={`Enter amount in ${token.symbol}`}
												value={amount}
												onChange={(e) => setAmount(e.target.value)}
												className="flex-1"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setAmount('0')}>
												Max
											</Button>
										</div>
										{token.usdValue && amount && (
											<p className="text-sm text-muted-foreground">
												≈ ${(parseFloat(amount) * token.usdValue).toFixed(2)}{' '}
												USD
											</p>
										)}
									</div>

									<Button
										type="submit"
										className="w-full"
										variant={activeTab === 'buy' ? 'default' : 'destructive'}>
										{activeTab === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
									</Button>
								</form>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
