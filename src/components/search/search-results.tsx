import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentCard } from './content-card'
import type { Id } from '@convex/_generated/dataModel'
import type { ContentItem } from '@/types/content'

interface SearchResultsProps {
	results: ContentItem[]
	onContentClick: (contentId: Id<'content'>) => void
}

export function SearchResults({ results, onContentClick }: SearchResultsProps) {
	if (results.length === 0) return null

	return (
		<div className="space-y-4">
			<CardHeader className="px-0">
				<CardTitle className="flex items-center justify-between">
					Search Results
					<Badge variant="secondary">
						{results.length} {results.length === 1 ? 'result' : 'results'}
					</Badge>
				</CardTitle>
			</CardHeader>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{results.map((content) => (
					<ContentCard
						key={content._id}
						content={content}
						onContentClick={onContentClick}
					/>
				))}
			</div>
		</div>
	)
}
