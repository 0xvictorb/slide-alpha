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

/**
 * Update user profile information
 */
export const updateProfile = mutation({
	args: {
		walletAddress: v.string(),
		name: v.optional(v.string()),
		bio: v.optional(v.string())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		// Find the user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		// Prepare update object, only including defined fields
		const updateData: { name?: string; bio?: string } = {}
		if (args.name !== undefined) {
			updateData.name = args.name
		}
		if (args.bio !== undefined) {
			updateData.bio = args.bio
		}

		// Update user
		await ctx.db.patch(user._id, updateData)
		return null
	}
})

/**
 * Get user's content for their profile page
 */
export const getUserContent = query({
	args: {
		walletAddress: v.string(),
		limit: v.optional(v.number())
	},
	returns: v.array(
		v.object({
			_id: v.id('content'),
			_creationTime: v.number(),
			authorId: v.id('users'),
			contentType: v.union(v.literal('video'), v.literal('images')),
			video: v.optional(
				v.object({
					cloudinaryPublicId: v.string(),
					cloudinaryUrl: v.string(),
					thumbnailUrl: v.string(),
					duration: v.number()
				})
			),
			images: v.optional(
				v.array(
					v.object({
						cloudinaryPublicId: v.string(),
						cloudinaryUrl: v.string(),
						order: v.number()
					})
				)
			),
			title: v.string(),
			description: v.optional(v.string()),
			hashtags: v.optional(v.array(v.string())),
			isPremium: v.boolean(),
			isActive: v.boolean(),
			viewCount: v.number(),
			lastViewedAt: v.optional(v.number()),
			promotedTokenId: v.optional(v.string())
		})
	),
	handler: async (ctx, args) => {
		const limit = args.limit || 50

		// Find the user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (!user) {
			return []
		}

		// Get user's content sorted by creation time (newest first)
		const content = await ctx.db
			.query('content')
			.withIndex('by_author', (q) => q.eq('authorId', user._id))
			.order('desc')
			.take(limit)

		return content
	}
})
