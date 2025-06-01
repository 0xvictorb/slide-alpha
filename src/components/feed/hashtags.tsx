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

	const formatHashtag = (hashtag: string) => {
		return hashtag.startsWith('#') ? hashtag : `#${hashtag}`
	}

	return (
		<div className={cn('flex flex-wrap gap-1', className)}>
			{hashtags.map((hashtag, index) => (
				<Badge
					key={index}
					variant="neutral"
					onClick={() => handleHashtagClick(hashtag)}>
					{formatHashtag(hashtag)}
				</Badge>
			))}
		</div>
	)
}
