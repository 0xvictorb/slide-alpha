import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { useTokenPriceChanges } from '@/hooks/use-token-price-changes'
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { TokenChartDrawer } from './token-chart-drawer'
import { TokenSwapDrawer } from './token-swap-drawer'

interface TokenInfoProps {
	tokenId: string
	className?: string
	kolAddress: string
}

export function TokenInfo({ tokenId, className, kolAddress }: TokenInfoProps) {
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
			<div
				className={`bg-black/10 backdrop-blur-sm border border-white/10 rounded-lg w-fit ${className}`}>
				<div className="flex items-center justify-between p-3 space-y-2">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							{token.iconUrl && (
								<img
									src={token.iconUrl}
									alt={token.name || token.symbol}
									className="w-6 h-6 rounded-full flex-shrink-0"
								/>
							)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h3 className="font-medium text-sm truncate">
										{token.name || token.symbol}
									</h3>
									<Badge
										variant="outline"
										className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300 text-xs px-1.5 py-0">
										⭐ Promoted
									</Badge>
								</div>
								<p className="text-xs text-white/50">{token.symbol}</p>
							</div>
						</div>
						{displayPrice > 0 && (
							<div className="text-right flex-shrink-0">
								<Badge
									variant="secondary"
									className="bg-white/10 text-white border-white/20 text-xs h-5 px-2 mb-1">
									${displayPrice.toFixed(2)}
								</Badge>
								<div
									className={`text-xs flex items-center justify-end gap-1 ${priceChangeColor}`}>
									<PriceIcon className="w-3 h-3" />
									{Math.abs(priceChange).toFixed(2)}%
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-1 text-xs h-7 px-2 bg-white/5 hover:bg-white/10 border border-white/10"
							onClick={() => setIsChartOpen(true)}>
							<LineChart className="w-3 h-3" />
							Chart
						</Button>
						<Button
							variant="default"
							size="sm"
							className="text-xs h-7 bg-white text-black hover:bg-white/90"
							onClick={() => setIsSwapOpen(true)}>
							Buy {token.symbol}
						</Button>
					</div>
				</div>
			</div>

			<TokenChartDrawer
				token={token}
				isOpen={isChartOpen}
				onOpenChange={setIsChartOpen}
			/>

			<TokenSwapDrawer
				token={token}
				isOpen={isSwapOpen}
				onOpenChange={setIsSwapOpen}
				kolAddress={kolAddress}
			/>
		</>
	)
}
