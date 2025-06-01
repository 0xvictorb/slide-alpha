import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CardContent } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge02Icon } from '@hugeicons/core-free-icons'

interface TokenItemProps {
	token: TokenData
	onSelect: (token: TokenData) => void
	selected?: boolean
}

function TokenItem({ token, onSelect, selected }: TokenItemProps) {
	const handleSelect = () => {
		console.log('selecting token', token)
		onSelect(token)
	}

	return (
		<Button
			variant="neutral"
			className={`w-full h-auto justify-start gap-4 px-4 py-3 transition-all duration-200 hover:bg-accent/50 ${
				selected ? 'bg-accent' : ''
			}`}
			onClick={handleSelect}>
			<Avatar className="size-10 ring-2 ring-border">
				{token.iconUrl ? (
					<AvatarImage src={token.iconUrl} alt={token.name} />
				) : (
					<AvatarFallback className="bg-primary/10 text-primary font-bold">
						{token.symbol[0]}
					</AvatarFallback>
				)}
			</Avatar>
			<div className="flex flex-col items-start flex-1 gap-0.5">
				<div className="flex items-center gap-2">
					<span className="font-semibold flex items-center gap-2">
						{token.symbol}{' '}
						{token.verified && (
							<div className="rounded-full bg-primary flex items-center justify-center">
								<HugeiconsIcon
									icon={CheckmarkBadge02Icon}
									className="text-blue-500"
									size={16}
									strokeWidth={2}
								/>
							</div>
						)}
					</span>

					{selected && (
						<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
							Selected
						</span>
					)}
				</div>
				<span className="text-sm text-neutral-500 font-normal truncate max-w-[200px]">
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
		enabled: open
	})

	const tokens = paginatedData?.pages.flatMap((page) => page.items) ?? []

	// Handle search and import
	const handleSearchChange = async (value: string) => {
		setSearch(value)
		setError(null)

		if (!value.trim()) return

		const searchLower = value.toLowerCase()
		const hasMatches = allTokens.some(
			(token) =>
				token.name.toLowerCase().includes(searchLower) ||
				token.symbol.toLowerCase().includes(searchLower) ||
				token.type.toLowerCase().includes(searchLower)
		)

		if (hasMatches) return

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
					if (!importedTokens.some((t) => t.type === value)) {
						const updatedImportedTokens = [...importedTokens, newToken]
						setImportedTokens(updatedImportedTokens)
						localStorage.setItem(
							'importedTokens',
							JSON.stringify(updatedImportedTokens)
						)
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

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[85vh] flex flex-col max-w-[780px] mx-auto">
				<DrawerHeader className="border-b border-border/20 backdrop-blur-sm px-6 py-4">
					<DrawerTitle>
						<h2 className="text-lg text-center font-bold mb-4">
							Select a Token
						</h2>
						{selectedToken ? (
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									Currently selected:
								</span>
								<div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
									<Avatar className="size-5">
										{selectedToken.iconUrl ? (
											<AvatarImage
												src={selectedToken.iconUrl}
												alt={selectedToken.name}
											/>
										) : (
											<AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
												{selectedToken.symbol[0]}
											</AvatarFallback>
										)}
									</Avatar>
									<span className="font-medium">{selectedToken.symbol}</span>
								</div>
							</div>
						) : (
							<DrawerDescription className="mt-2">
								Search by name or paste token address to import
							</DrawerDescription>
						)}
					</DrawerTitle>
				</DrawerHeader>

				<CardContent className="p-0 mx-6 mt-4 mb-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search name or paste address"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-9 bg-white"
						/>
					</div>
				</CardContent>

				<ScrollArea className="flex-1">
					<div className="py-4 px-6">
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
										<Search className="h-6 w-6 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground">
										No tokens found
									</p>
								</div>
							) : (
								<div className="flex flex-col gap-4">
									{tokens.map((token) => (
										<TokenItem
											key={token.type}
											token={token}
											onSelect={onSelect}
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
