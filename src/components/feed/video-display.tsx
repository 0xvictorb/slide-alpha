import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoPlayer } from '@/components/shared/video-player'
import { cn } from '@/lib/utils'
import type { MediaPlayerInstance } from '@vidstack/react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	VolumeHighIcon,
	VolumeMute02Icon,
	PlayIcon
} from '@hugeicons/core-free-icons'

interface VideoDisplayProps {
	videoUrl: string
	thumbnailUrl?: string
	className?: string
	onPlay?: () => void
	audioEnabled?: boolean
	showEnhancedControls?: boolean
}

export function VideoDisplay({
	videoUrl,
	thumbnailUrl,
	className,
	onPlay,
	audioEnabled = false,
	showEnhancedControls = false
}: VideoDisplayProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(!audioEnabled) // Start muted if audio not enabled
	const [hasTrackedView, setHasTrackedView] = useState(false)
	const [showSoundButton, setShowSoundButton] = useState(false)

	// Ref for the video player
	const playerRef = useRef<MediaPlayerInstance>(null)
	const hideButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

		// Show sound button when video starts playing
		if (inView && showEnhancedControls) {
			handleVideoPlayStart()
		}
	}, [inView, hasTrackedView, onPlay, showEnhancedControls])

	// Handle sound button visibility when muted state changes
	useEffect(() => {
		if (!showEnhancedControls) return

		if (isPlaying) {
			if (isMuted) {
				// Keep button visible when muted and playing
				setShowSoundButton(true)
				// Clear any existing timeout
				if (hideButtonTimeoutRef.current) {
					clearTimeout(hideButtonTimeoutRef.current)
					hideButtonTimeoutRef.current = null
				}
			} else {
				// Show briefly then fade out when unmuted
				setShowSoundButton(true)

				// Clear existing timeout
				if (hideButtonTimeoutRef.current) {
					clearTimeout(hideButtonTimeoutRef.current)
				}

				// Hide after 3 seconds if unmuted
				hideButtonTimeoutRef.current = setTimeout(() => {
					setShowSoundButton(false)
				}, 3000)
			}
		} else {
			// Hide when not playing
			setShowSoundButton(false)
		}
	}, [isMuted, isPlaying, showEnhancedControls])

	// Update muted state when audioEnabled changes
	useEffect(() => {
		if (audioEnabled) {
			setIsMuted(false) // Unmute when audio is enabled
		} else {
			setIsMuted(true) // Keep muted if audio not enabled
		}
	}, [audioEnabled])

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (hideButtonTimeoutRef.current) {
				clearTimeout(hideButtonTimeoutRef.current)
			}
		}
	}, [])

	const handleVideoReady = () => {
		console.log('Video ready')
	}

	const handleVideoPlayStart = () => {
		if (!showEnhancedControls) return

		setShowSoundButton(true)

		// If unmuted, hide after delay
		if (!isMuted) {
			// Clear existing timeout
			if (hideButtonTimeoutRef.current) {
				clearTimeout(hideButtonTimeoutRef.current)
			}

			hideButtonTimeoutRef.current = setTimeout(() => {
				setShowSoundButton(false)
			}, 3000)
		}
		// If muted, keep visible (no timeout)
	}

	const handleMuteToggle = () => {
		// Only allow unmuting if audio is enabled
		if (playerRef.current) {
			const newMuted = !isMuted
			setIsMuted(newMuted)
			playerRef.current.muted = newMuted
		}

		// Don't call showSoundButtonTemporarily here anymore
		// The useEffect will handle the visibility based on muted state
	}

	const handlePlayPause = () => {
		if (!playerRef.current) return

		if (isPlaying) {
			playerRef.current.pause()
			setIsPlaying(false)
		} else {
			playerRef.current.play()
			setIsPlaying(true)
		}
	}

	return (
		<div
			ref={videoRef}
			className={cn(
				'relative w-full h-full flex items-center justify-center bg-black',
				className
			)}>
			<div className="relative w-full h-full">
				<VideoPlayer
					ref={playerRef}
					videoUrl={videoUrl}
					thumbnailUrl={thumbnailUrl || ''}
					isMuted={isMuted}
					isPlaying={isPlaying}
					onVideoReady={handleVideoReady}
					loadStrategy="eager"
				/>

				{/* Enhanced Video Controls */}
				{showEnhancedControls && (
					<>
						{/* Sound toggle button - Top right (hidden by default) */}
						<button
							onClick={handleMuteToggle}
							className={cn(
								'absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300',
								showSoundButton
									? 'opacity-100 scale-100'
									: 'opacity-0 scale-75 pointer-events-none',
								'bg-black/50 text-white hover:bg-black/70 hover:scale-110'
							)}>
							{isMuted ? (
								<HugeiconsIcon icon={VolumeMute02Icon} className="w-6 h-6" />
							) : (
								<HugeiconsIcon icon={VolumeHighIcon} className="w-6 h-6" />
							)}
						</button>

						{/* Center play/pause area */}
						<div
							className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
							onClick={handlePlayPause}>
							{/* Pause icon overlay - only show when paused */}
							{!isPlaying && (
								<div className="bg-black/60 rounded-full p-4 transition-all duration-200 hover:bg-black/80 hover:scale-110">
									<HugeiconsIcon
										icon={PlayIcon}
										className="size-12 text-white"
									/>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
