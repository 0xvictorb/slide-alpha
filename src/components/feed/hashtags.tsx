import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'

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
	const navigate = useNavigate()

	if (!hashtags || hashtags.length === 0) return null

	const handleHashtagClick = (hashtag: string) => {
		if (onHashtagClick) {
			// If custom handler is provided, use it
			onHashtagClick(hashtag)
		} else {
			// Default behavior: navigate to search page with hashtag
			navigate({
				to: '/search',
				search: { hashtag, q: '' }
			})
		}
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
