import { Loader2 } from 'lucide-react'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle
} from '@/components/ui/drawer'
import { useGetDexScreenerPairAddress } from '@/hooks/use-dexscreener-pair-address'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import type { TokenBalance } from '@/hooks/use-token-balances'
import { USDC_ADDRESS } from '@/constants/common'

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
	// Determine the token pair for DexScreener
	const tokenAddresses =
		token.coinType === SUI_TYPE_ARG
			? [token.coinType, USDC_ADDRESS]
			: token.coinType === USDC_ADDRESS
				? [SUI_TYPE_ARG, token.coinType]
				: [token.coinType, SUI_TYPE_ARG]

	const { data: pairAddress, isLoading: isLoadingPair } =
		useGetDexScreenerPairAddress(tokenAddresses)
	const dexScreenerPairUrl = pairAddress
		? `https://dexscreener.com/sui/${pairAddress}`
		: null

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
				<div className="flex-1 h-[calc(95vh-80px)]">
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
			</DrawerContent>
		</Drawer>
	)
}
