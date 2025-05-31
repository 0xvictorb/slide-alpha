import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { TokenData } from '../types/token'

export function useTokens() {
	const tokens = useConvexQuery(api.tokens.getTokens)

	const getTokenByType = (type: string): TokenData | undefined => {
		return tokens?.find((token: TokenData) => token.type === type)
	}

	const getTokenBySymbol = (symbol: string): TokenData | undefined => {
		return tokens?.find(
			(token: TokenData) => token.symbol.toLowerCase() === symbol.toLowerCase()
		)
	}

	const getVerifiedTokens = (): TokenData[] => {
		return tokens?.filter((token: TokenData) => token.verified) ?? []
	}

	// Sort tokens by verified status with SUI prioritized at the top
	const sortedTokens =
		tokens?.sort((a: TokenData, b: TokenData) => {
			// SUI always comes first
			if (a.symbol.toLowerCase() === 'sui') return -1
			if (b.symbol.toLowerCase() === 'sui') return 1

			// Then sort by verified status (verified first)
			if (a.verified && !b.verified) return -1
			if (!a.verified && b.verified) return 1

			// If both have same verified status, sort alphabetically by symbol
			return a.symbol.localeCompare(b.symbol)
		}) ?? []

	const verifiedTokens = sortedTokens.filter(
		(token: TokenData) => token.verified
	)

	return {
		tokens: sortedTokens,
		verifiedTokens,
		isLoading: tokens === undefined,
		error: null,
		getTokenByType,
		getTokenBySymbol,
		getVerifiedTokens
	}
}
