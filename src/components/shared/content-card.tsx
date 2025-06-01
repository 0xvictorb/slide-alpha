import { ImageIcon, Play, Clock, Eye, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

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
		authorId: string
		authorName?: string
		authorAvatarUrl?: string
		likeCount?: number
	}
	showStats?: boolean
	showDescription?: boolean
	className?: string
	onContentClick?: (contentId: string) => void
	profileAddress?: string
}

function formatViews(views: number) {
	if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
	if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
	return views.toString()
}

function formatDuration(seconds: number) {
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(timestamp: number) {
	return new Date(timestamp).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	})
}

export function ContentCard({
	content,
	showStats = true,
	showDescription = false,
	className,
	onContentClick,
	profileAddress
}: ContentCardProps) {
	const navigate = useNavigate()

	const getThumbnail = () => {
		if (content.contentType === 'video' && content.video) {
			return content.video.thumbnailUrl
		}
		if (content.contentType === 'images' && content.images?.[0]) {
			return content.images[0].cloudinaryUrl
		}
		return '/placeholder-video.jpg'
	}

	const handleClick = () => {
		if (onContentClick) {
			onContentClick(content._id)
			return
		}

		if (profileAddress) {
			navigate({
				to: '/profile/$address/content/$contentId',
				params: {
					address: profileAddress,
					contentId: content._id
				}
			})
		}
	}

	return (
		<Card
			className={cn(
				'group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out aspect-[9/16] p-0',
				'bg-black hover:scale-[1.02] hover:shadow-xl hover:shadow-black/25',
				className
			)}
			onClick={handleClick}>
			{/* Media Container */}
			<div className="relative h-full overflow-hidden">
				<img
					src={getThumbnail()}
					alt={content.title}
					className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
				/>

				{/* Main Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 transition-opacity duration-300 group-hover:from-black/80" />

				{/* Top Badges */}
				<div className="absolute top-3 left-3 flex gap-2">
					<Badge
						variant="secondary"
						className="bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg">
						{content.contentType === 'video' ? (
							<>
								<Play className="w-3 h-3 mr-1 fill-current" />
								{content.video
									? formatDuration(content.video.duration)
									: '0:00'}
							</>
						) : (
							<>
								<ImageIcon className="w-3 h-3 mr-1" />
								{content.images?.length || 1}
							</>
						)}
					</Badge>
				</div>

				{/* Premium Badge */}
				{content.isPremium && (
					<div className="absolute top-3 right-3">
						<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg font-medium">
							Premium
						</Badge>
					</div>
				)}

				{/* Stats Overlay - Top Right */}
				{showStats && (
					<div
						className={cn(
							'absolute right-3 flex flex-col gap-2',
							content.isPremium ? 'top-12' : 'top-3'
						)}>
						<Badge
							variant="secondary"
							className="bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg text-xs">
							<Eye className="w-3 h-3 mr-1" />
							{formatViews(content.viewCount)}
						</Badge>
						{content.likeCount !== undefined && content.likeCount > 0 && (
							<Badge
								variant="secondary"
								className="bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg text-xs">
								<Heart className="w-3 h-3 mr-1" />
								{formatViews(content.likeCount)}
							</Badge>
						)}
					</div>
				)}

				{/* Play Icon Overlay */}
				{content.contentType === 'video' && (
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<div className="bg-white/20 backdrop-blur-md rounded-full p-4 shadow-2xl">
							<Play className="h-8 w-8 text-white fill-white" />
						</div>
					</div>
				)}

				{/* Content Overlay - Bottom */}
				<div className="absolute bottom-0 left-0 right-0 p-4">
					<div className="flex justify-between items-end gap-2">
						{/* Main content stacked vertically */}
						<div className="space-y-2">
							{/* Title */}
							<h3 className="text-white font-medium text-sm leading-tight line-clamp-2 drop-shadow-lg">
								{content.title}
							</h3>

							{/* Description */}
							{showDescription && content.description && (
								<p className="text-white/90 text-xs leading-relaxed line-clamp-2 drop-shadow-lg">
									{content.description}
								</p>
							)}
						</div>

						{/* Time - Bottom right */}
						<div className="flex justify-end whitespace-nowrap">
							<div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white/70">
								<Clock className="h-3 w-3" />
								{formatDate(content._creationTime)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}
