import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Doc } from './_generated/dataModel'

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
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
			.unique()

		if (existingUser) {
			return {
				userId: existingUser._id,
				isNewUser: false
			}
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			walletAddress: args.walletAddress,
			name: args.name || `User ${Math.floor(Math.random() * 10000)}`,
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
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
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
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
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
 * Update user avatar URL
 */
export const updateAvatar = mutation({
	args: {
		walletAddress: v.string(),
		avatarUrl: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		// Find the user by wallet address
		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		// Update user avatar
		await ctx.db.patch(user._id, { avatarUrl: args.avatarUrl })
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
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
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

/**
 * Follow/unfollow a user
 */
export const toggleFollow = mutation({
	args: {
		followerWalletAddress: v.string(), // Current user who wants to follow
		followingWalletAddress: v.string() // User to be followed
	},
	returns: v.boolean(), // Returns true if now following, false if unfollowed
	handler: async (ctx, args) => {
		// Get both users
		const follower = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('walletAddress'), args.followerWalletAddress))
			.unique()

		const following = await ctx.db
			.query('users')
			.filter((q) =>
				q.eq(q.field('walletAddress'), args.followingWalletAddress)
			)
			.unique()

		if (!follower) throw new Error('Follower user not found')
		if (!following) throw new Error('Following user not found')

		// Can't follow yourself
		if (follower._id === following._id) {
			throw new Error('Cannot follow yourself')
		}

		// Check if already following
		const existingFollow = await ctx.db
			.query('social')
			.withIndex('by_both', (q) =>
				q.eq('followerId', follower._id).eq('followingId', following._id)
			)
			.unique()

		if (existingFollow) {
			// Unfollow
			await ctx.db.delete(existingFollow._id)

			// Update counters
			await ctx.db.patch(follower._id, {
				followingCount: Math.max(0, follower.followingCount - 1)
			})
			await ctx.db.patch(following._id, {
				followerCount: Math.max(0, following.followerCount - 1)
			})

			return false
		} else {
			// Follow
			await ctx.db.insert('social', {
				followerId: follower._id,
				followingId: following._id,
				createdAt: Date.now()
			})

			// Update counters
			await ctx.db.patch(follower._id, {
				followingCount: follower.followingCount + 1
			})
			await ctx.db.patch(following._id, {
				followerCount: following.followerCount + 1
			})

			return true
		}
	}
})

/**
 * Check if a user is following another user
 */
export const isFollowing = query({
	args: {
		followerWalletAddress: v.string(),
		followingWalletAddress: v.string()
	},
	returns: v.boolean(),
	handler: async (ctx, args) => {
		// Get both users
		const follower = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('walletAddress'), args.followerWalletAddress))
			.unique()

		const following = await ctx.db
			.query('users')
			.filter((q) =>
				q.eq(q.field('walletAddress'), args.followingWalletAddress)
			)
			.unique()

		if (!follower || !following) return false

		const existingFollow = await ctx.db
			.query('social')
			.withIndex('by_both', (q) =>
				q.eq('followerId', follower._id).eq('followingId', following._id)
			)
			.unique()

		return !!existingFollow
	}
})

/**
 * Get user by wallet address (for profile display)
 */
export const getUserByWallet = query({
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
			.filter((q) => q.eq(q.field('walletAddress'), args.walletAddress))
			.unique()

		return user
	}
})

export const listUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('users').collect()
	}
})
