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
		name: v.optional(v.string())
	},
	returns: v.object({
		userId: v.id('users'),
		isNewUser: v.boolean()
	}),
	handler: async (ctx, args) => {
		// Check if user exists
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (existingUser) {
			return {
				userId: existingUser._id,
				isNewUser: false
			}
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			name: args.name || 'Anonymous',
			walletAddress: args.walletAddress,
			followerCount: 0,
			followingCount: 0,
			isCreator: false
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
