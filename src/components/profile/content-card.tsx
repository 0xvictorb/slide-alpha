import { Badge } from '@/components/ui/badge'
import { Play, Clock, Eye } from 'lucide-react'

interface ContentCardProps {
	content: {
		_id: string
		_creationTime: number
		contentType: 'video' | 'images'
		video?: {
			cloudinaryPublicId: string
			cloudinaryUrl: string
			thumbnailUrl: string
			duration: number
		}
		images?: Array<{
			cloudinaryPublicId: string
			cloudinaryUrl: string
			order: number
		}>
		title: string
		description?: string
		hashtags?: string[]
		isPremium: boolean
		isActive: boolean
		viewCount: number
		lastViewedAt?: number
		promotedTokenId?: string
	}
}

export function ContentCard({ content }: ContentCardProps) {
	const getThumbnail = () => {
		if (content.contentType === 'video' && content.video) {
			return content.video.thumbnailUrl
		}
		if (content.contentType === 'images' && content.images?.[0]) {
			return content.images[0].cloudinaryUrl
		}
		return '/placeholder-video.jpg'
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		})
	}

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	return (
		<div className="group relative bg-muted rounded-lg overflow-hidden aspect-[9/16] cursor-pointer hover:scale-105 transition-transform">
			{/* Thumbnail */}
			<img
				src={getThumbnail()}
				alt={content.title}
				className="w-full h-full object-cover"
			/>

			{/* Overlay */}
			<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

			{/* Content Info */}
			<div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
				<h3 className="text-white text-sm font-medium truncate">
					{content.title}
				</h3>
				<div className="flex items-center gap-3 mt-1 text-xs text-white/80">
					<div className="flex items-center gap-1">
						<Eye className="h-3 w-3" />
						{content.viewCount}
					</div>
					<div className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{formatDate(content._creationTime)}
					</div>
					{content.contentType === 'video' && content.video && (
						<span>{formatDuration(content.video.duration)}</span>
					)}
				</div>
			</div>

			{/* Premium Badge */}
			{content.isPremium && (
				<div className="absolute top-2 right-2">
					<Badge variant="default" className="text-xs">
						Premium
					</Badge>
				</div>
			)}

			{/* Play Icon */}
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
					<Play className="h-6 w-6 text-white fill-white" />
				</div>
			</div>
		</div>
	)
}
