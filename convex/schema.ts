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

const contentSchema = defineTable({
	cloudinaryPublicId: v.string(),
	cloudinaryUrl: v.string(),
	cloudinaryResourceType: v.union(v.literal('image'), v.literal('video')),
	thumbnailPublicId: v.optional(v.string()),
	thumbnailUrl: v.optional(v.string()),
	authorId: v.id('users'),
	title: v.string(),
	description: v.optional(v.string()),
	duration: v.optional(v.number()),
	isPremium: v.boolean(),
	isActive: v.boolean(),
	viewCount: v.number(), // Track number of views
	lastViewedAt: v.optional(v.number()) // Track last view timestamp
})
	.index('by_author', ['authorId'])
	.index('by_views', ['viewCount']) // Index for sorting by views

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
	social: defineTable({
		followerId: v.id('users'),
		followingId: v.id('users')
	}),

	// Tokens table - stores basic token information
	tokens: defineTable({
		tokenId: v.string(), // SUI token ID
		name: v.string(),
		symbol: v.string(),
		currentPrice: v.number(),
		lastUpdated: v.number() // Timestamp
	}).index('by_token_id', ['tokenId']),

	// Comments table - stores user comments on content
	comments: defineTable({
		contentId: v.id('content'),
		authorId: v.id('users'),
		text: v.string(),
		likeCount: v.number()
	})
		.index('by_content', ['contentId'])
		.index('by_author', ['authorId']),

	contentLikes: contentLikesSchema,
	contentViews: contentViewsSchema
})
