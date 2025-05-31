import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	// Users table - stores user profiles and authentication info
	users: defineTable({
		name: v.string(),
		walletAddress: v.string(), // SUI wallet address
		bio: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		followerCount: v.number(), // Denormalized counter
		followingCount: v.number(), // Denormalized counter
		isCreator: v.boolean() // Flag to identify creators
	}).index('by_wallet', ['walletAddress']),

	// Content table - stores video/image content metadata
	content: defineTable({
		authorId: v.id('users'),
		title: v.string(),
		description: v.optional(v.string()),
		cloudinaryPublicId: v.string(), // Cloudinary public ID
		cloudinaryUrl: v.string(), // Full Cloudinary URL
		cloudinaryResourceType: v.union(v.literal('video'), v.literal('image')),
		thumbnailPublicId: v.optional(v.string()), // Cloudinary thumbnail ID
		thumbnailUrl: v.optional(v.string()), // Cloudinary thumbnail URL
		duration: v.optional(v.number()), // For videos only
		viewCount: v.number(),
		likeCount: v.number(), // Denormalized counter
		dislikeCount: v.number(), // Denormalized counter
		tokenId: v.optional(v.string()), // Associated SUI token ID
		isPremium: v.boolean(),
		isActive: v.boolean() // For soft deletion
	})
		.index('by_author', ['authorId'])
		.index('by_token', ['tokenId'])
		.index('by_active', ['isActive'])
		.index('by_engagement', ['likeCount']), // For trending content

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
		.index('by_author', ['authorId'])
})
