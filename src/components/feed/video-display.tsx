import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoPlayer } from '@/components/shared/video-player'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoDisplayProps {
	videoUrl: string
	thumbnailUrl?: string
	className?: string
	onPlay?: () => void
	audioEnabled?: boolean
}

export function VideoDisplay({
	videoUrl,
	thumbnailUrl,
	className,
	onPlay,
	audioEnabled = false
}: VideoDisplayProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(!audioEnabled) // Start muted if audio not enabled
	const [hasTrackedView, setHasTrackedView] = useState(false)

	// Use intersection observer to detect when video is in view
	const { ref: videoRef, inView } = useInView({
		threshold: 0.5 // Trigger when 50% of the video is visible
	})

	// Handle autoplay when video comes into view
	useEffect(() => {
		setIsPlaying(inView)

		// Track view only once when video comes into view and starts playing
		if (inView && !hasTrackedView) {
			setHasTrackedView(true)
			onPlay?.()
		}
	}, [inView, hasTrackedView, onPlay])

	// Update muted state when audioEnabled changes
	useEffect(() => {
		if (audioEnabled) {
			setIsMuted(false) // Unmute when audio is enabled
		} else {
			setIsMuted(true) // Keep muted if audio not enabled
		}
	}, [audioEnabled])

	const handleVideoReady = () => {
		console.log('Video ready')
	}

	const handleMuteToggle = () => {
		// Only allow unmuting if audio is enabled
		if (audioEnabled) {
			setIsMuted(!isMuted)
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

				{/* Mute/Unmute Button */}
				<button
					onClick={handleMuteToggle}
					disabled={!audioEnabled}
					className={cn(
						'absolute bottom-4 right-4 z-10 p-2 rounded-full transition-colors',
						audioEnabled
							? 'bg-black/50 text-white hover:bg-black/70'
							: 'bg-black/30 text-white/50 cursor-not-allowed'
					)}>
					{isMuted ? (
						<VolumeX className="w-5 h-5" />
					) : (
						<Volume2 className="w-5 h-5" />
					)}
				</button>

				{/* Audio disabled indicator */}
				{!audioEnabled && (
					<div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg px-2 py-1 text-white text-xs">
						Audio disabled
					</div>
				)}
			</div>
		</div>
	)
}
