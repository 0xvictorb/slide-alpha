import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { VideoPlayer } from '@/components/shared/video-player'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface VideoFeedProps {
	className?: string
}

export function VideoFeed({ className }: VideoFeedProps) {
	const [currentVideo, setCurrentVideo] = useState<{
		videoUrl: string
		thumbnailUrl?: string
		resourceType: 'video' | 'image'
	} | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(true)
	const [hasStarted, setHasStarted] = useState(false)

	// Use intersection observer to detect when video is in view
	const { ref: videoRef, inView } = useInView({
		threshold: 0.5 // Trigger when 50% of the video is visible
	})

	// Fetch first video from the content table
	const firstContent = useQuery(api.content.getFirstActiveContent)

	// When we get the content data, set it as current
	useEffect(() => {
		if (firstContent) {
			setCurrentVideo({
				videoUrl: firstContent.streamingUrl,
				thumbnailUrl: firstContent.thumbnailUrl,
				resourceType: firstContent.cloudinaryResourceType
			})
		}
	}, [firstContent])

	// Handle autoplay when video comes into view
	useEffect(() => {
		if (currentVideo?.resourceType === 'video' && hasStarted) {
			setIsPlaying(inView)
		}
	}, [inView, currentVideo, hasStarted])

	// Handle video ready
	const handleVideoReady = () => {
		console.log('Video ready')
	}

	const handleGetStarted = () => {
		setHasStarted(true)
		setIsMuted(false)
		setIsPlaying(true)
	}

	if (!currentVideo) {
		return (
			<div className={cn('w-full aspect-[9/16] bg-gray-100', className)}>
				<div className="flex items-center justify-center h-full">
					<p className="text-gray-500">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div
			ref={videoRef}
			className={cn(
				'w-full aspect-[9/16] bg-black relative overflow-hidden',
				className
			)}>
			{currentVideo.resourceType === 'video' ? (
				<>
					<VideoPlayer
						videoUrl={currentVideo.videoUrl}
						thumbnailUrl={''}
						isMuted={isMuted}
						isPlaying={isPlaying}
						onVideoReady={handleVideoReady}
						loadStrategy="eager"
					/>
					{!hasStarted && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
							<Button
								onClick={handleGetStarted}
								size="lg"
								className="flex items-center gap-2">
								<Play className="w-4 h-4" />
								Get Started
							</Button>
						</div>
					)}
				</>
			) : (
				<img
					src={currentVideo.videoUrl}
					alt="Content"
					className="w-full h-full object-cover"
				/>
			)}

			{/* Mute/Unmute Button - only show for videos after started */}
			{currentVideo.resourceType === 'video' && hasStarted && (
				<button
					onClick={() => setIsMuted(!isMuted)}
					className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white">
					{isMuted ? (
						<span className="sr-only">Unmute</span>
					) : (
						<span className="sr-only">Mute</span>
					)}
				</button>
			)}
		</div>
	)
}
