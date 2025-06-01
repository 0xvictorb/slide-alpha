import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { WalletGuard } from '@/components/guards/wallet-guard'
import { SearchContentFeed } from '@/components/search/search-content-feed'

export const Route = createFileRoute('/search/content/$contentId')({
	component: SearchContentFeedPage,
	validateSearch: (search: Record<string, unknown>) => ({
		q: (search.q as string) || '',
		hashtag: (search.hashtag as string) || ''
	})
})

function SearchContentFeedPage() {
	const { contentId } = useParams({ from: Route.id })
	const searchParams = useSearch({ from: Route.id })

	return (
		<WalletGuard>
			<SearchContentFeed
				startContentId={contentId}
				searchQuery={searchParams.q}
				searchHashtag={searchParams.hashtag}
			/>
		</WalletGuard>
	)
}
