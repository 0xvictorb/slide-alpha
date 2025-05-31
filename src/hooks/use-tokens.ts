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

	return {
		tokens: tokens ?? [],
		isLoading: tokens === undefined,
		error: null,
		getTokenByType,
		getTokenBySymbol,
		getVerifiedTokens
	}
}
