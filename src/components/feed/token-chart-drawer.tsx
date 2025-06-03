import { Loader2, BarChart3, ExternalLink } from 'lucide-react'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle
} from '@/components/ui/drawer'
import { useGetDexScreenerData } from '@/hooks/use-dexscreener-pair-address'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import type { TokenData } from '@/types/token'
import { SUI_ADDRESS, USDC_ADDRESS } from '@/constants/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { HugeiconsIcon } from '@hugeicons/react'
import { TradeDownIcon, TradeUpIcon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { TokenSwapDrawer } from './token-swap-drawer'
import { useTokenBalances } from '@/hooks/use-token-balances'

interface TokenChartDrawerProps {
	token: TokenData
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	kolAddress: string
}

function PriceChange({
	change
}: {
	change?: number
}) {
	const [displayChange, setDisplayChange] = useState(0)

	useEffect(() => {
		if (change) {
			setTimeout(() => {
				setDisplayChange(change)
			}, 1000)
		}
	}, [change])

	if (change === undefined || change === null) {
		return '0.00%'
	}
	const isPositive = change >= 0
	return (
		<NumberFlow
			value={displayChange}
			className={cn(isPositive ? 'text-green-500' : 'text-red-400')}
			prefix={isPositive ? '+' : ''}
			format={{
				style: 'percent',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}}
		/>
	)
}

function DelayedNumber({
	value,
	format
}: {
	value?: number
	format: {
		style: 'currency' | 'decimal' | 'percent'
		currency?: string
		notation?: 'standard' | 'compact'
		minimumFractionDigits?: number
		maximumFractionDigits?: number
	}
}) {
	const [displayValue, setDisplayValue] = useState(0)

	useEffect(() => {
		if (value) {
			setTimeout(() => {
				setDisplayValue(value)
			}, 1000)
		}
	}, [value])

	if (value === undefined || value === null) {
		return '0.00'
	}

	return <NumberFlow value={displayValue} format={format} />
}

// Stat Card Component for reusable metric display
function StatCard({
	label,
	value
}: {
	label: string
	value: string | ReactNode
}) {
	return (
		<Card className="h-full p-0">
			<CardContent className="p-4">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
						{label}
					</span>
				</div>
				<div className="space-y-1">
					<p className="text-lg font-bold">{value}</p>
				</div>
			</CardContent>
		</Card>
	)
}

// Token Header Component
function TokenHeader({
	token,
	bestPair,
	dexScreenerUrl,
	quoteToken
}: {
	token: TokenData
	bestPair: any
	dexScreenerUrl?: string
	baseToken?: TokenData
	quoteToken?: TokenData
}) {
	return (
		<div className="flex items-start justify-between">
			<div className="flex items-center gap-4">
				<div className="relative flex items-center gap-0">
					{/* Base Token Avatar */}
					<Avatar className="size-12 ring-2">
						<AvatarImage src={token.iconUrl} alt={token.name || token.symbol} />
						<AvatarFallback className="bg-primary/10 text-primary font-bold">
							{token.symbol?.charAt(0)}
						</AvatarFallback>
					</Avatar>

					{/* Quote Token Avatar (overlapping) */}
					{quoteToken && (
						<Avatar className="-ml-2 size-12 ring-2">
							<AvatarImage src={quoteToken.iconUrl} alt={quoteToken.symbol} />
							<AvatarFallback className="bg-secondary/80 text-secondary-foreground font-bold text-xs">
								{quoteToken.symbol?.charAt(0)}
							</AvatarFallback>
						</Avatar>
					)}
				</div>
				<div className="space-y-1">
					<h2 className="text-xl font-bold flex items-center gap-2">
						{token.name || token.symbol}
						{quoteToken && (
							<span className="text-lg text-muted-foreground font-normal">
								/ {quoteToken.symbol}
							</span>
						)}
					</h2>
					<p className="text-2xl font-bold flex items-center gap-2">
						{bestPair && (
							<DelayedNumber
								value={parseFloat(bestPair.priceUsd)}
								format={{
									style: 'currency',
									currency: 'USD',
									minimumFractionDigits: 2,
									maximumFractionDigits: 4
								}}
							/>
						)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{dexScreenerUrl && (
					<Button
						variant="secondary"
						size="sm"
						onClick={() => window.open(dexScreenerUrl, '_blank')}
						className="flex items-center gap-2">
						<ExternalLink className="w-4 h-4" />
						View on DexScreener
					</Button>
				)}
			</div>
		</div>
	)
}

// Trading Actions Component
function TradingActions({
	token,
	kolAddress
}: { token: TokenData; kolAddress: string }) {
	const { data: tokens } = useTokenBalances()
	const tokenWithBalance = tokens?.find((t) => t.type === token.type)

	const handleBuy = () => {
		if (!tokenWithBalance) return

		NiceModal.show(TokenSwapDrawer, {
			token: tokenWithBalance,
			kolAddress
		})
	}

	const handleSell = () => {
		if (!tokenWithBalance) return

		NiceModal.show(TokenSwapDrawer, {
			token: tokenWithBalance,
			kolAddress
		})
	}

	return (
		<div className="flex items-center gap-3">
			<Button
				variant="default"
				size="lg"
				className="flex-1 bg-green-400"
				onClick={handleBuy}>
				<HugeiconsIcon icon={TradeUpIcon} className="w-4 h-4 mr-2" />
				Buy {token.symbol}
			</Button>
			<Button
				variant="secondary"
				size="lg"
				className="flex-1 bg-red-400"
				onClick={handleSell}>
				<HugeiconsIcon icon={TradeDownIcon} className="w-4 h-4 mr-2" />
				Sell {token.symbol}
			</Button>
		</div>
	)
}

export function TokenChartDrawer({
	token,
	isOpen,
	onOpenChange,
	kolAddress
}: TokenChartDrawerProps) {
	const isSUI = token.type === SUI_ADDRESS
	const { data: tokens } = useTokenBalances()

	// Determine the token pair for DexScreener
	const tokenAddresses = isSUI
		? [SUI_ADDRESS, USDC_ADDRESS]
		: token.type === USDC_ADDRESS
			? [SUI_TYPE_ARG, token.type]
			: [token.type, SUI_TYPE_ARG]

	const { data: dexData, isLoading: isLoadingPair } =
		useGetDexScreenerData(tokenAddresses)

	const bestPair = dexData?.bestPair

	const inputToken = token
	const outputToken = tokens?.find(
		(t) =>
			t.type ===
			(tokenAddresses[0] === inputToken.type
				? tokenAddresses[1]
				: tokenAddresses[0])
	)

	return (
		<Drawer open={isOpen} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[95vh] bg-background max-w-[780px] mx-auto">
				<DrawerHeader className="border-b bg-card/50 backdrop-blur-sm p-6">
					<DrawerTitle>
						<TokenHeader
							token={token}
							bestPair={bestPair}
							dexScreenerUrl={dexData?.dexScreenerUrl || undefined}
							baseToken={inputToken}
							quoteToken={outputToken}
						/>
					</DrawerTitle>
				</DrawerHeader>

				<div className="flex-1 h-[calc(95vh-120px)] overflow-hidden">
					<ScrollArea className="h-full">
						<div className="space-y-6 p-6">
							{/* Market Stats Grid */}
							{bestPair && (
								<div className="grid grid-cols-4 gap-4">
									<StatCard
										label="24h Change"
										value={<PriceChange change={bestPair?.priceChange.h24} />}
									/>
									<StatCard
										label="1h Change"
										value={<PriceChange change={bestPair?.priceChange.h1} />}
									/>
									<StatCard
										label="Volume 24h"
										value={
											<DelayedNumber
												value={bestPair.volume.h24}
												format={{
													style: 'currency',
													currency: 'USD'
												}}
											/>
										}
									/>
									<StatCard
										label={bestPair.marketCap ? 'Market Cap' : 'FDV'}
										value={
											<DelayedNumber
												value={bestPair.marketCap || bestPair.fdv}
												format={{
													style: 'currency',
													currency: 'USD',
													notation: 'compact'
												}}
											/>
										}
									/>
								</div>
							)}

							{/* Chart Section */}
							<CardContent className="h-[500px] p-0">
								{isLoadingPair ? (
									<div className="flex flex-col items-center justify-center h-full space-y-4">
										<div className="relative">
											<Loader2 className="w-12 h-12 animate-spin text-primary" />
											<div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20" />
										</div>
										<div className="text-center space-y-2">
											<p className="text-lg font-medium">Loading Chart</p>
											<p className="text-sm text-muted-foreground">
												Fetching trading pair data...
											</p>
										</div>
									</div>
								) : !dexData?.dexScreenerUrl ? (
									<div className="flex flex-col items-center justify-center h-full space-y-4">
										<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
											<BarChart3 className="w-8 h-8 text-muted-foreground" />
										</div>
										<div className="text-center space-y-2">
											<p className="text-lg font-medium">
												No Trading Pair Found
											</p>
											<p className="text-sm text-muted-foreground">
												This token may not be actively traded yet
											</p>
										</div>
									</div>
								) : (
									<div className="relative h-full rounded-lg overflow-hidden">
										<iframe
											src={`${dexData.dexScreenerUrl}?embed=1&theme=dark&trades=0&info=0`}
											className="w-full h-full"
											title="Price Chart"
											style={{ border: 'none' }}
										/>
									</div>
								)}
							</CardContent>

							{/* Trading Actions */}
							<TradingActions token={token} kolAddress={kolAddress} />
						</div>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
