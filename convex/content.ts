import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'

// Media schemas for validation
const imageSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	order: v.number(),
	tuskyFileId: v.optional(v.string())
})

const videoSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	thumbnailUrl: v.string(),
	duration: v.number(),
	tuskyFileId: v.optional(v.string())
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

/**
 * Get paginated content feed for TikTok-like navigation - prioritizes videos over images
 */
export const getPaginatedContent = query({
	args: {
		paginationOpts: paginationOptsValidator,
		isActiveOnly: v.optional(v.boolean()),
		preferVideos: v.optional(v.boolean())
	},
	returns: v.object({
		page: v.array(
			v.object({
				_id: v.id('content'),
				_creationTime: v.number(),
				contentType: v.union(v.literal('video'), v.literal('images')),
				video: v.optional(videoSchema),
				images: v.optional(v.array(imageSchema)),
				authorId: v.id('users'),
				title: v.string(),
				description: v.optional(v.string()),
				hashtags: v.optional(v.array(v.string())),
				isPremium: v.boolean(),
				isActive: v.boolean(),
				viewCount: v.number(),
				lastViewedAt: v.optional(v.number()),
				promotedTokenId: v.optional(v.string()),
				authorWalletAddress: v.optional(v.string()),
				authorName: v.optional(v.string()),
				authorAvatarUrl: v.optional(v.string()),
				isOnChain: v.optional(v.boolean())
			})
		),
		isDone: v.boolean(),
		continueCursor: v.union(v.string(), v.null())
	}),
	handler: async (ctx, args) => {
		const isActiveOnly = args.isActiveOnly ?? true
		const preferVideos = args.preferVideos ?? true
		const numItems = args.paginationOpts.numItems

		if (preferVideos) {
			// Strategy: Get videos first, then fill with images if needed
			const createVideoQuery = () => {
				let query = ctx.db
					.query('content')
					.withIndex('by_content_type', (q) => q.eq('contentType', 'video'))
					.order('desc')

				if (isActiveOnly) {
					query = query.filter((q) => q.eq(q.field('isActive'), true))
				}
				return query
			}

			const createImageQuery = () => {
				let query = ctx.db
					.query('content')
					.withIndex('by_content_type', (q) => q.eq('contentType', 'images'))
					.order('desc')

				if (isActiveOnly) {
					query = query.filter((q) => q.eq(q.field('isActive'), true))
				}
				return query
			}

			// Get videos first (aim for 70% videos, 30% images)
			const videoTargetCount = Math.ceil(numItems * 0.7)
			const imageTargetCount = numItems - videoTargetCount

			const videos = await createVideoQuery().take(videoTargetCount)
			const images = await createImageQuery().take(imageTargetCount)

			// If we don't have enough videos, get more images
			let finalVideos = videos
			let finalImages = images

			if (videos.length < videoTargetCount) {
				const additionalImagesNeeded = videoTargetCount - videos.length
				const additionalImages = await createImageQuery().take(
					imageTargetCount + additionalImagesNeeded
				)
				finalImages = additionalImages
			}

			// If we don't have enough images, get more videos
			if (images.length < imageTargetCount) {
				const additionalVideosNeeded = imageTargetCount - images.length
				const additionalVideos = await createVideoQuery().take(
					videoTargetCount + additionalVideosNeeded
				)
				finalVideos = additionalVideos
			}

			// Combine and sort by creation time within each type
			const combinedContent = [
				...finalVideos.sort((a, b) => b._creationTime - a._creationTime),
				...finalImages.sort((a, b) => b._creationTime - a._creationTime)
			]

			// Take only what we need
			const page = combinedContent.slice(0, numItems)

			// Enrich content with author wallet addresses
			const enrichedContent = await Promise.all(
				page.map(async (content) => {
					const author = await ctx.db.get(content.authorId)
					return {
						...content,
						authorWalletAddress: author?.walletAddress,
						authorName: author?.name,
						authorAvatarUrl: author?.avatarUrl
					}
				})
			)

			return {
				page: enrichedContent,
				isDone: combinedContent.length < numItems,
				continueCursor:
					combinedContent.length < numItems ? null : 'video-prioritized'
			}
		} else {
			// Original behavior for non-video-preferred queries
			let contentQuery = ctx.db.query('content').order('desc')

			// Filter by active content if requested
			if (isActiveOnly) {
				contentQuery = contentQuery.filter((q) =>
					q.eq(q.field('isActive'), true)
				)
			}

			const result = await contentQuery.paginate(args.paginationOpts)

			// Enrich content with author wallet addresses
			const enrichedContent = await Promise.all(
				result.page.map(async (content) => {
					const author = await ctx.db.get(content.authorId)
					return {
						...content,
						authorWalletAddress: author?.walletAddress,
						authorName: author?.name,
						authorAvatarUrl: author?.avatarUrl
					}
				})
			)

			return {
				page: enrichedContent,
				isDone: result.isDone,
				continueCursor: result.continueCursor
			}
		}
	}
})

/**
 * Get content by ID for navigation
 */
export const getContentById = query({
	args: { contentId: v.id('content') },
	returns: v.union(
		v.object({
			_id: v.id('content'),
			_creationTime: v.number(),
			contentType: v.union(v.literal('video'), v.literal('images')),
			video: v.optional(videoSchema),
			images: v.optional(v.array(imageSchema)),
			authorId: v.id('users'),
			title: v.string(),
			description: v.optional(v.string()),
			hashtags: v.optional(v.array(v.string())),
			isPremium: v.boolean(),
			isActive: v.boolean(),
			viewCount: v.number(),
			lastViewedAt: v.optional(v.number()),
			promotedTokenId: v.optional(v.string()),
			authorWalletAddress: v.optional(v.string()),
			isOnChain: v.optional(v.boolean())
		}),
		v.null()
	),
	handler: async (ctx, args) => {
		const content = await ctx.db.get(args.contentId)
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
		premiumPrice: v.optional(v.number()),

		// Storage info
		isOnChain: v.boolean(),

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

		// Validate premium price
		if (args.isPremium && typeof args.premiumPrice !== 'number') {
			throw new Error('Premium price is required for premium content')
		}

		// Validate on-chain storage
		if (args.isOnChain) {
			if (args.contentType === 'video' && !args.video?.tuskyFileId) {
				throw new Error('Tusky file ID is required for on-chain video storage')
			}
			if (
				args.contentType === 'images' &&
				!args.images?.every((img) => img.tuskyFileId)
			) {
				throw new Error(
					'Tusky file ID is required for all images when storing on-chain'
				)
			}
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
			premiumPrice: args.premiumPrice,
			isActive: true,
			viewCount: 0,
			lastViewedAt: undefined,

			// Storage info
			isOnChain: args.isOnChain,

			// Token promotion
			promotedTokenId: args.isPromotingToken ? args.promotedTokenId : undefined
		})

		return { contentId }
	}
})

// Comment functionality
export const createComment = mutation({
	args: {
		contentId: v.id('content'),
		text: v.string(),
		walletAddress: v.string()
	},
	returns: v.id('comments'),
	handler: async (ctx, args) => {
		// Validate input
		if (!args.text.trim()) {
			throw new Error('Comment text cannot be empty')
		}

		if (args.text.length > 1000) {
			throw new Error('Comment text cannot exceed 1000 characters')
		}

		// Get user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		// Verify content exists
		const content = await ctx.db.get(args.contentId)
		if (!content) {
			throw new Error('Content not found')
		}

		// Create comment
		const commentId = await ctx.db.insert('comments', {
			contentId: args.contentId,
			authorId: user._id,
			text: args.text.trim(),
			likeCount: 0,
			createdAt: Date.now()
		})

		return commentId
	}
})

export const deleteComment = mutation({
	args: {
		commentId: v.id('comments'),
		walletAddress: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		// Get user by wallet address
		const user = await ctx.db
			.query('users')
			.withIndex('by_wallet', (q) => q.eq('walletAddress', args.walletAddress))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		// Get comment
		const comment = await ctx.db.get(args.commentId)
		if (!comment) {
			throw new Error('Comment not found')
		}

		// Check if user owns the comment
		if (comment.authorId !== user._id) {
			throw new Error('You can only delete your own comments')
		}

		// Delete comment
		await ctx.db.delete(args.commentId)
		return null
	}
})

export const getComments = query({
	args: {
		contentId: v.id('content'),
		limit: v.optional(v.number()),
		offset: v.optional(v.number())
	},
	returns: v.array(
		v.object({
			_id: v.id('comments'),
			text: v.string(),
			likeCount: v.number(),
			createdAt: v.number(),
			author: v.object({
				_id: v.id('users'),
				name: v.string(),
				walletAddress: v.string(),
				avatarUrl: v.optional(v.string())
			})
		})
	),
	handler: async (ctx, args) => {
		const limit = args.limit || 20
		const offset = args.offset || 0

		// Get comments for content
		const comments = await ctx.db
			.query('comments')
			.withIndex('by_content', (q) => q.eq('contentId', args.contentId))
			.order('desc')
			.take(limit + offset)

		// Skip offset and take limit
		const paginatedComments = comments.slice(offset, offset + limit)

		// Get author info for each comment
		const commentsWithAuthors = await Promise.all(
			paginatedComments.map(async (comment) => {
				const author = await ctx.db.get(comment.authorId)
				if (!author) {
					throw new Error(`Author not found for comment ${comment._id}`)
				}

				return {
					_id: comment._id,
					text: comment.text,
					likeCount: comment.likeCount,
					createdAt: comment.createdAt,
					author: {
						_id: author._id,
						name: author.name,
						walletAddress: author.walletAddress,
						avatarUrl: author.avatarUrl
					}
				}
			})
		)

		return commentsWithAuthors
	}
})

export const getCommentCount = query({
	args: {
		contentId: v.id('content')
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const comments = await ctx.db
			.query('comments')
			.withIndex('by_content', (q) => q.eq('contentId', args.contentId))
			.collect()

		return comments.length
	}
})

/**
 * Search content by hashtags or text in title/description
 */
export const searchContent = query({
	args: {
		query: v.string(),
		paginationOpts: paginationOptsValidator,
		isActiveOnly: v.optional(v.boolean())
	},
	returns: v.object({
		page: v.array(
			v.object({
				_id: v.id('content'),
				_creationTime: v.number(),
				contentType: v.union(v.literal('video'), v.literal('images')),
				video: v.optional(videoSchema),
				images: v.optional(v.array(imageSchema)),
				authorId: v.id('users'),
				title: v.string(),
				description: v.optional(v.string()),
				hashtags: v.optional(v.array(v.string())),
				isPremium: v.boolean(),
				isActive: v.boolean(),
				viewCount: v.number(),
				lastViewedAt: v.optional(v.number()),
				promotedTokenId: v.optional(v.string()),
				authorWalletAddress: v.optional(v.string()),
				authorName: v.optional(v.string()),
				authorAvatarUrl: v.optional(v.string())
			})
		),
		isDone: v.boolean(),
		continueCursor: v.union(v.string(), v.null())
	}),
	handler: async (ctx, args) => {
		const isActiveOnly = args.isActiveOnly ?? true
		const searchQuery = args.query.toLowerCase().trim()

		// If query starts with #, treat it as hashtag search
		const isHashtagSearch = searchQuery.startsWith('#')
		const searchTerm = isHashtagSearch ? searchQuery.slice(1) : searchQuery

		// Get all content (we'll filter in memory for now, could optimize with search indexes later)
		let contentQuery = ctx.db.query('content').order('desc')

		if (isActiveOnly) {
			contentQuery = contentQuery.filter((q) => q.eq(q.field('isActive'), true))
		}

		const allContent = await contentQuery.collect()

		// Filter content based on search criteria
		const filteredContent = allContent.filter((content) => {
			if (isHashtagSearch) {
				// Search in hashtags
				return content.hashtags?.some((hashtag) =>
					hashtag.toLowerCase().includes(searchTerm)
				)
			} else {
				// Search in title and description
				const titleMatch = content.title.toLowerCase().includes(searchTerm)
				const descriptionMatch = content.description
					?.toLowerCase()
					.includes(searchTerm)
				const hashtagMatch = content.hashtags?.some((hashtag) =>
					hashtag.toLowerCase().includes(searchTerm)
				)

				return titleMatch || descriptionMatch || hashtagMatch
			}
		})

		// Apply pagination manually
		const startIndex = args.paginationOpts.cursor
			? parseInt(args.paginationOpts.cursor)
			: 0
		const endIndex = startIndex + args.paginationOpts.numItems
		const page = filteredContent.slice(startIndex, endIndex)

		// Enrich content with author data
		const enrichedContent = await Promise.all(
			page.map(async (content) => {
				const author = await ctx.db.get(content.authorId)
				return {
					...content,
					authorWalletAddress: author?.walletAddress,
					authorName: author?.name,
					authorAvatarUrl: author?.avatarUrl
				}
			})
		)

		return {
			page: enrichedContent,
			isDone: endIndex >= filteredContent.length,
			continueCursor:
				endIndex >= filteredContent.length ? null : endIndex.toString()
		}
	}
})
