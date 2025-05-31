import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fromDecimals } from '@/lib/number'
import { useTokensFiatPrice } from './use-tokens-fiat-price'
import { getCoinMetadata } from '@/lib/sui'

export interface TokenBalance {
	symbol: string
	balance: string
	coinType: string
	name?: string
	decimals?: number
	iconUrl?: string
	usdPrice?: number
	usdValue?: number
	formattedBalance?: string
}

async function getAllTokenBalances(
	client: SuiClient,
	address: string
): Promise<TokenBalance[]> {
	const allCoins = await client.getAllCoins({
		owner: address
	})

	const balanceMap = new Map<string, bigint>()
	allCoins.data.forEach((coin) => {
		const current = balanceMap.get(coin.coinType) || BigInt(0)
		balanceMap.set(coin.coinType, current + BigInt(coin.balance))
	})

	return Array.from(balanceMap.entries()).map(([coinType, balance]) => ({
		symbol: coinType.split('::').pop() || coinType,
		balance: balance.toString(),
		coinType
	}))
}

export function useTokenBalances() {
	const account = useCurrentAccount()
	const client = useSuiClient()

	const balancesQuery = useQuery({
		queryKey: ['token-balances', account?.address],
		queryFn: () =>
			account?.address ? getAllTokenBalances(client, account.address) : [],
		enabled: !!account?.address
	})

	const { data: tokenPrices } = useTokensFiatPrice(
		balancesQuery.data?.map((b) => b.coinType) || []
	)

	const metadataQueries = useQueries({
		queries: (balancesQuery.data || []).map((balance) => ({
			queryKey: ['coin-metadata', balance.coinType],
			queryFn: () => getCoinMetadata(client, balance.coinType),
			staleTime: 60 * 60 * 1000,
			cacheTime: 60 * 60 * 1000
		}))
	})

	const balancesWithMetadata = balancesQuery.data?.map((balance, index) => {
		const metadata = metadataQueries[index]?.data
		const formattedBalance = fromDecimals(balance.balance, metadata?.decimals)
		const usdPrice = tokenPrices?.[balance.symbol]?.price
		const usdValue = usdPrice ? Number(formattedBalance) * usdPrice : undefined

		return {
			...balance,
			formattedBalance,
			iconUrl: metadata?.iconUrl,
			name: metadata?.name,
			decimals: metadata?.decimals,
			usdPrice,
			usdValue
		}
	})

	return {
		data: balancesWithMetadata
			?.filter((b) => b.balance && Number(b.balance) > 0)
			.sort((a, b) => Number(b.usdValue || 0) - Number(a.usdValue || 0)),
		isLoading:
			balancesQuery.isLoading || metadataQueries.some((q) => q.isLoading),
		isError: balancesQuery.isError || metadataQueries.some((q) => q.isError)
	}
}
