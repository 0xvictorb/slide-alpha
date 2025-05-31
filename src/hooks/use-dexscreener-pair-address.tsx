import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

interface DexScreenerPairAddressResponse {
	schemaVersion: string
	pairs: Array<{
		url: string
		pairAddress: string
		baseToken: {
			address: string
			name: string
			symbol: string
		}
		quoteToken: {
			symbol: string
		}
		priceNative: string
		priceUsd: string
		txns: {
			h24: {
				buys: number
				sells: number
			}
			h6: {
				buys: number
				sells: number
			}
			h1: {
				buys: number
				sells: number
			}
			m5: {
				buys: number
				sells: number
			}
		}
		volume: {
			h24: number
			h6: number
			h1: number
			m5?: number
		}
		priceChange: {
			h24: number
			h6: number
			h1: number
			m5?: number
		}
		liquidity: {
			usd: number
			base: number
			quote: number
		}
		fdv: number
		chainId?: string
		dexId?: string
		pairCreatedAt?: number
	}>
}

export const useGetDexScreenerPairAddress = (tokenAddresses: string[] = []) => {
	return useQuery({
		queryKey: ['dexscreener-pair-address', tokenAddresses.join(',')],
		queryFn: async () => {
			if (!tokenAddresses.length) return null

			const { data: pairsResponse } =
				await axios.get<DexScreenerPairAddressResponse>(
					`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses.join(',')}`
				)

			if (!pairsResponse) return null

			if (pairsResponse.pairs.length === 0) return null

			const suiPairs = pairsResponse.pairs.filter(
				(pair) => pair.chainId === 'sui'
			)
			const sortedPairs = suiPairs.sort((a, b) => b.volume.h24 - a.volume.h24)

			return sortedPairs[0].pairAddress
		},
		enabled: Boolean(tokenAddresses.length)
	})
}
