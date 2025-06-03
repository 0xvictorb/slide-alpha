import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { useQuery } from '@tanstack/react-query'
import { fromDecimals } from '@/lib/number'
import { useTokensFiatPrice } from './use-tokens-fiat-price'
import type { TokenBalance } from '@/types/token'
import { SUI_ADDRESS } from '@/constants/common'
import { api } from '@convex/_generated/api'
import { useQuery as useConvexQuery } from 'convex/react'

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
		coinType,
		balance: balance.toString()
	}))
}

export function useTokenBalances() {
	const account = useCurrentAccount()
	const client = useSuiClient()
	const tokens = useConvexQuery(api.tokens.getTokens)

	const balancesQuery = useQuery({
		queryKey: ['token-balances', account?.address],
		queryFn: () =>
			account?.address ? getAllTokenBalances(client, account.address) : [],
		enabled: !!account?.address
	})

	const { data: tokenPrices } = useTokensFiatPrice(
		balancesQuery.data?.map((b) => b.coinType) || []
	)

	// const metadataQueries = useQueries({
	// 	queries: (balancesQuery.data || []).map((balance) => ({
	// 		queryKey: ['coin-metadata', balance.coinType],
	// 		queryFn: () => getCoinMetadata(client, balance.coinType),
	// 		staleTime: 60 * 60 * 1000,
	// 		cacheTime: 60 * 60 * 1000
	// 	}))
	// })

	const tokensWithBalances = tokens
		?.map((token) => {
			const balanceData = balancesQuery.data?.find(
				(b) => b.coinType === token.type
			)
			const formattedBalance =
				fromDecimals(balanceData?.balance || '0', token?.decimals || 0) || '0'
			const usdPrice = tokenPrices?.[token.symbol]?.price || 0
			const usdValue =
				usdPrice && Number(formattedBalance) > 0
					? Number(formattedBalance) * Number(usdPrice)
					: 0

			return {
				...token,
				// ...metadataQueries[index]?.data,
				// iconUrl: metadataQueries[index]?.data?.iconUrl || token.iconUrl,
				balance: balanceData?.balance || '0',
				formattedBalance,
				usdValue,
				usdPrice
			} satisfies TokenBalance
		})
		?.sort((a, b) => {
			// Verified SUI first
			const isSUIA = a.type === SUI_ADDRESS
			const isSUIB = b.type === SUI_ADDRESS

			if (isSUIA && !isSUIB) return -1
			if (!isSUIA && isSUIB) return 1

			// Then tokens with balances (non-zero)
			const hasBalanceA = Number(a.formattedBalance) > 0
			const hasBalanceB = Number(b.formattedBalance) > 0

			if (hasBalanceA && !hasBalanceB) return -1
			if (!hasBalanceA && hasBalanceB) return 1

			// If both have balances, sort by USD value descending
			if (hasBalanceA && hasBalanceB) {
				return (b.usdValue || 0) - (a.usdValue || 0)
			}

			// Finally, sort alphabetically by symbol
			return a.symbol.localeCompare(b.symbol)
		})

	return {
		data: tokensWithBalances,
		isLoading: balancesQuery.isLoading,
		isError: balancesQuery.isError
	}
}
