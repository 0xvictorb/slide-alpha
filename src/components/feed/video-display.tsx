import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/shared/video-player'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoDisplayProps {
	videoUrl: string
	thumbnailUrl?: string
	className?: string
	onPlay?: () => void
}

export function VideoDisplay({
	videoUrl,
	thumbnailUrl,
	className,
	onPlay
}: VideoDisplayProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(true)
	const [hasStarted, setHasStarted] = useState(false)
	const [hasTrackedView, setHasTrackedView] = useState(false)

	// Use intersection observer to detect when video is in view
	const { ref: videoRef, inView } = useInView({
		threshold: 0.5 // Trigger when 50% of the video is visible
	})

	// Handle autoplay when video comes into view
	if (hasStarted && inView !== isPlaying) {
		setIsPlaying(inView)
	}

	const handleVideoReady = () => {
		console.log('Video ready')
	}

	const handleGetStarted = () => {
		setHasStarted(true)
		setIsMuted(false)
		setIsPlaying(true)

		// Track view only once when user starts watching
		if (!hasTrackedView) {
			setHasTrackedView(true)
			onPlay?.()
		}
	}

	return (
		<div
			ref={videoRef}
			className={cn(
				'relative w-full h-full flex items-center justify-center bg-black',
				className
			)}>
			<div className="relative w-full h-full max-w-[calc(100vh*9/16)] max-h-screen">
				<VideoPlayer
					videoUrl={videoUrl}
					thumbnailUrl={thumbnailUrl || ''}
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

				{/* Mute/Unmute Button - only show after started */}
				{hasStarted && (
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
		</div>
	)
}
