import '@vidstack/react/player/styles/base.css'
import { useEffect, useRef, useState } from 'react'
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
	loadStrategy?: MediaLoadingStrategy
}

export const VideoPlayer = ({
	videoUrl,
	// thumbnailUrl,
	preloadedVideoUrl,
	isMuted,
	isPlaying,
	onVideoReady,
	loadStrategy = 'eager'
}: VideoPlayerProps) => {
	const player = useRef<MediaPlayerInstance>(null)
	const [isMediaReady, setIsMediaReady] = useState(false)
	const [_playError, setPlayError] = useState<Error | null>(null)
	const shouldPlayRef = useRef(isPlaying)

	// Handle volume and mute changes
	useEffect(() => {
		if (player.current) {
			player.current.volume = isMuted ? 0 : 1
			player.current.muted = isMuted
		}
	}, [isMuted])

	// Handle play/pause changes
	useEffect(() => {
		shouldPlayRef.current = isPlaying
		if (player.current && isMediaReady) {
			if (isPlaying) {
				player.current.play().catch((error) => {
					console.error('Play error:', error)
					setPlayError(error)
					// If autoplay failed, try playing muted
					if (error.name === 'NotAllowedError') {
						player.current!.muted = true
						player.current!.play().catch(console.error)
					}
				})
			} else {
				player.current.pause()
			}
		}
	}, [isPlaying, isMediaReady])

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
		if (player.current) {
			player.current.volume = isMuted ? 0 : 1
			player.current.muted = isMuted
			// If we should be playing when media becomes ready, start playing
			if (shouldPlayRef.current) {
				player.current.play().catch((error) => {
					console.error('Play error:', error)
					setPlayError(error)
					// If autoplay failed, try playing muted
					if (error.name === 'NotAllowedError') {
						player.current!.muted = true
						player.current!.play().catch(console.error)
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
			ref={player}
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
