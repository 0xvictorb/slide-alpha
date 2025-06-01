import { useEffect, useState, useRef, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading02Icon, AiSecurity01Icon } from '@hugeicons/core-free-icons'
import { VideoDisplay } from './video-display'
import { ImageCarousel } from './image-carousel'
import { EngagementActions } from './engagement-actions'
import { TokenInfo } from './token-info'
import { UserProfile } from './user-profile'
import { Hashtags } from './hashtags'
import { SplashScreen, hasCompletedSplash } from '@/components/splash'

interface ContentFeedProps {
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
	isOnChain?: boolean
	author: {
		id: Id<'users'>
		name: string
		avatarUrl?: string
		walletAddress: string
	}
}

export function ContentFeed({ className }: ContentFeedProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [contentList, setContentList] = useState<ContentMedia[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [cursor, setCursor] = useState<string | null>(null)
	const [hasMore, setHasMore] = useState(true)
	const [shouldLoadMore, setShouldLoadMore] = useState(false)
	const [showSplash, setShowSplash] = useState(!hasCompletedSplash())
	const [audioEnabled, setAudioEnabled] = useState(false)

	// Enhanced drag/swipe state for TikTok-like experience
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [startY, setStartY] = useState(0)

	// Refs
	const containerRef = useRef<HTMLDivElement>(null)
	const incrementView = useMutation(api.content.incrementView)
	const navigate = useNavigate()

	// Animation constants
	const CONTAINER_HEIGHT =
		typeof window !== 'undefined' ? window.innerHeight - 80 : 720
	const DRAG_THRESHOLD = 100 // Minimum drag distance to trigger navigation
	const MAX_DRAG_DISTANCE = CONTAINER_HEIGHT * 0.8 // Maximum drag distance

	// Always load initial content, regardless of splash screen state
	const initialContent = useQuery(api.content.getPaginatedContent, {
		paginationOpts: { numItems: 5, cursor: null },
		preferVideos: true
	})

	// Load more content when shouldLoadMore is true
	const loadMoreContent = useQuery(
		api.content.getPaginatedContent,
		shouldLoadMore && cursor
			? {
					paginationOpts: { numItems: 5, cursor },
					preferVideos: true
				}
			: 'skip'
	)

	// Content stats for current item - only load if splash is complete
	const currentContent = contentList[currentIndex]

	// Handle splash completion
	const handleSplashComplete = () => {
		setShowSplash(false)
		setAudioEnabled(true) // Enable audio after user interaction
	}

	// Format content item helper
	const formatContentItem = useCallback((content: any): ContentMedia => {
		const baseContent = {
			id: content._id,
			promotedTokenId: content.promotedTokenId || '',
			creatorAddress: content.authorWalletAddress || '',
			title: content.title,
			description: content.description,
			hashtags: content.hashtags,
			isOnChain: content.isOnChain || false,
			author: {
				id: content.authorId,
				name: content.authorName || 'Anonymous',
				avatarUrl: content.authorAvatarUrl,
				walletAddress: content.authorWalletAddress || ''
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
	}, [])

	// Initialize content list - happens regardless of splash screen
	useEffect(() => {
		if (initialContent?.page && contentList.length === 0) {
			const formattedContent = initialContent.page.map(formatContentItem)
			setContentList(formattedContent)
			setCursor(initialContent.continueCursor)
			setHasMore(!initialContent.isDone)
		}
	}, [initialContent, contentList.length, formatContentItem])

	// Handle loading more content
	useEffect(() => {
		if (loadMoreContent?.page && shouldLoadMore) {
			const formattedContent = loadMoreContent.page.map(formatContentItem)
			setContentList((prev) => [...prev, ...formattedContent])
			setCursor(loadMoreContent.continueCursor)
			setHasMore(!loadMoreContent.isDone)
			setIsLoading(false)
			setShouldLoadMore(false)
		}
	}, [loadMoreContent, shouldLoadMore, formatContentItem])

	// Load more content function
	const loadMoreIfNeeded = useCallback(() => {
		if (
			currentIndex >= contentList.length - 2 &&
			hasMore &&
			!isLoading &&
			cursor
		) {
			setIsLoading(true)
			setShouldLoadMore(true)
		}
	}, [currentIndex, contentList.length, hasMore, isLoading, cursor])

	// Navigation with smooth transition
	const navigateToIndex = useCallback(
		(newIndex: number) => {
			if (newIndex < 0 || newIndex >= contentList.length || isTransitioning)
				return

			setIsTransitioning(true)
			setCurrentIndex(newIndex)
			setDragOffset(0)

			// Reset transition state after animation
			setTimeout(() => {
				setIsTransitioning(false)
			}, 300)

			loadMoreIfNeeded()
		},
		[contentList.length, isTransitioning, loadMoreIfNeeded]
	)

	const navigateToNext = useCallback(() => {
		navigateToIndex(currentIndex + 1)
	}, [currentIndex, navigateToIndex])

	const navigateToPrevious = useCallback(() => {
		navigateToIndex(currentIndex - 1)
	}, [currentIndex, navigateToIndex])

	// Enhanced drag handlers for smooth experience
	const handleDragStart = useCallback(
		(clientY: number) => {
			if (showSplash || isTransitioning) return
			setStartY(clientY)
			setIsDragging(true)
			setDragOffset(0)
		},
		[showSplash, isTransitioning]
	)

	const handleDragMove = useCallback(
		(clientY: number) => {
			if (!isDragging || showSplash || isTransitioning) return

			const rawOffset = clientY - startY

			// Apply resistance at boundaries
			let offset = rawOffset
			if (currentIndex === 0 && rawOffset > 0) {
				// Resistance when trying to go before first item
				offset = rawOffset * 0.3
			} else if (currentIndex === contentList.length - 1 && rawOffset < 0) {
				// Resistance when trying to go after last item
				offset = rawOffset * 0.3
			}

			// Limit maximum drag distance
			offset = Math.max(-MAX_DRAG_DISTANCE, Math.min(MAX_DRAG_DISTANCE, offset))
			setDragOffset(offset)
		},
		[
			isDragging,
			showSplash,
			isTransitioning,
			startY,
			currentIndex,
			contentList.length,
			MAX_DRAG_DISTANCE
		]
	)

	const handleDragEnd = useCallback(() => {
		if (!isDragging || showSplash || isTransitioning) return

		setIsDragging(false)

		const dragDistance = Math.abs(dragOffset)
		const dragDirection = dragOffset > 0 ? 'down' : 'up'

		// Determine if drag was significant enough to navigate
		if (dragDistance > DRAG_THRESHOLD) {
			if (dragDirection === 'up' && currentIndex < contentList.length - 1) {
				navigateToNext()
			} else if (dragDirection === 'down' && currentIndex > 0) {
				navigateToPrevious()
			} else {
				// Snap back to current position
				setDragOffset(0)
			}
		} else {
			// Snap back to current position
			setDragOffset(0)
		}
	}, [
		isDragging,
		showSplash,
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
		e.preventDefault() // Prevent scroll
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
		if (showSplash) return

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				navigateToPrevious()
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				navigateToNext()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [navigateToNext, navigateToPrevious, showSplash])

	// Handle media view (increment view count)
	const handleMediaView = useCallback(async () => {
		if (currentContent && !showSplash) {
			try {
				await incrementView({ contentId: currentContent.id })
			} catch (error) {
				console.error('Failed to increment view:', error)
			}
		}
	}, [currentContent, incrementView, showSplash])

	// Auto-trigger view increment when content changes
	useEffect(() => {
		if (currentContent && !showSplash && !isDragging) {
			const timer = setTimeout(() => {
				handleMediaView()
			}, 1000)

			return () => clearTimeout(timer)
		}
	}, [currentContent, handleMediaView, showSplash, isDragging])

	// Calculate transform for content container
	const getTransformY = () => {
		const baseTransform = -currentIndex * CONTAINER_HEIGHT
		const dragTransform = isDragging || isTransitioning ? dragOffset : 0
		return baseTransform + dragTransform
	}

	// Render content item
	const renderContentItem = (content: ContentMedia, index: number) => {
		const isActive = index === currentIndex
		const shouldRender = Math.abs(index - currentIndex) <= 1 // Render current and adjacent items

		if (!shouldRender) return null

		return (
			<div
				key={content.id}
				className="absolute inset-0 w-full"
				style={{
					height: `${CONTAINER_HEIGHT}px`,
					top: `${index * CONTAINER_HEIGHT}px`
				}}>
				{/* Media content */}
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
							{/* Dark gradient overlay at bottom for better text readability */}
							<div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-5" />

							{/* On-chain indicator */}
							{content.isOnChain && (
								<div className="absolute top-4 left-4 z-10">
									<div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
										<HugeiconsIcon
											icon={AiSecurity01Icon}
											className="w-4 h-4 text-emerald-500"
										/>
										<span className="text-xs font-medium text-emerald-500">
											On-chain
										</span>
									</div>
								</div>
							)}

							{/* Token information at the top */}
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
									'absolute bottom-5 left-4 right-20 z-10',
									content.promotedTokenId ? 'bottom-28' : 'bottom-5'
								)}>
								{/* User Profile */}
								<div className="mb-3">
									<UserProfile
										author={content.author}
										onProfileClick={() => {
											navigate({
												to: '/profile/$address',
												params: { address: content.author.walletAddress }
											})
										}}
									/>
								</div>

								{/* Title */}
								<div className="mb-1">
									<h3 className="font-semibold text-base text-white leading-tight">
										{content.title}
									</h3>
								</div>

								{/* Description */}
								{content.description && (
									<div className="mb-1">
										<p className="text-sm text-white/80 leading-relaxed">
											{content.description}
										</p>
									</div>
								)}

								{/* Hashtags */}
								<div>
									<Hashtags
										hashtags={content.hashtags}
										onHashtagClick={(hashtag) => {
											navigate({
												to: '/search',
												search: { hashtag, q: '' }
											})
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

	// Show splash screen first if not completed
	if (showSplash) {
		return (
			<>
				<SplashScreen
					onComplete={handleSplashComplete}
					contentLoaded={contentList.length > 0}
				/>
				{/* Preload content in background while splash is showing */}
				{contentList.length > 0 && (
					<div className="absolute inset-0 opacity-0 pointer-events-none">
						<div className="relative w-full h-full">
							{currentContent?.resourceType === 'video' ? (
								<VideoDisplay
									videoUrl={currentContent.mediaUrl}
									thumbnailUrl={currentContent.thumbnailUrl}
									onPlay={() => {}}
									audioEnabled={false}
									className="w-full h-full"
									showEnhancedControls={true}
								/>
							) : currentContent ? (
								<ImageCarousel
									images={
										currentContent.images || [
											{
												url: currentContent.mediaUrl,
												alt: 'Content'
											}
										]
									}
									onView={() => {}}
									className="w-full h-full"
								/>
							) : null}
						</div>
					</div>
				)}
			</>
		)
	}

	// Show loading if no content yet
	if (contentList.length === 0) {
		return (
			<div
				className={cn(
					'flex items-center justify-center h-[100vh] bg-black',
					className
				)}>
				<div className="flex flex-col items-center space-y-4">
					<HugeiconsIcon
						icon={Loading02Icon}
						className="w-8 h-8 text-white animate-spin"
					/>
				</div>
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

			{/* Loading indicator */}
			{isLoading && (
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
					<div className="bg-black/50 rounded-lg px-3 py-1 text-white text-sm">
						Loading more...
					</div>
				</div>
			)}

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
