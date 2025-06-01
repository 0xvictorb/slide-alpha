import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent } from '@/components/ui/card'

interface SearchInfoProps {
	searchQuery: string
	resultsCount: number
}

export function SearchInfo({ searchQuery, resultsCount }: SearchInfoProps) {
	if (!searchQuery) return null

	return (
		<Card className="border-2 border-border mb-6">
			<CardContent className="p-4">
				<div className="flex items-center gap-2 text-muted-foreground mb-2">
					<HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
					<span className="text-sm">
						{searchQuery.startsWith('#') ? 'Hashtag:' : 'Search:'}
						<span className="text-foreground font-semibold ml-1">
							{searchQuery}
						</span>
					</span>
				</div>
				{resultsCount > 0 && (
					<p className="text-muted-foreground text-sm">
						{resultsCount} result{resultsCount !== 1 ? 's' : ''} found
					</p>
				)}
			</CardContent>
		</Card>
	)
}
