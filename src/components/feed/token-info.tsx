import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { LineChart, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { TokenChartDrawer } from './token-chart-drawer'

interface TokenInfoProps {
	tokenId: string
	className?: string
}

export function TokenInfo({ tokenId, className }: TokenInfoProps) {
	const [isChartOpen, setIsChartOpen] = useState(false)
	const { data: tokens } = useTokenBalances()
	const token = tokens?.find((t) => t.coinType === tokenId)

	if (!token) return null

	return (
		<>
			<Card
				className={className}
				role="button"
				onClick={() => setIsChartOpen(true)}>
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
						{token.usdPrice && (
							<Badge
								variant="secondary"
								className="ml-auto flex items-center gap-1">
								${token.usdPrice.toFixed(2)}
								<ArrowUpRight className="w-3 h-3" />
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2">
						<LineChart className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							Click to view chart and trade
						</span>
					</div>
				</CardContent>
			</Card>

			<TokenChartDrawer
				token={token}
				isOpen={isChartOpen}
				onOpenChange={setIsChartOpen}
			/>
		</>
	)
}
