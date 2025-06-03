import { v } from 'convex/values'
import { internalAction, internalMutation, query } from './_generated/server'
import { internal } from './_generated/api'

const SUI_ADDRESS = '0x2::sui::SUI'
const SUI_FULL_ADDRESS =
	'0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'

interface Token {
	objectId?: string
	type: string
	decimals: number
	symbol: string
	name: string
	iconUrl?: string
	verified?: boolean
	alias?: string
	lastUpdated: number
}

// Define the token type
const tokenValidator = v.object({
	objectId: v.optional(v.string()),
	type: v.string(),
	decimals: v.number(),
	symbol: v.string(),
	name: v.string(),
	iconUrl: v.optional(v.string()),
	verified: v.optional(v.boolean()),
	alias: v.optional(v.string()),
	lastUpdated: v.number()
})

const TOKENS_API_URL = 'https://tokens.7k.ag/all'

// Mutation to store tokens in the database
export const storeTokens = internalMutation({
	args: {
		tokens: v.array(tokenValidator)
	},
	handler: async (ctx, args) => {
		// Delete existing tokens
		const existing = await ctx.db.query('tokens').collect()
		for (const token of existing) {
			await ctx.db.delete(token._id)
		}

		// Insert new tokens
		for (const token of args.tokens) {
			await ctx.db.insert('tokens', token)
		}
	}
})

// Query to get all tokens from database
export const getTokens = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('tokens').collect()
	}
})

// Query to get verified tokens
export const getVerifiedTokens = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('tokens')
			.withIndex('by_verified', (q) => q.eq('verified', true))
			.collect()
	}
})

// Action to fetch tokens from 7k.ag API
export const fetchTokens = internalAction({
	args: {},
	handler: async (ctx) => {
		try {
			const response = await fetch(TOKENS_API_URL, {
				method: 'GET',
				headers: {
					Accept: '*/*',
					Origin: 'https://7k.ag',
					Referer: 'https://7k.ag/',
					'User-Agent':
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
				}
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const tokens = (await response.json()) as Token[]

			// Add lastUpdated field to each token
			// To minimize the number of tokens, we only store verified tokens
			const processedTokens = tokens
				.filter((token) => token.verified)
				.map((token) => ({
					symbol: token.symbol,
					type: token.type === SUI_ADDRESS ? SUI_FULL_ADDRESS : token.type,
					decimals: token.decimals,
					name: token.name,
					iconUrl: token.iconUrl,
					alias: token.alias,
					verified: token.verified ?? false,
					lastUpdated: Date.now()
				}))

			// Store tokens in Convex
			await ctx.runMutation(internal.tokens.storeTokens, {
				tokens: processedTokens
			})

			return processedTokens
		} catch (error) {
			console.error('Error fetching tokens:', error)
			throw error
		}
	}
})
