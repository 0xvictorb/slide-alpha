export interface TokenData {
	name: string
	symbol: string
	type: string
	decimals: number
	iconUrl?: string
	verified?: boolean
	lastUpdated: number
}

export type TokenFilter = 'MEME' | 'VERIFIED' | 'ALL'

export interface TokenResponse {
	data: {
		getAllVerifiedCoins?: TokenData[]
		getAllCoinsByFilter?: TokenData[]
	}
}

export interface TokenBalance extends TokenData {
	balance: string
	formattedBalance: string
	usdValue: number
	usdPrice: number
}
