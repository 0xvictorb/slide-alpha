import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

interface TokenPriceChange {
	type: string
	price: number
	change24h: number
	source: string
}

interface TokenPriceChangeResponse {
	[tokenType: string]: TokenPriceChange
}

const TURBOS_API_BASE_URL = 'https://api.turbos.finance'

const priceApi = axios.create({
	baseURL: TURBOS_API_BASE_URL,
	timeout: 10000, // 10s timeout
	headers: {
		accept: 'application/json',
		'api-version': 'v2',
		origin: window.location.origin
	}
})

const fetchTokenPriceChanges = async (
	tokenTypes: string[]
): Promise<TokenPriceChangeResponse> => {
	const responses = await Promise.all(
		tokenTypes.map((type) =>
			priceApi.get<TokenPriceChange>('/price', {
				params: { coinType: type }
			})
		)
	)

	return responses.reduce((acc, { data }, index) => {
		acc[tokenTypes[index]] = data
		return acc
	}, {} as TokenPriceChangeResponse)
}

export const useTokenPriceChanges = (
	tokenTypes: string[],
	refreshInterval = 60000 // Default 60s refresh
) => {
	return useQuery({
		queryKey: ['tokenPriceChanges', tokenTypes],
		queryFn: () => fetchTokenPriceChanges(tokenTypes),
		refetchInterval: refreshInterval,
		staleTime: refreshInterval / 2,
		retry: 3, // Retry failed requests 3 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		enabled: tokenTypes.length > 0
	})
}
