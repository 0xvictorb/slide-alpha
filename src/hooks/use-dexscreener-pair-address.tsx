import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

interface DexScreenerPair {
	url: string
	pairAddress: string
	baseToken: {
		address: string
		name: string
		symbol: string
	}
	quoteToken: {
		address: string
		name: string
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
		h24?: number
		h6?: number
		h1?: number
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
	marketCap?: number
	info?: {
		imageUrl?: string
		header?: string
		openGraph?: string
		websites?: Array<{
			label: string
			url: string
		}>
		socials?: Array<{
			type: string
			url: string
		}>
	}
}

interface DexScreenerPairAddressResponse {
	schemaVersion: string
	pairs: DexScreenerPair[]
}

export interface DexScreenerData {
	bestPair: DexScreenerPair | null
	allPairs: DexScreenerPair[]
	pairAddress: string | null
	dexScreenerUrl: string | null
}

export const useGetDexScreenerData = (tokenAddresses: string[] = []) => {
	return useQuery({
		queryKey: ['dexscreener-data', tokenAddresses.join(',')],
		queryFn: async (): Promise<DexScreenerData | null> => {
			if (!tokenAddresses.length) return null

			const { data: pairsResponse } =
				await axios.get<DexScreenerPairAddressResponse>(
					`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses.join(',')}`
				)

			if (!pairsResponse || pairsResponse.pairs.length === 0) return null

			const suiPairs = pairsResponse.pairs.filter(
				(pair) => pair.chainId === 'sui'
			)

			if (suiPairs.length === 0) return null

			// Filter pairs to ensure they contain the correct token addresses
			const correctPairs = suiPairs.filter((pair) => {
				const baseAddress = pair.baseToken.address
				const quoteAddress = pair.quoteToken.address

				// Check if this pair contains both of our target tokens
				return (
					baseAddress === tokenAddresses[0] &&
					quoteAddress === tokenAddresses[1]
				)
			})

			if (correctPairs.length === 0) {
				// Fallback: if no exact matches, use any SUI pair but log this
				console.warn(
					'No exact token pair match found, using highest volume SUI pair'
				)
				const sortedPairs = suiPairs.sort((a, b) => b.volume.h24 - a.volume.h24)
				const bestPair = sortedPairs[0]

				return {
					bestPair,
					allPairs: suiPairs,
					pairAddress: bestPair.pairAddress,
					dexScreenerUrl: bestPair.url
				}
			}

			// Sort the correct pairs by volume to get the most liquid one
			const sortedCorrectPairs = correctPairs.sort(
				(a, b) => b.volume.h24 - a.volume.h24
			)
			const bestPair = sortedCorrectPairs[0]

			return {
				bestPair,
				allPairs: correctPairs,
				pairAddress: bestPair.pairAddress,
				dexScreenerUrl: bestPair.url
			}
		},
		enabled: Boolean(tokenAddresses.length)
	})
}

// Keep the old hook for backward compatibility
export const useGetDexScreenerPairAddress = (tokenAddresses: string[] = []) => {
	const { data, ...rest } = useGetDexScreenerData(tokenAddresses)
	return {
		data: data?.pairAddress || null,
		...rest
	}
}
