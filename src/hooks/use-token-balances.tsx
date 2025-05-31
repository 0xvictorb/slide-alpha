import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fromDecimals } from '@/lib/number'
import { useTokens } from './use-tokens'
import { useTokensFiatPrice } from './use-tokens-fiat-price'
import { getCoinMetadata } from '@/lib/sui'
import type { TokenBalance } from '@/types/token'

async function getAllTokenBalances(client: SuiClient, address: string) {
	const allCoins = await client.getAllCoins({
		owner: address
	})

	const balanceMap = new Map<string, bigint>()
	allCoins.data.forEach((coin) => {
		const current = balanceMap.get(coin.coinType) || BigInt(0)
		balanceMap.set(coin.coinType, current + BigInt(coin.balance))
	})

	return Array.from(balanceMap.entries()).map(([coinType, balance]) => ({
		coinType: coinType.split('::').pop() || coinType,
		balance: balance.toString()
	}))
}

export function useTokenBalances() {
	const account = useCurrentAccount()
	const client = useSuiClient()
	const { tokens } = useTokens()

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

	const tokensWithBalances = tokens?.map((token, index) => {
		const balance = balancesQuery.data?.find((b) => b.coinType === token.type)
		const formattedBalance =
			fromDecimals(balance?.balance || '0', token?.decimals || 0) || '0'
		const usdPrice = tokenPrices?.[index]?.price
		const usdValue = usdPrice
			? Number(formattedBalance) * Number(usdPrice)
			: undefined

		return {
			...token,
			...metadataQueries[index]?.data,
			iconUrl: metadataQueries[index]?.data?.iconUrl || token.iconUrl,
			balance: balance?.balance || '0',
			formattedBalance,
			usdValue: usdValue || 0,
			usdPrice: usdPrice || 0
		} satisfies TokenBalance
	})

	return {
		data: tokensWithBalances,
		isLoading: balancesQuery.isLoading,
		isError: balancesQuery.isError
	}
}
