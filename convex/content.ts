import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Media schemas for validation
const imageSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	order: v.number()
})

const videoSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	thumbnailUrl: v.string(),
	duration: v.number()
})

export const getFirstActiveContent = query({
	handler: async (ctx) => {
		const content = await ctx.db.query('content').order('desc').first()

		if (!content) return null

		const author = await ctx.db.get(content.authorId)

		return {
			...content,
			authorWalletAddress: author?.walletAddress
		}
	}
})

export const toggleLike = mutation({
	args: {
		contentId: v.id('content'),
		type: v.union(v.literal('like'), v.literal('dislike')),
		walletAddress: v.string()
	},
	handler: async (ctx, args) => {
		// Get user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (!user) throw new Error('User not found')

		// Check if user has already liked/disliked this content
		const existingLike = await ctx.db
			.query('contentLikes')
			.withIndex('by_content_user', (q) =>
				q.eq('contentId', args.contentId).eq('userId', user._id)
			)
			.unique()

		if (existingLike) {
			// If same type, remove the like/dislike
			if (existingLike.type === args.type) {
				await ctx.db.delete(existingLike._id)
				return null
			}
			// If different type, update to new type
			await ctx.db.patch(existingLike._id, { type: args.type })
			return args.type
		}

		// Create new like/dislike
		await ctx.db.insert('contentLikes', {
			contentId: args.contentId,
			userId: user._id,
			type: args.type,
			createdAt: Date.now()
		})

		return args.type
	}
})

export const getLikes = query({
	args: {
		contentId: v.id('content')
	},
	handler: async (ctx, args) => {
		const likes = await ctx.db
			.query('contentLikes')
			.withIndex('by_content', (q) => q.eq('contentId', args.contentId))
			.collect()

		return {
			likes: likes.filter((l) => l.type === 'like').length,
			dislikes: likes.filter((l) => l.type === 'dislike').length
		}
	}
})

export const getUserLike = query({
	args: {
		contentId: v.id('content'),
		walletAddress: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()
		if (!user) return null

		const like = await ctx.db
			.query('contentLikes')
			.withIndex('by_content_user', (q) =>
				q.eq('contentId', args.contentId).eq('userId', user._id)
			)
			.unique()

		return like?.type || null
	}
})

export const incrementView = mutation({
	args: {
		contentId: v.id('content')
	},
	handler: async (ctx, args) => {
		const content = await ctx.db.get(args.contentId)
		if (!content) throw new Error('Content not found')

		// Get user identity for tracking unique views
		const identity = await ctx.auth.getUserIdentity()
		const viewerId = identity?.subject || 'anonymous'

		// Check if this viewer has viewed this content recently
		const recentView = await ctx.db
			.query('contentViews')
			.withIndex('by_content_viewer', (q) =>
				q.eq('contentId', args.contentId).eq('viewerId', viewerId)
			)
			.order('desc')
			.first()

		const now = Date.now()
		const COOLDOWN_PERIOD = 30 * 60 * 1000 // 30 minutes in milliseconds

		// If no recent view or last view was more than 30 minutes ago
		if (!recentView || now - recentView.viewedAt > COOLDOWN_PERIOD) {
			// Record the view
			await ctx.db.insert('contentViews', {
				contentId: args.contentId,
				viewerId,
				viewedAt: now
			})

			// Increment the view count
			await ctx.db.patch(args.contentId, {
				viewCount: (content.viewCount || 0) + 1,
				lastViewedAt: now
			})
		}
	}
})

export const getContentStats = query({
	args: {
		contentId: v.id('content')
	},
	handler: async (ctx, args) => {
		const content = await ctx.db.get(args.contentId)
		if (!content) throw new Error('Content not found')

		// Get likes/dislikes
		const likes = await ctx.db
			.query('contentLikes')
			.withIndex('by_content', (q) => q.eq('contentId', args.contentId))
			.collect()

		return {
			viewCount: content.viewCount || 0,
			lastViewedAt: content.lastViewedAt,
			likes: likes.filter((l) => l.type === 'like').length,
			dislikes: likes.filter((l) => l.type === 'dislike').length
		}
	}
})

export const getTrendingContent = query({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 10

		// Get content sorted by views
		const trendingContent = await ctx.db
			.query('content')
			.withIndex('by_views')
			.order('desc')
			.take(limit)

		return trendingContent
	}
})

export const createContent = mutation({
	args: {
		// Media info
		contentType: v.union(v.literal('video'), v.literal('images')),
		video: v.optional(videoSchema),
		images: v.optional(v.array(imageSchema)),

		// Content info
		title: v.string(),
		description: v.optional(v.string()),
		hashtags: v.array(v.string()),

		// Status
		isPremium: v.boolean(),

		// Token promotion
		isPromotingToken: v.boolean(),
		promotedTokenId: v.optional(v.string()),

		// Author
		authorWalletAddress: v.string()
	},
	handler: async (ctx, args) => {
		// Get user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) =>
				q.eq('walletAddress', args.authorWalletAddress)
			)
			.unique()

		if (!user) throw new Error('User not found')

		// Check if user has enough followers for premium content
		if (args.isPremium && user.followerCount < 100) {
			throw new Error('Need at least 100 followers to create premium content')
		}

		// Validate media content
		if (args.contentType === 'video' && !args.video) {
			throw new Error('Video content is required when contentType is video')
		}
		if (
			args.contentType === 'images' &&
			(!args.images || args.images.length === 0)
		) {
			throw new Error(
				'At least one image is required when contentType is images'
			)
		}

		// Create the content
		const contentId = await ctx.db.insert('content', {
			// Media info
			contentType: args.contentType,
			video: args.video,
			images: args.images,

			// Content info
			authorId: user._id,
			title: args.title,
			description: args.description,
			hashtags: args.hashtags,

			// Status and metrics
			isPremium: args.isPremium,
			isActive: true,
			viewCount: 0,
			lastViewedAt: undefined,

			// Token promotion
			promotedTokenId: args.isPromotingToken ? args.promotedTokenId : undefined
		})

		return { contentId }
	}
})
