import { useState, useEffect } from 'react'
import { Search, Loader2, Verified } from 'lucide-react'
import { useTokens } from '@/hooks/use-tokens'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSuiClient } from '@mysten/dapp-kit'
import { getCoinMetadata } from '@/lib/sui'
import type { TokenData } from '@/types/token'
import InfiniteScroll from '@/components/ui/infinite-scroll'
import { OptimizedImage } from './optimized-image'

interface TokenItemProps {
	token: TokenData
	onSelect: (token: TokenData) => void
	selected?: boolean
}

function TokenItem({ token, onSelect, selected }: TokenItemProps) {
	return (
		<Button
			variant="neutral"
			className={`w-full h-auto justify-start gap-4 px-4 py-3 transition-all duration-200 hover:bg-accent/50 ${
				selected ? 'bg-accent' : ''
			}`}
			onClick={() => onSelect(token)}>
			<div className="relative h-10 w-10 shrink-0">
				{token.iconUrl ? (
					<img
						src={token.iconUrl}
						alt={token.name}
						className="h-full w-full rounded-full object-cover ring-2 ring-border"
					/>
				) : (
					<div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
						<span className="text-lg font-semibold text-muted-foreground">
							{token.symbol[0]}
						</span>
					</div>
				)}
				{token.verified && (
					<div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
						<Verified className="h-4 w-4 text-white" />
					</div>
				)}
			</div>
			<div className="flex flex-col items-start flex-1 gap-0.5">
				<div className="flex items-center gap-2">
					<span className="font-semibold">{token.symbol}</span>
					{selected && (
						<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
							Selected
						</span>
					)}
				</div>
				<span className="text-sm text-muted-foreground truncate max-w-[200px]">
					{token.name}
				</span>
			</div>
		</Button>
	)
}

interface TokenSelectorProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSelect: (token: TokenData) => void
	selectedToken?: TokenData
}

export function TokenSelector({
	open,
	onOpenChange,
	onSelect,
	selectedToken
}: TokenSelectorProps) {
	const { getVerifiedTokens } = useTokens()
	const [search, setSearch] = useState('')
	const [isSearching, setIsSearching] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [importedTokens, setImportedTokens] = useState<TokenData[]>([])
	const client = useSuiClient()

	// Load imported tokens from localStorage on mount
	useEffect(() => {
		const storedTokens = localStorage.getItem('importedTokens')
		if (storedTokens) {
			try {
				setImportedTokens(JSON.parse(storedTokens))
			} catch (error) {
				console.error('Error loading imported tokens:', error)
			}
		}
	}, [])

	const verifiedTokens = getVerifiedTokens()
	const allTokens = [...verifiedTokens, ...importedTokens]

	// Filter tokens based on search value
	const filteredTokens = allTokens.filter((token) => {
		const searchLower = search.toLowerCase()
		return (
			token.name.toLowerCase().includes(searchLower) ||
			token.symbol.toLowerCase().includes(searchLower) ||
			token.type.toLowerCase().includes(searchLower)
		)
	})

	// Setup infinite scroll pagination
	const {
		data: paginatedData,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage
	} = useInfiniteQuery({
		queryKey: ['tokens', search],
		initialPageParam: 0,
		queryFn: ({ pageParam = 0 }) => {
			const pageSize = 20
			const start = pageParam * pageSize
			const end = start + pageSize
			return Promise.resolve({
				items: filteredTokens.slice(start, end),
				nextPage: end < filteredTokens.length ? pageParam + 1 : undefined
			})
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
		enabled: open // Only enabled when drawer is open
	})

	const tokens = paginatedData?.pages.flatMap((page) => page.items) ?? []

	// Handle search and import
	const handleSearchChange = async (value: string) => {
		setSearch(value)
		setError(null)

		// If empty search, just show all tokens
		if (!value.trim()) return

		// First check if we have matching tokens
		const searchLower = value.toLowerCase()
		const hasMatches = allTokens.some(
			(token) =>
				token.name.toLowerCase().includes(searchLower) ||
				token.symbol.toLowerCase().includes(searchLower) ||
				token.type.toLowerCase().includes(searchLower)
		)

		// If we have matches, no need to try import
		if (hasMatches) return

		// If looks like a token address, try to import
		if (value.includes('::') && !allTokens.some((t) => t.type === value)) {
			setIsSearching(true)
			try {
				const metadata = await getCoinMetadata(client, value)
				if (metadata) {
					const newToken: TokenData = {
						symbol: metadata.symbol,
						name: metadata.name,
						type: value,
						decimals: metadata.decimals,
						iconUrl: metadata.iconUrl || '',
						verified: false,
						lastUpdated: Date.now()
					}
					// Add to imported tokens if not already present
					if (!importedTokens.some((t) => t.type === value)) {
						const updatedImportedTokens = [...importedTokens, newToken]
						setImportedTokens(updatedImportedTokens)
						localStorage.setItem(
							'importedTokens',
							JSON.stringify(updatedImportedTokens)
						)
						// Clear search to show the newly added token
						setSearch('')
					}
				} else {
					setError('Token not found')
				}
			} catch (error) {
				console.error('Error fetching token metadata:', error)
				setError('Failed to import token')
			} finally {
				setIsSearching(false)
			}
		}
	}

	// Handle token selection
	const handleSelect = (token: TokenData) => {
		onSelect(token)
		onOpenChange(false)
		setSearch('') // Clear search when closing
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[85vh] flex flex-col">
				<DrawerHeader className="border-b shrink-0">
					<DrawerTitle className="text-xl font-semibold">
						Select a Token
					</DrawerTitle>
					{selectedToken ? (
						<div className="flex items-center gap-2 mt-2">
							<span className="text-sm text-muted-foreground">
								Currently selected:
							</span>
							<div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
								{selectedToken.iconUrl ? (
									<OptimizedImage
										src={selectedToken.iconUrl}
										alt={selectedToken.name}
										className="h-5 w-5 rounded-full"
									/>
								) : (
									<div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
										<span className="text-sm font-semibold text-muted-foreground">
											{selectedToken.symbol[0]}
										</span>
									</div>
								)}
								<span className="font-medium">{selectedToken.symbol}</span>
							</div>
						</div>
					) : (
						<DrawerDescription className="mt-2">
							Search by name or paste token address to import
						</DrawerDescription>
					)}
				</DrawerHeader>

				<div className="border-b shrink-0 p-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search name or paste address"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-9 bg-muted"
						/>
					</div>
				</div>

				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="p-2">
						<div className="space-y-1">
							{isSearching ? (
								<div className="py-12 text-center">
									<Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
									<p className="text-sm text-muted-foreground mt-3">
										Importing token...
									</p>
								</div>
							) : error ? (
								<div className="py-12 text-center">
									<div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="text-destructive">
											<path
												d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">{error}</p>
								</div>
							) : tokens.length === 0 ? (
								<div className="py-12 text-center">
									<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="text-muted-foreground">
											<path
												d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										No tokens found
									</p>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									{tokens.map((token) => (
										<TokenItem
											key={token.type}
											token={token}
											onSelect={handleSelect}
											selected={selectedToken?.type === token.type}
										/>
									))}

									<InfiniteScroll
										hasMore={hasNextPage}
										isLoading={isFetchingNextPage}
										next={fetchNextPage}
										threshold={0.8}>
										{(hasNextPage || isFetchingNextPage) && (
											<div className="flex justify-center py-4">
												<Loader2 className="h-8 w-8 animate-spin text-primary" />
											</div>
										)}
									</InfiniteScroll>
								</div>
							)}
						</div>
					</div>
				</ScrollArea>
			</DrawerContent>
		</Drawer>
	)
}
