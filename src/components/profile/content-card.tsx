import { ContentCard as SharedContentCard } from '@/components/shared/content-card'

interface ContentCardProps {
	content: {
		_id: string
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
		title: string
		description?: string
		hashtags?: string[]
		isPremium: boolean
		isActive: boolean
		viewCount: number
		lastViewedAt?: number
		promotedTokenId?: string
		authorId: string
	}
	profileAddress: string
}

export function ContentCard({ content, profileAddress }: ContentCardProps) {
	// Convert to the format expected by SharedContentCard
	const sharedContent = {
		...content,
		authorName: undefined,
		authorAvatarUrl: undefined,
		likeCount: undefined
	}

	return (
		<SharedContentCard
			content={sharedContent}
			profileAddress={profileAddress}
		/>
	)
}
