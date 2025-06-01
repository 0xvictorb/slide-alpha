import { ContentCard as SharedContentCard } from '@/components/shared/content-card'
import type { Id } from '@convex/_generated/dataModel'
import type { ContentItem } from '@/types/content'

interface ContentCardProps {
	content: ContentItem
	onContentClick: (contentId: Id<'content'>) => void
}

export function ContentCard({ content, onContentClick }: ContentCardProps) {
	// Convert ContentItem to the format expected by SharedContentCard
	const sharedContent = {
		_id: content._id,
		_creationTime: content._creationTime,
		contentType: content.contentType,
		video: content.video,
		images: content.images,
		title: content.title,
		description: content.description,
		hashtags: content.hashtags,
		isPremium: content.isPremium,
		isActive: content.isActive,
		viewCount: content.viewCount,
		lastViewedAt: undefined,
		promotedTokenId: content.promotedTokenId,
		authorId: content.authorId,
		authorName: content.authorName,
		authorAvatarUrl: content.authorAvatarUrl,
		likeCount: undefined
	}

	const handleContentClick = (contentId: string) => {
		onContentClick(contentId as Id<'content'>)
	}

	return (
		<SharedContentCard
			content={sharedContent}
			showStats={true}
			onContentClick={handleContentClick}
		/>
	)
}
