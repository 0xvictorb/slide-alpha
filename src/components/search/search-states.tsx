import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Loading02Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LoadingStateProps {
	message?: string
}

export function LoadingState({ message = 'Searching...' }: LoadingStateProps) {
	return (
		<Card className="border-2 border-border">
			<CardContent className="text-center py-20">
				<HugeiconsIcon
					icon={Loading02Icon}
					className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin"
				/>
				<p className="text-muted-foreground">{message}</p>
			</CardContent>
		</Card>
	)
}

export function NoResultsState() {
	return (
		<Card className="border-2 border-border">
			<CardContent className="text-center py-20">
				<HugeiconsIcon
					icon={Search01Icon}
					className="w-16 h-16 text-muted-foreground mx-auto mb-4"
				/>
				<h2 className="text-xl font-semibold text-foreground mb-2">
					No results found
				</h2>
				<p className="text-muted-foreground">
					Try searching with different keywords or hashtags
				</p>
			</CardContent>
		</Card>
	)
}

interface DiscoveryStateProps {
	onHashtagClick: (hashtag: string) => void
}

export function DiscoveryState({ onHashtagClick }: DiscoveryStateProps) {
	const popularTags = ['tech', 'art', 'music', 'gaming', 'food']

	return (
		<Card className="border-2 border-border">
			<CardContent className="text-center py-20">
				<HugeiconsIcon
					icon={Search01Icon}
					className="w-16 h-16 text-muted-foreground mx-auto mb-4"
				/>
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Discover Content
				</h2>
				<p className="text-muted-foreground mb-6">
					Search for videos, images, or hashtags to explore amazing content
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					{popularTags.map((tag) => (
						<Badge
							key={tag}
							variant="neutral"
							className="cursor-pointer hover:bg-muted transition-colors"
							onClick={() => onHashtagClick(tag)}>
							#{tag}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
