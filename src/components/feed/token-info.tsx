import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { useTokenPriceChanges } from '@/hooks/use-token-price-changes'
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { TokenChartDrawer } from './token-chart-drawer'
import { TokenSwapDrawer } from './token-swap-drawer'
import { Card } from '../ui/card'
import { motion } from 'framer-motion'

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
	const priceChangeColor = priceChange >= 0 ? 'text-chart-1' : 'text-chart-4'
	const PriceIcon = priceChange >= 0 ? TrendingUp : TrendingDown

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-50px' }}
				transition={{ duration: 0.4, ease: 'easeOut' }}>
				<Card
					className={`bg-secondary-background flex flex-row items-center justify-between border-2 border-border rounded-base p-4 shadow-shadow ${className}`}>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							{token.iconUrl && (
								<img
									src={token.iconUrl}
									alt={token.name || token.symbol}
									className="w-8 h-8 rounded-base flex-shrink-0"
								/>
							)}
							<div className="flex-1 min-w-0">
								<h3 className="font-heading text-sm text-foreground truncate mb-1">
									{token.name || token.symbol}
								</h3>
								<p className="text-xs text-foreground/60">{token.symbol}</p>
							</div>
						</div>

						{displayPrice > 0 && (
							<div className="text-right flex-shrink-0">
								<Badge variant="neutral" className="mb-2">
									${displayPrice.toFixed(2)}
								</Badge>
								<div
									className={`text-xs flex items-center justify-end gap-1 ${priceChangeColor} font-base`}>
									<PriceIcon className="w-3 h-3" />
									{Math.abs(priceChange).toFixed(2)}%
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="neutral"
							size="sm"
							className="flex items-center gap-2"
							onClick={() => setIsChartOpen(true)}>
							<LineChart className="w-4 h-4" />
							Chart
						</Button>
						<Button
							variant="default"
							size="sm"
							onClick={() => setIsSwapOpen(true)}>
							Buy {token.symbol}
						</Button>
					</div>
				</Card>
			</motion.div>

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
