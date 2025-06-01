import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HashtagsProps {
	hashtags?: string[]
	className?: string
	onHashtagClick?: (hashtag: string) => void
}

export function Hashtags({
	hashtags,
	className,
	onHashtagClick
}: HashtagsProps) {
	if (!hashtags || hashtags.length === 0) return null

	const handleHashtagClick = (hashtag: string) => {
		onHashtagClick?.(hashtag)
		// TODO: Navigate to hashtag search or filter
		// navigate(`/search?hashtag=${encodeURIComponent(hashtag)}`)
	}

	return (
		<div className={cn('flex flex-wrap gap-1', className)}>
			{hashtags.map((hashtag, index) => (
				<Badge
					key={index}
					variant="neutral"
					className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer transition-colors text-xs"
					onClick={() => handleHashtagClick(hashtag)}>
					#{hashtag}
				</Badge>
			))}
		</div>
	)
}
