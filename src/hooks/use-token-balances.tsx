import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fromDecimals } from '@/lib/number'
import { useTokens } from './use-tokens'
import { useTokensFiatPrice } from './use-tokens-fiat-price'
import { getCoinMetadata } from '@/lib/sui'
import type { TokenBalance } from '@/types/token'
import { SUI_ADDRESS, SUI_FULL_ADDRESS } from '@/constants/common'

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
		coinType: coinType === SUI_ADDRESS ? SUI_FULL_ADDRESS : coinType,
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

	const tokensWithBalances = tokens
		?.map((token, index) => {
			const isSUI =
				token.type === SUI_FULL_ADDRESS || token.type === SUI_ADDRESS

			const balance = balancesQuery.data?.find(
				(b) =>
					b.coinType === token.type ||
					(isSUI &&
						(b.coinType === SUI_FULL_ADDRESS || b.coinType === SUI_ADDRESS))
			)
			const formattedBalance =
				fromDecimals(balance?.balance || '0', token?.decimals || 0) || '0'
			const usdPrice = tokenPrices?.[token.symbol]?.price || 0
			const usdValue =
				usdPrice && Number(formattedBalance) > 0
					? Number(formattedBalance) * Number(usdPrice)
					: 0

			return {
				...token,
				...metadataQueries[index]?.data,
				iconUrl: metadataQueries[index]?.data?.iconUrl || token.iconUrl,
				balance: balance?.balance || '0',
				formattedBalance,
				usdValue,
				usdPrice
			} satisfies TokenBalance
		})
		?.sort((a, b) => {
			// Verified SUI first
			const isSUIA = a.type === SUI_FULL_ADDRESS || a.type === SUI_ADDRESS
			const isSUIB = b.type === SUI_FULL_ADDRESS || b.type === SUI_ADDRESS

			if (isSUIA && !isSUIB) return -1
			if (!isSUIA && isSUIB) return 1
			if (isSUIA && isSUIB) return 0

			// Then tokens with balances (non-zero)
			const hasBalanceA = Number(a.formattedBalance) > 0
			const hasBalanceB = Number(b.formattedBalance) > 0

			if (hasBalanceA && !hasBalanceB) return -1
			if (!hasBalanceA && hasBalanceB) return 1

			// If both have balances, sort by USD value descending
			if (hasBalanceA && hasBalanceB) {
				return (b.usdValue || 0) - (a.usdValue || 0)
			}

			// Then verified tokens without balances
			const isVerifiedA = a.verified || false
			const isVerifiedB = b.verified || false

			if (isVerifiedA && !isVerifiedB) return -1
			if (!isVerifiedA && isVerifiedB) return 1

			// Finally, sort alphabetically by symbol
			return a.symbol.localeCompare(b.symbol)
		})

	return {
		data: tokensWithBalances,
		isLoading: balancesQuery.isLoading,
		isError: balancesQuery.isError
	}
}
