import { Button } from '@/components/ui/button'
import { useTokenPriceChanges } from '@/hooks/use-token-price-changes'
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TokenChartDrawer } from './token-chart-drawer'
import { TokenSwapDrawer } from './token-swap-drawer'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Typography } from '@/components/ui/typography'
import NumberFlow from '@number-flow/react'
import { useTokensFiatPrice } from '@/hooks/use-tokens-fiat-price'
import { useTokenBalances } from '@/hooks/use-token-balances'
import NiceModal from '@ebay/nice-modal-react'

interface TokenInfoProps {
	tokenId: string
	className?: string
	kolAddress: string
}

export function TokenInfo({ tokenId, className, kolAddress }: TokenInfoProps) {
	const [isChartOpen, setIsChartOpen] = useState(false)
	const { data: tokens } = useTokenBalances()
	const { data: priceChanges } = useTokenPriceChanges([tokenId])
	const displayToken = tokens?.find((t) => t.type === tokenId)
	const priceChange = priceChanges?.[tokenId]?.change24h ?? 0
	const { data: tokenPrices } = useTokensFiatPrice([tokenId])
	const tokenPrice =
		(displayToken && tokenPrices?.[displayToken.symbol]?.price) || 0

	const [displayPrice, setDisplayPrice] = useState(tokenPrice)

	useEffect(() => {
		if (tokenPrice) {
			setTimeout(() => {
				setDisplayPrice(tokenPrice)
			}, 700)
		}
	}, [tokenPrice])

	const handleSwapClick = () => {
		if (displayToken) {
			NiceModal.show(TokenSwapDrawer, {
				token: displayToken,
				kolAddress
			})
		}
	}

	if (!displayToken) return null

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
							{displayToken.iconUrl && (
								<img
									src={displayToken.iconUrl}
									alt={displayToken.name || displayToken.symbol}
									className="w-8 h-8 rounded-base flex-shrink-0"
								/>
							)}
							<div className="flex-1 min-w-0">
								<h3 className="font-heading text-sm text-foreground truncate mb-1 max-w-[150px]">
									{displayToken.name || displayToken.symbol}
								</h3>
								<p className="text-xs text-foreground/60">
									{displayToken.symbol}
								</p>
							</div>
						</div>

						{tokenPrice > 0 && (
							<div className="text-left flex-shrink-0">
								<Typography variant="body1">
									$
									<NumberFlow
										value={displayPrice}
										className="text-foreground font-medium mb-0.5"
									/>
								</Typography>
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
						<Button variant="default" size="sm" onClick={handleSwapClick}>
							Buy {displayToken.symbol}
						</Button>
					</div>
				</Card>
			</motion.div>

			<TokenChartDrawer
				token={displayToken}
				isOpen={isChartOpen}
				onOpenChange={setIsChartOpen}
				kolAddress={kolAddress}
			/>
		</>
	)
}
