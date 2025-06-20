import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { buttonVariants } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { z } from 'zod'
import { TokenSelector } from '@/components/shared/token-selector'
import type { TokenData, TokenBalance } from '@/types/token'
import NiceModal from '@ebay/nice-modal-react'

type FormData = z.infer<typeof createContentSchema>

interface TokenPromotionProps {
	form: UseFormReturn<FormData>
}

function TokenDisplay({ token }: { token: TokenBalance }) {
	return (
		<div className="flex items-center gap-3">
			{token.iconUrl && (
				<img
					src={token.iconUrl}
					alt={token.name || token.symbol}
					className="w-6 h-6 rounded-full"
				/>
			)}
			<div className="flex flex-col items-start">
				<div className="font-medium">{token.name || token.symbol}</div>
				<div className="text-xs text-muted-foreground">
					Balance: {token.formattedBalance} {token.symbol}
				</div>
			</div>
		</div>
	)
}

export function TokenPromotion({ form }: TokenPromotionProps) {
	const { data: tokens } = useTokenBalances()
	const isPromotingToken = form.watch('isPromotingToken')
	const promotedTokenId = form.watch('promotedTokenId')
	const selectedToken = tokens?.find((t) => t.type === promotedTokenId)

	const handleTokenSelect = (token: TokenData) => {
		form.setValue('promotedTokenId', token.type)
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

			{Boolean(isPromotingToken) && (
				<FormField
					control={form.control}
					name="promotedTokenId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Select Token</FormLabel>
							<FormControl>
								<div
									onClick={() =>
										NiceModal.show(TokenSelector, {
											onSelect: handleTokenSelect,
											selectedToken
										})
									}
									className={cn(
										buttonVariants({ variant: 'neutral' }),
										'w-full justify-between h-auto py-2',
										!field.value && 'text-muted-foreground'
									)}>
									{selectedToken ? (
										<TokenDisplay token={selectedToken as TokenBalance} />
									) : (
										'Select a token to promote'
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</>
	)
}
