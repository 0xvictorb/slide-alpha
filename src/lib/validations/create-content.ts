import * as z from 'zod'

// Image schema for validation
const imageSchema = z.object({
	cloudinaryPublicId: z.string(),
	cloudinaryUrl: z.string(),
	order: z.number(),
	tuskyFileId: z.string().optional()
})

// Video schema for validation
const videoSchema = z.object({
	cloudinaryPublicId: z.string(),
	cloudinaryUrl: z.string(),
	thumbnailUrl: z.string(),
	duration: z.number(),
	tuskyFileId: z.string().optional()
})

export const createContentSchema = z
	.object({
		// Media info
		contentType: z.enum(['video', 'images']),
		video: videoSchema.optional(),
		images: z.array(imageSchema).optional(),

		// Content info
		title: z
			.string()
			.min(1, 'Title is required')
			.max(100, 'Title must be less than 100 characters'),
		description: z
			.string()
			.max(500, 'Description must be less than 500 characters')
			.optional(),
		hashtags: z.array(z.string()).optional(),

		// Status
		isPremium: z.boolean(),
		premiumPrice: z.number().min(0).optional(),

		// Token promotion
		isPromotingToken: z.boolean(),
		promotedTokenId: z.string().optional(),

		// On-chain status
		isOnChain: z.boolean().default(false).optional()
	})
	.refine(
		(data) => {
			// Ensure either video or images are provided based on contentType
			if (data.contentType === 'video') {
				return data.video !== undefined && data.images === undefined
			} else {
				return (
					data.images !== undefined &&
					data.video === undefined &&
					data.images.length > 0
				)
			}
		},
		{
			message:
				'Must provide either a video or at least one image based on content type'
		}
	)

export type CreateContentSchema = z.infer<typeof createContentSchema>
