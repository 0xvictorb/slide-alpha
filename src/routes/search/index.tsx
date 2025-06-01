import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	SearchHeader,
	SearchResults,
	LoadingState,
	NoResultsState,
	DiscoveryState
} from '@/components/search'
import type { ContentItem } from '@/types/content'

export const Route = createFileRoute('/search/')({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		q: (search.q as string) || '',
		hashtag: (search.hashtag as string) || ''
	})
})

function RouteComponent() {
	const navigate = useNavigate()
	const searchParams = useSearch({ from: '/search/' })
	const scrollAreaRef = useRef<HTMLDivElement>(null)
	const [searchQuery, setSearchQuery] = useState('') // Input value
	const [actualSearchQuery, setActualSearchQuery] = useState('') // What we actually search for
	const [isSearching, setIsSearching] = useState(false)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [cursor, setCursor] = useState<string | null>(null)
	const [hasMore, setHasMore] = useState(true)
	const [allResults, setAllResults] = useState<ContentItem[]>([])

	// Initialize search query from URL params
	useEffect(() => {
		let queryFromParams = ''
		if (searchParams.hashtag) {
			queryFromParams = `#${searchParams.hashtag}`
		} else if (searchParams.q) {
			queryFromParams = searchParams.q
		}

		if (queryFromParams) {
			setSearchQuery(queryFromParams)
			setActualSearchQuery(queryFromParams)
		}
	}, [searchParams])

	// Search query for Convex - initial search
	const shouldSearch = actualSearchQuery.trim().length > 0
	const searchResults = useQuery(
		api.content.searchContent,
		shouldSearch
			? {
					query: actualSearchQuery,
					paginationOpts: { numItems: 20, cursor: null },
					isActiveOnly: true
				}
			: 'skip'
	)

	// Load more results when cursor is available
	const loadMoreResults = useQuery(
		api.content.searchContent,
		shouldSearch && cursor && isLoadingMore
			? {
					query: actualSearchQuery,
					paginationOpts: { numItems: 20, cursor },
					isActiveOnly: true
				}
			: 'skip'
	)

	// Handle initial search results
	useEffect(() => {
		if (searchResults?.page) {
			setAllResults(searchResults.page)
			setCursor(searchResults.continueCursor)
			setHasMore(!searchResults.isDone)
			setIsSearching(false)
		}
	}, [searchResults])

	// Handle load more results
	useEffect(() => {
		if (loadMoreResults?.page && isLoadingMore) {
			setAllResults((prev) => [...prev, ...loadMoreResults.page])
			setCursor(loadMoreResults.continueCursor)
			setHasMore(!loadMoreResults.isDone)
			setIsLoadingMore(false)
		}
	}, [loadMoreResults, isLoadingMore])

	// Reset results when actualSearchQuery changes
	useEffect(() => {
		if (actualSearchQuery.trim().length > 0) {
			setIsSearching(true)
			setAllResults([])
			setCursor(null)
			setHasMore(true)
			setIsLoadingMore(false)
		}
	}, [actualSearchQuery])

	// Infinite scroll handler
	const handleScroll = useCallback(() => {
		const scrollArea = scrollAreaRef.current
		if (!scrollArea || !hasMore || isLoadingMore || isSearching) return

		const { scrollTop, scrollHeight, clientHeight } = scrollArea
		const threshold = 200 // Load more when 200px from bottom

		if (scrollHeight - scrollTop - clientHeight < threshold) {
			setIsLoadingMore(true)
		}
	}, [hasMore, isLoadingMore, isSearching])

	// Add scroll listener
	useEffect(() => {
		const scrollArea = scrollAreaRef.current
		if (!scrollArea) return

		scrollArea.addEventListener('scroll', handleScroll)
		return () => scrollArea.removeEventListener('scroll', handleScroll)
	}, [handleScroll])

	const handleSearch = useCallback(
		(query: string) => {
			const trimmedQuery = query.trim()
			if (!trimmedQuery) return

			// Update the actual search query to trigger the search
			setActualSearchQuery(trimmedQuery)

			// Update URL with search params
			const isHashtagSearch = trimmedQuery.startsWith('#')
			if (isHashtagSearch) {
				const hashtag = trimmedQuery.slice(1)
				navigate({
					to: '/search',
					search: { hashtag, q: '' }
				})
			} else {
				navigate({
					to: '/search',
					search: { q: trimmedQuery, hashtag: '' }
				})
			}
		},
		[navigate]
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		handleSearch(searchQuery)
	}

	const handleHashtagClick = (hashtag: string) => {
		const query = `#${hashtag}`
		setSearchQuery(query)
		handleSearch(query)
	}

	const handleContentClick = (contentId: Id<'content'>) => {
		// Navigate to search content feed with current search parameters
		navigate({
			to: '/search/content/$contentId',
			params: { contentId },
			search: { q: searchParams.q, hashtag: searchParams.hashtag }
		})
	}

	// Render different states
	const renderMainContent = () => {
		if (isSearching) {
			return <LoadingState />
		}

		if (!actualSearchQuery) {
			return <DiscoveryState onHashtagClick={handleHashtagClick} />
		}

		if (allResults.length === 0) {
			return <NoResultsState />
		}

		return (
			<>
				<SearchResults
					results={allResults}
					onContentClick={handleContentClick}
				/>
				{isLoadingMore && (
					<div className="mt-6">
						<LoadingState message="Loading more results..." />
					</div>
				)}
				{!hasMore && allResults.length > 0 && (
					<div className="text-center py-8">
						<p className="text-black/50 text-sm">
							You've reached the end of the results
						</p>
					</div>
				)}
			</>
		)
	}

	return (
		<div className="flex flex-col h-screen bg-white">
			<SearchHeader
				searchQuery={searchQuery}
				isSearching={isSearching}
				onInputChange={handleInputChange}
				onSubmit={handleSubmit}
			/>

			<ScrollArea className="flex-1 bg-background" ref={scrollAreaRef}>
				<div className="max-w-4xl mx-auto px-6 py-4">{renderMainContent()}</div>
			</ScrollArea>
		</div>
	)
}
