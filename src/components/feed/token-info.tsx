import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { useTokenPriceChanges } from '@/hooks/use-token-price-changes'
import { LineChart, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { TokenChartDrawer } from './token-chart-drawer'
import { TokenSwapDrawer } from './token-swap-drawer'

interface TokenInfoProps {
	tokenId: string
	className?: string
}

export function TokenInfo({ tokenId, className }: TokenInfoProps) {
	const [isChartOpen, setIsChartOpen] = useState(false)
	const [isSwapOpen, setIsSwapOpen] = useState(false)
	const { data: tokens } = useTokenBalances()
	const { data: priceChanges } = useTokenPriceChanges([tokenId])
	const token = tokens?.find((t) => t.type === tokenId)
	const priceChange = priceChanges?.[tokenId]?.change24h ?? 0

	if (!token) return null

	const displayPrice = token.usdPrice || 0
	const priceChangeColor = priceChange >= 0 ? 'text-green-500' : 'text-red-500'
	const PriceIcon = priceChange >= 0 ? TrendingUp : TrendingDown

	return (
		<>
			<Card className={className}>
				<CardContent className="p-4 space-y-4">
					<div className="flex items-center gap-3">
						{token.iconUrl && (
							<img
								src={token.iconUrl}
								alt={token.name || token.symbol}
								className="w-8 h-8 rounded-full"
							/>
						)}
						<div>
							<h3 className="font-semibold">{token.name || token.symbol}</h3>
							<p className="text-sm text-muted-foreground">{token.symbol}</p>
						</div>
						{displayPrice > 0 && (
							<div className="ml-auto text-right">
								<Badge
									variant="secondary"
									className="flex items-center gap-1 mb-1">
									${displayPrice.toFixed(2)}
									<ArrowUpRight className="w-3 h-3" />
								</Badge>
								<div
									className={`text-xs flex items-center gap-1 ${priceChangeColor}`}>
									<PriceIcon className="w-3 h-3" />
									{Math.abs(priceChange).toFixed(2)}%
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center justify-between gap-2">
						<Button
							variant="ghost"
							className="flex items-center gap-2"
							onClick={() => setIsChartOpen(true)}>
							<LineChart className="w-4 h-4" />
							View Chart
						</Button>
						<Button
							variant="default"
							className="flex-1"
							onClick={() => setIsSwapOpen(true)}>
							Buy {token.symbol}
						</Button>
					</div>
				</CardContent>
			</Card>

			<TokenChartDrawer
				token={token}
				isOpen={isChartOpen}
				onOpenChange={setIsChartOpen}
			/>

			<TokenSwapDrawer
				token={token}
				isOpen={isSwapOpen}
				onOpenChange={setIsSwapOpen}
			/>
		</>
	)
}
