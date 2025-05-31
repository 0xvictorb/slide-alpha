import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const usersSchema = defineTable({
	name: v.string(),
	walletAddress: v.string(), // SUI wallet address
	bio: v.optional(v.string()),
	avatarUrl: v.optional(v.string()),
	followerCount: v.number(), // Denormalized counter
	followingCount: v.number(), // Denormalized counter
	isCreator: v.boolean() // Flag to identify creators
}).index('by_wallet', ['walletAddress'])

// Media item schema for images
const imageSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	order: v.number() // To maintain the order of images
})

// Video schema with thumbnail support
const videoSchema = v.object({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	thumbnailUrl: v.string(),
	duration: v.number()
})

const contentSchema = defineTable({
	// Media info - either video or images
	contentType: v.union(v.literal('video'), v.literal('images')),
	video: v.optional(videoSchema),
	images: v.optional(v.array(imageSchema)),

	// Content info
	authorId: v.id('users'),
	title: v.string(),
	description: v.optional(v.string()),
	hashtags: v.optional(v.array(v.string())),

	// Status and metrics
	isPremium: v.boolean(),
	isActive: v.boolean(),
	viewCount: v.number(),
	lastViewedAt: v.optional(v.number()),

	// Token promotion
	promotedTokenId: v.optional(v.string()) // SUI token ID if promoting one
})
	.index('by_author', ['authorId'])
	.index('by_views', ['viewCount'])
	.index('by_promoted_token', ['promotedTokenId'])
	.index('by_hashtags', ['hashtags'])
	.index('by_content_type', ['contentType']) // New index for content type filtering

const contentLikesSchema = defineTable({
	contentId: v.id('content'),
	userId: v.id('users'),
	type: v.union(v.literal('like'), v.literal('dislike')),
	createdAt: v.number()
})
	.index('by_content_user', ['contentId', 'userId'])
	.index('by_content', ['contentId'])
	.index('by_user', ['userId'])

const contentViewsSchema = defineTable({
	contentId: v.id('content'),
	viewerId: v.string(), // wallet address or 'anonymous'
	viewedAt: v.number()
})
	.index('by_content_viewer', ['contentId', 'viewerId'])
	.index('by_content', ['contentId'])
	.index('by_viewer', ['viewerId'])

const tokensSchema = defineTable({
	tokenId: v.string(), // SUI token ID
	name: v.string(),
	symbol: v.string(),
	currentPrice: v.number(),
	lastUpdated: v.number()
}).index('by_token_id', ['tokenId'])

const commentsSchema = defineTable({
	contentId: v.id('content'),
	authorId: v.id('users'),
	text: v.string(),
	likeCount: v.number(),
	createdAt: v.number()
})
	.index('by_content', ['contentId'])
	.index('by_author', ['authorId'])
	.index('by_created', ['createdAt'])

const socialSchema = defineTable({
	followerId: v.id('users'),
	followingId: v.id('users'),
	createdAt: v.number()
})
	.index('by_follower', ['followerId'])
	.index('by_following', ['followingId'])
	.index('by_both', ['followerId', 'followingId'])

export default defineSchema({
	// Users table - stores user profiles and authentication info
	users: usersSchema,

	// Content table - stores video/image content metadata
	content: contentSchema,

	// Engagement table - stores user interactions
	engagement: defineTable({
		userId: v.id('users'),
		contentId: v.id('content'),
		type: v.string() // "like" or "dislike"
	})
		.index('by_user_content', ['userId', 'contentId'])
		.index('by_content', ['contentId', 'type']),

	// Social table - stores follow relationships
	social: socialSchema,

	// Tokens table - stores basic token information
	tokens: tokensSchema,

	// Comments table - stores user comments on content
	comments: commentsSchema,

	contentLikes: contentLikesSchema,
	contentViews: contentViewsSchema
})
