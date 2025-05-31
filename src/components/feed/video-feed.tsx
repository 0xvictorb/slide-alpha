import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { VideoDisplay } from './video-display'
import { ImageCarousel } from './image-carousel'
import { EngagementActions } from './engagement-actions'
import { TokenInfo } from './token-info'

interface VideoFeedProps {
	className?: string
}

interface ContentMedia {
	id: Id<'content'>
	mediaUrl: string
	thumbnailUrl?: string
	resourceType: 'video' | 'image'
	images?: Array<{
		url: string
		alt?: string
	}>
	promotedTokenId?: string
}

export function VideoFeed({ className }: VideoFeedProps) {
	const [currentContent, setCurrentContent] = useState<ContentMedia | null>(
		null
	)

	const incrementView = useMutation(api.content.incrementView)
	const contentStats = useQuery(
		api.content.getContentStats,
		currentContent ? { contentId: currentContent.id } : 'skip'
	)

	// Fetch first content from the content table
	const firstContent = useQuery(api.content.getFirstActiveContent)

	// When we get the content data, set it as current
	useEffect(() => {
		if (firstContent) {
			if (firstContent.images) {
				// If it's an image post, we might have multiple images
				setCurrentContent({
					id: firstContent._id,
					mediaUrl: firstContent.images?.[0]?.cloudinaryUrl || '',
					thumbnailUrl: firstContent.images?.[0]?.cloudinaryUrl || '',
					resourceType: 'image',
					images: firstContent.images.map((image) => ({
						url: image.cloudinaryUrl,
						alt: image.cloudinaryPublicId
					})),
					promotedTokenId: firstContent.promotedTokenId
				})
			} else {
				// Video post
				setCurrentContent({
					id: firstContent._id,
					mediaUrl: firstContent.video?.cloudinaryUrl || '',
					thumbnailUrl: firstContent.video?.thumbnailUrl || '',
					resourceType: 'video',
					promotedTokenId: firstContent.promotedTokenId
				})
			}
		}
	}, [firstContent])

	const handleMediaView = async () => {
		if (currentContent) {
			try {
				await incrementView({ contentId: currentContent.id })
			} catch (error) {
				console.error('Failed to increment view:', error)
			}
		}
	}

	if (!currentContent) {
		return (
			<div
				className={cn('flex items-center justify-center h-[100vh]', className)}>
				<p className="text-gray-500">Loading...</p>
			</div>
		)
	}

	return (
		<div className={cn('relative w-full h-[100vh]', className)}>
			<div className="absolute inset-0 flex items-center justify-center">
				{currentContent.resourceType === 'video' ? (
					<VideoDisplay
						videoUrl={currentContent.mediaUrl}
						thumbnailUrl={currentContent.thumbnailUrl}
						onPlay={handleMediaView}
						className="w-full h-full"
					/>
				) : (
					<ImageCarousel
						images={
							currentContent.images || [
								{
									url: currentContent.mediaUrl,
									alt: 'Content'
								}
							]
						}
						onView={handleMediaView}
						className="w-full h-full"
					/>
				)}
			</div>

			{/* Token information */}
			{currentContent.promotedTokenId && (
				<TokenInfo
					tokenId={currentContent.promotedTokenId}
					className="absolute top-4 left-4 z-10"
				/>
			)}

			{/* Engagement actions */}
			<div className="absolute bottom-4 right-4 z-10">
				<EngagementActions contentId={currentContent.id} />
			</div>

			{/* Stats */}
			{contentStats && (
				<div className="absolute top-4 right-4 z-10 bg-black/50 rounded-lg px-2 py-1 text-white text-sm">
					<p>{contentStats.viewCount} views</p>
				</div>
			)}
		</div>
	)
}
