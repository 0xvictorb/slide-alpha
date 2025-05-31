import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription
} from '@/components/ui/form'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { useTokenBalances, type TokenBalance } from '@/hooks/use-token-balances'
import { useSuiClient } from '@mysten/dapp-kit'
import { getCoinMetadata } from '@/lib/sui'
import { useState } from 'react'
import { z } from 'zod'

type FormData = z.infer<typeof createContentSchema>

interface TokenPromotionProps {
	form: UseFormReturn<FormData>
}

function TokenDisplay({ token }: { token: TokenBalance }) {
	const iconUrl = token.iconUrl === null ? undefined : token.iconUrl

	return (
		<div className="flex items-center gap-3">
			{iconUrl && (
				<img
					src={iconUrl}
					alt={token.name || token.symbol}
					className="w-6 h-6 rounded-full"
				/>
			)}
			<div className="flex flex-col">
				<div className="font-medium">{token.name || token.symbol}</div>
				<div className="text-xs text-muted-foreground">
					Balance: {token.formattedBalance}
				</div>
			</div>
			{token.usdValue && (
				<Badge variant="secondary" className="ml-auto">
					${token.usdValue.toFixed(2)}
				</Badge>
			)}
		</div>
	)
}

export function TokenPromotion({ form }: TokenPromotionProps) {
	const { data: tokens, isLoading: isLoadingTokens } = useTokenBalances()
	const [isSearching, setIsSearching] = useState(false)
	const [searchValue, setSearchValue] = useState('')
	const [open, setOpen] = useState(false)
	const client = useSuiClient()
	const isPromotingToken = form.watch('isPromotingToken')
	const promotedTokenId = form.watch('promotedTokenId')
	const selectedToken = tokens?.find((t) => t.coinType === promotedTokenId)

	// Filter tokens based on search value
	const filteredTokens = tokens?.filter((token) => {
		const searchLower = searchValue.toLowerCase()
		return (
			token.name?.toLowerCase().includes(searchLower) ||
			token.symbol.toLowerCase().includes(searchLower) ||
			token.coinType.toLowerCase().includes(searchLower)
		)
	})

	// Handle pasting token address
	const handleSearch = async (value: string) => {
		setSearchValue(value)

		// Check if the value looks like a coin type (contains ::)
		if (value.includes('::') && !tokens?.some((t) => t.coinType === value)) {
			setIsSearching(true)
			try {
				const metadata = await getCoinMetadata(client, value)
				if (metadata) {
					// Create a new token balance object
					const newToken = {
						symbol: metadata.symbol,
						name: metadata.name,
						coinType: value,
						balance: '0',
						formattedBalance: '0',
						decimals: metadata.decimals,
						iconUrl: metadata.iconUrl || null,
						usdPrice: undefined,
						usdValue: undefined
					}
					// Add to the list if not already present
					if (!tokens?.some((t) => t.coinType === value)) {
						tokens?.push(newToken)
					}
				}
			} catch (error) {
				console.error('Error fetching token metadata:', error)
			} finally {
				setIsSearching(false)
			}
		}
	}

	return (
		<>
			<FormField
				control={form.control}
				name="isPromotingToken"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<FormLabel className="text-base">Token Promotion</FormLabel>
							<FormDescription>
								Promote a token and earn commission from trades
							</FormDescription>
						</div>
						<FormControl>
							<Switch
								checked={field.value}
								onCheckedChange={(checked) => {
									field.onChange(checked)
									if (!checked) {
										form.setValue('promotedTokenId', undefined)
									}
								}}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			{isPromotingToken && (
				<FormField
					control={form.control}
					name="promotedTokenId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Select Token</FormLabel>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={open}
											className={cn(
												'w-full justify-between h-auto py-2',
												!field.value && 'text-muted-foreground'
											)}>
											{selectedToken ? (
												<TokenDisplay token={selectedToken} />
											) : (
												'Select a token to promote'
											)}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className="w-[--radix-popover-trigger-width] p-0"
									align="start">
									<Command shouldFilter={false} className="w-full">
										<CommandInput
											placeholder="Search token name or paste address..."
											value={searchValue}
											onValueChange={handleSearch}
											className="h-9"
										/>
										<CommandList>
											{isLoadingTokens || isSearching ? (
												<div className="p-2 text-center">
													<Loader2 className="h-4 w-4 animate-spin mx-auto" />
												</div>
											) : filteredTokens?.length === 0 ? (
												<CommandEmpty>No tokens found.</CommandEmpty>
											) : (
												<CommandGroup>
													{filteredTokens?.map((token) => (
														<CommandItem
															key={token.coinType}
															value={token.coinType}
															onSelect={() => {
																form.setValue('promotedTokenId', token.coinType)
																setOpen(false)
															}}>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	promotedTokenId === token.coinType
																		? 'opacity-100'
																		: 'opacity-0'
																)}
															/>
															<TokenDisplay token={token} />
														</CommandItem>
													))}
												</CommandGroup>
											)}
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{selectedToken && (
				<Card>
					<CardContent className="p-4 space-y-4">
						<div className="flex items-center gap-3">
							{selectedToken.iconUrl && (
								<img
									src={selectedToken.iconUrl}
									alt={selectedToken.name}
									className="w-10 h-10 rounded-full"
								/>
							)}
							<div>
								<h3 className="font-semibold text-lg">
									{selectedToken.name || selectedToken.symbol}
								</h3>
								<p className="text-sm text-muted-foreground">
									{selectedToken.symbol}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">Balance</p>
								<p className="font-medium">{selectedToken.formattedBalance}</p>
							</div>
							{selectedToken.usdValue && (
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Value</p>
									<p className="font-medium">
										${selectedToken.usdValue.toFixed(2)}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	)
}
