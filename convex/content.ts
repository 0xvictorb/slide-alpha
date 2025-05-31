import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const saveContent = mutation({
	args: {
		cloudinaryPublicId: v.string(),
		cloudinaryUrl: v.string(),
		cloudinaryResourceType: v.union(v.literal('video'), v.literal('image')),
		thumbnailPublicId: v.optional(v.string()),
		thumbnailUrl: v.optional(v.string()),
		authorId: v.id('users'),
		title: v.string(),
		description: v.optional(v.string()),
		duration: v.optional(v.number()),
		isPremium: v.boolean(),
		isActive: v.boolean()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('content', {
			...args,
			viewCount: 0,
			likeCount: 0,
			dislikeCount: 0
		})
	}
})

export const getFirstActiveContent = query({
	handler: async (ctx) => {
		const content = await ctx.db
			.query('content')
			.withIndex('by_active', (q) => q.eq('isActive', true))
			.order('desc')
			.first()

		if (!content) return null

		return {
			...content,
			streamingUrl: content.cloudinaryUrl
		}
	}
})
