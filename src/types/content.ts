import type { Id } from '@convex/_generated/dataModel'

export interface ContentItem {
	_id: Id<'content'>
	_creationTime: number
	contentType: 'video' | 'images'
	video?: {
		cloudinaryPublicId: string
		cloudinaryUrl: string
		thumbnailUrl: string
		duration: number
	}
	images?: Array<{
		cloudinaryPublicId: string
		cloudinaryUrl: string
		order: number
	}>
	authorId: Id<'users'>
	title: string
	description?: string
	hashtags?: string[]
	isPremium: boolean
	isActive: boolean
	viewCount: number
	promotedTokenId?: string
	authorWalletAddress?: string
	authorName?: string
	authorAvatarUrl?: string
}
