import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Handles wallet connection and user creation/retrieval
 * Creates a new user if the wallet hasn't been connected before
 * Returns existing user if wallet is already connected
 */
export const connectWallet = mutation({
	args: {
		walletAddress: v.string(),
		name: v.optional(v.string()) // Optional name for first-time users
	},
	returns: v.object({
		userId: v.id('users'),
		isNewUser: v.boolean()
	}),
	handler: async (ctx, args) => {
		// Check if user already exists with this wallet
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		// If user exists, return their ID
		if (existingUser) {
			return {
				userId: existingUser._id,
				isNewUser: false
			}
		}

		// Create new user if doesn't exist
		const userId = await ctx.db.insert('users', {
			walletAddress: args.walletAddress,
			name: args.name ?? `User_${args.walletAddress.slice(0, 6)}`, // Use provided name or generate default
			bio: '',
			avatarUrl: undefined,
			followerCount: 0,
			followingCount: 0,
			isCreator: false // New users start as regular users
		})

		return {
			userId,
			isNewUser: true
		}
	}
})

/**
 * Get current user information by wallet address
 * Returns null if user doesn't exist
 */
export const getCurrentUser = query({
	args: {
		walletAddress: v.string()
	},
	returns: v.union(
		v.object({
			_id: v.id('users'),
			_creationTime: v.number(),
			walletAddress: v.string(),
			name: v.string(),
			bio: v.optional(v.string()),
			avatarUrl: v.optional(v.string()),
			followerCount: v.number(),
			followingCount: v.number(),
			isCreator: v.boolean()
		}),
		v.null()
	),
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		return user
	}
})
