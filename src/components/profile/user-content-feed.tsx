import { useEffect, useState, useRef, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoDisplay } from '../feed/video-display'
import { ImageCarousel } from '../feed/image-carousel'
import { EngagementActions } from '../feed/engagement-actions'
import { TokenInfo } from '../feed/token-info'
import { UserProfile } from '../feed/user-profile'
import { Hashtags } from '../feed/hashtags'

interface UserContentFeedProps {
	profileAddress: string
	startContentId: string
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
	creatorAddress: string
	title: string
	description?: string
	hashtags?: string[]
	author: {
		id: Id<'users'>
		name: string
		avatarUrl?: string
		walletAddress: string
	}
}

export function UserContentFeed({
	profileAddress,
	startContentId,
	className
}: UserContentFeedProps) {
	const navigate = useNavigate()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [contentList, setContentList] = useState<ContentMedia[]>([])
	const [audioEnabled, setAudioEnabled] = useState(false)

	// Enhanced drag/swipe state for TikTok-like experience
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [startY, setStartY] = useState(0)

	// Refs
	const containerRef = useRef<HTMLDivElement>(null)
	const incrementView = useMutation(api.content.incrementView)

	// Animation constants
	const CONTAINER_HEIGHT =
		typeof window !== 'undefined' ? window.innerHeight - 80 : 720
	const DRAG_THRESHOLD = 100
	const MAX_DRAG_DISTANCE = CONTAINER_HEIGHT * 0.8

	// Load user's content
	const userContent = useQuery(api.users.getUserContent, {
		walletAddress: profileAddress
	})

	// Enable audio after component mounts (similar to splash completion)
	useEffect(() => {
		setAudioEnabled(true)
	}, [])

	// Format content item helper
	const formatContentItem = useCallback(
		(content: any): ContentMedia => {
			const baseContent = {
				id: content._id,
				promotedTokenId: content.promotedTokenId,
				creatorAddress: profileAddress,
				title: content.title,
				description: content.description,
				hashtags: content.hashtags,
				author: {
					id: content.authorId,
					name: content.authorName || 'Anonymous',
					avatarUrl: content.authorAvatarUrl,
					walletAddress: profileAddress
				}
			}

			if (content.images) {
				return {
					...baseContent,
					mediaUrl: content.images?.[0]?.cloudinaryUrl || '',
					thumbnailUrl: content.images?.[0]?.cloudinaryUrl || '',
					resourceType: 'image' as const,
					images: content.images.map((image: any) => ({
						url: image.cloudinaryUrl,
						alt: image.cloudinaryPublicId
					}))
				}
			} else {
				return {
					...baseContent,
					mediaUrl: content.video?.cloudinaryUrl || '',
					thumbnailUrl: content.video?.thumbnailUrl || '',
					resourceType: 'video' as const
				}
			}
		},
		[profileAddress]
	)

	// Initialize content list and find starting content
	useEffect(() => {
		if (userContent && contentList.length === 0) {
			const formattedContent = userContent.map(formatContentItem)
			setContentList(formattedContent)

			// Find the index of the starting content
			const startIndex = formattedContent.findIndex(
				(content) => content.id === startContentId
			)
			if (startIndex !== -1) {
				setCurrentIndex(startIndex)
			}
		}
	}, [userContent, contentList.length, formatContentItem, startContentId])

	// Navigation with smooth transition
	const navigateToIndex = useCallback(
		(newIndex: number) => {
			if (newIndex < 0 || newIndex >= contentList.length || isTransitioning)
				return

			setIsTransitioning(true)
			setCurrentIndex(newIndex)
			setDragOffset(0)

			setTimeout(() => {
				setIsTransitioning(false)
			}, 300)
		},
		[contentList.length, isTransitioning]
	)

	const navigateToNext = useCallback(() => {
		navigateToIndex(currentIndex + 1)
	}, [currentIndex, navigateToIndex])

	const navigateToPrevious = useCallback(() => {
		navigateToIndex(currentIndex - 1)
	}, [currentIndex, navigateToIndex])

	// Enhanced drag handlers
	const handleDragStart = useCallback(
		(clientY: number) => {
			if (isTransitioning) return
			setStartY(clientY)
			setIsDragging(true)
			setDragOffset(0)
		},
		[isTransitioning]
	)

	const handleDragMove = useCallback(
		(clientY: number) => {
			if (!isDragging || isTransitioning) return

			const rawOffset = clientY - startY
			let offset = rawOffset

			if (currentIndex === 0 && rawOffset > 0) {
				offset = rawOffset * 0.3
			} else if (currentIndex === contentList.length - 1 && rawOffset < 0) {
				offset = rawOffset * 0.3
			}

			offset = Math.max(-MAX_DRAG_DISTANCE, Math.min(MAX_DRAG_DISTANCE, offset))
			setDragOffset(offset)
		},
		[
			isDragging,
			isTransitioning,
			startY,
			currentIndex,
			contentList.length,
			MAX_DRAG_DISTANCE
		]
	)

	const handleDragEnd = useCallback(() => {
		if (!isDragging || isTransitioning) return

		setIsDragging(false)

		const dragDistance = Math.abs(dragOffset)
		const dragDirection = dragOffset > 0 ? 'down' : 'up'

		if (dragDistance > DRAG_THRESHOLD) {
			if (dragDirection === 'up' && currentIndex < contentList.length - 1) {
				navigateToNext()
			} else if (dragDirection === 'down' && currentIndex > 0) {
				navigateToPrevious()
			} else {
				setDragOffset(0)
			}
		} else {
			setDragOffset(0)
		}
	}, [
		isDragging,
		isTransitioning,
		dragOffset,
		currentIndex,
		contentList.length,
		navigateToNext,
		navigateToPrevious
	])

	// Touch handlers
	const handleTouchStart = (e: React.TouchEvent) => {
		handleDragStart(e.touches[0].clientY)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		e.preventDefault()
		handleDragMove(e.touches[0].clientY)
	}

	const handleTouchEnd = () => {
		handleDragEnd()
	}

	// Mouse handlers
	const handleMouseDown = (e: React.MouseEvent) => {
		handleDragStart(e.clientY)
		e.preventDefault()
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			handleDragMove(e.clientY)
		}
	}

	const handleMouseUp = () => {
		handleDragEnd()
	}

	// Global mouse up handler
	useEffect(() => {
		const handleGlobalMouseUp = () => {
			if (isDragging) {
				handleDragEnd()
			}
		}

		if (isDragging) {
			document.addEventListener('mouseup', handleGlobalMouseUp)
			document.addEventListener('mouseleave', handleGlobalMouseUp)
			return () => {
				document.removeEventListener('mouseup', handleGlobalMouseUp)
				document.removeEventListener('mouseleave', handleGlobalMouseUp)
			}
		}
	}, [isDragging, handleDragEnd])

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				navigateToPrevious()
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				navigateToNext()
			} else if (e.key === 'Escape') {
				e.preventDefault()
				handleBackToProfile()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [navigateToNext, navigateToPrevious])

	// Handle media view
	const handleMediaView = useCallback(async () => {
		const currentContent = contentList[currentIndex]
		if (currentContent) {
			try {
				await incrementView({ contentId: currentContent.id })
			} catch (error) {
				console.error('Failed to increment view:', error)
			}
		}
	}, [contentList, currentIndex, incrementView])

	// Auto-trigger view increment when content changes
	useEffect(() => {
		const currentContent = contentList[currentIndex]
		if (currentContent && !isDragging) {
			const timer = setTimeout(() => {
				handleMediaView()
			}, 1000)

			return () => clearTimeout(timer)
		}
	}, [contentList, currentIndex, handleMediaView, isDragging])

	// Handle back to profile
	const handleBackToProfile = () => {
		navigate({
			to: '/profile/$address',
			params: { address: profileAddress }
		})
	}

	// Calculate transform for content container
	const getTransformY = () => {
		const baseTransform = -currentIndex * CONTAINER_HEIGHT
		const dragTransform = isDragging || isTransitioning ? dragOffset : 0
		return baseTransform + dragTransform
	}

	// Render content item
	const renderContentItem = (content: ContentMedia, index: number) => {
		const isActive = index === currentIndex
		const shouldRender = Math.abs(index - currentIndex) <= 1

		if (!shouldRender) return null

		return (
			<div
				key={content.id}
				className="absolute inset-0 w-full"
				style={{
					height: `${CONTAINER_HEIGHT}px`,
					top: `${index * CONTAINER_HEIGHT}px`
				}}>
				<div className="relative w-full h-full">
					{content.resourceType === 'video' ? (
						<VideoDisplay
							videoUrl={content.mediaUrl}
							thumbnailUrl={content.thumbnailUrl}
							onPlay={isActive ? handleMediaView : () => {}}
							audioEnabled={audioEnabled && isActive}
							className="w-full h-full"
							showEnhancedControls={isActive}
						/>
					) : (
						<ImageCarousel
							images={
								content.images || [
									{
										url: content.mediaUrl,
										alt: 'Content'
									}
								]
							}
							onView={isActive ? handleMediaView : () => {}}
							className="w-full h-full"
						/>
					)}

					{/* Content overlay - only show for active content */}
					{isActive && (
						<>
							{/* Back button at the top */}
							<div className="absolute top-4 left-4 z-20">
								<Button
									onClick={handleBackToProfile}
									variant="neutral"
									size="sm"
									className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Profile
								</Button>
							</div>

							{/* Token information at the bottom */}
							{content.promotedTokenId && (
								<div className="absolute bottom-5 left-4 right-4 z-10">
									<TokenInfo
										tokenId={content.promotedTokenId}
										className="w-full"
										kolAddress={content.creatorAddress}
									/>
								</div>
							)}

							{/* Engagement actions on the right side */}
							<div
								className={cn(
									'absolute bottom-5 right-4 z-10',
									content.promotedTokenId ? 'bottom-28' : 'bottom-5'
								)}>
								<EngagementActions contentId={content.id} />
							</div>

							{/* Bottom section with user info and content */}
							<div
								className={cn(
									'absolute bottom-4 left-4 right-20 z-10',
									content.promotedTokenId ? 'bottom-28' : 'bottom-5'
								)}>
								{/* User Profile */}
								<div className="mb-3">
									<UserProfile
										author={content.author}
										onProfileClick={handleBackToProfile}
									/>
								</div>

								{/* Title */}
								<div className="mb-2">
									<h3 className="font-semibold text-lg text-white leading-tight">
										{content.title}
									</h3>
								</div>

								{/* Description */}
								{content.description && (
									<div className="mb-2">
										<p className="text-sm text-white/90 leading-relaxed">
											{content.description}
										</p>
									</div>
								)}

								{/* Hashtags */}
								<div>
									<Hashtags
										hashtags={content.hashtags}
										onHashtagClick={(hashtag) => {
											console.log('Search hashtag:', hashtag)
										}}
									/>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		)
	}

	// Show loading if no content yet
	if (contentList.length === 0) {
		return (
			<div
				className={cn('flex items-center justify-center h-[100vh]', className)}>
				<p className="text-gray-500">Loading...</p>
			</div>
		)
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				'relative bg-black w-full overflow-hidden cursor-grab select-none',
				isDragging && 'cursor-grabbing',
				className
			)}
			style={{ height: `${CONTAINER_HEIGHT}px` }}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}>
			{/* Content container with smooth transforms */}
			<div
				className="relative w-full"
				style={{
					height: `${contentList.length * CONTAINER_HEIGHT}px`,
					transform: `translateY(${getTransformY()}px)`,
					transition: isDragging
						? 'none'
						: isTransitioning
							? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
							: 'transform 0.2s ease-out',
					willChange: 'transform'
				}}>
				{contentList.map((content, index) => renderContentItem(content, index))}
			</div>

			{/* Drag indicator */}
			{isDragging && Math.abs(dragOffset) > 20 && (
				<div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 z-20 flex justify-center">
					<div className="bg-black/50 rounded-full px-4 py-2 text-white text-sm flex items-center space-x-2">
						{dragOffset > 0 ? (
							<>
								<span>↓</span>
								<span>
									{currentIndex > 0 ? 'Previous' : 'Already at start'}
								</span>
							</>
						) : (
							<>
								<span>↑</span>
								<span>
									{currentIndex < contentList.length - 1
										? 'Next'
										: 'Already at end'}
								</span>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
