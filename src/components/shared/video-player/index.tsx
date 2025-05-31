import '@vidstack/react/player/styles/base.css'
import { useEffect, useRef, useState, forwardRef } from 'react'
import {
	isHLSProvider,
	MediaPlayer,
	MediaProvider,
	// Poster,
	type MediaPlayerInstance,
	type MediaProviderAdapter,
	type MediaProviderChangeEvent,
	type MediaCanPlayDetail,
	type MediaCanPlayEvent,
	type MediaLoadingStrategy
} from '@vidstack/react'
import { VideoLayout } from '@/components/shared/video-player/layouts/video-layout'

interface VideoPlayerProps {
	videoUrl: string
	thumbnailUrl: string
	preloadedVideoUrl?: string
	isMuted: boolean
	isPlaying: boolean
	onVideoReady?: () => void
	onPlay?: () => void
	loadStrategy?: MediaLoadingStrategy
}

export const VideoPlayer = forwardRef<MediaPlayerInstance, VideoPlayerProps>(
	(
		{
			videoUrl,
			// thumbnailUrl,
			preloadedVideoUrl,
			isMuted,
			isPlaying,
			onVideoReady,
			onPlay,
			loadStrategy = 'eager'
		},
		ref
	) => {
		const internalPlayerRef = useRef<MediaPlayerInstance>(null)
		const [isMediaReady, setIsMediaReady] = useState(false)
		const [_playError, setPlayError] = useState<Error | null>(null)
		const shouldPlayRef = useRef(isPlaying)

		// Use the forwarded ref or fallback to internal ref
		const playerRef = ref || internalPlayerRef

		// Handle volume and mute changes
		useEffect(() => {
			const player = typeof playerRef === 'object' && playerRef?.current
			if (player) {
				player.volume = isMuted ? 0 : 1
				player.muted = isMuted
			}
		}, [isMuted, playerRef])

		// Handle play/pause changes
		useEffect(() => {
			shouldPlayRef.current = isPlaying
			const player = typeof playerRef === 'object' && playerRef?.current
			if (player && isMediaReady) {
				if (isPlaying) {
					player
						.play()
						.then(() => {
							onPlay?.()
						})
						.catch((error) => {
							console.error('Play error:', error)
							setPlayError(error)
							// If autoplay failed, try playing muted
							if (error.name === 'NotAllowedError') {
								player.muted = true
								player
									.play()
									.then(() => {
										onPlay?.()
									})
									.catch(console.error)
							}
						})
				} else {
					player.pause()
				}
			}
		}, [isPlaying, isMediaReady, onPlay, playerRef])

		function onProviderChange(
			provider: MediaProviderAdapter | null,
			_nativeEvent: MediaProviderChangeEvent
		) {
			if (isHLSProvider(provider)) {
				provider.config = {}
			}
		}

		function onCanPlay(
			_detail: MediaCanPlayDetail,
			_nativeEvent: MediaCanPlayEvent
		) {
			setIsMediaReady(true)
			// Call onVideoReady callback when video is ready
			onVideoReady?.()
			// Ensure initial volume and mute state
			const player = typeof playerRef === 'object' && playerRef?.current
			if (player) {
				player.volume = isMuted ? 0 : 1
				player.muted = isMuted
				// If we should be playing when media becomes ready, start playing
				if (shouldPlayRef.current) {
					player.play().catch((error) => {
						console.error('Play error:', error)
						setPlayError(error)
						// If autoplay failed, try playing muted
						if (error.name === 'NotAllowedError') {
							player.muted = true
							player.play().catch(console.error)
						}
					})
				}
			}
		}

		return (
			<MediaPlayer
				className="w-full h-full bg-black text-white overflow-hidden [&_video]:!object-cover [&_video]:!h-full"
				crossOrigin
				playsInline
				onProviderChange={onProviderChange}
				onCanPlay={onCanPlay}
				ref={playerRef}
				src={preloadedVideoUrl || videoUrl}
				volume={isMuted ? 0 : 1}
				muted={isMuted}
				load={loadStrategy}
				loop>
				<MediaProvider>
					{/* <Poster
					className="absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
					src={thumbnailUrl}
					alt="Video thumbnail"
					crossOrigin="anonymous"
				/> */}
				</MediaProvider>

				<VideoLayout />
			</MediaPlayer>
		)
	}
)
