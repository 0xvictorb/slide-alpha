import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormDescription
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

type FormData = z.infer<typeof createContentSchema>

interface PremiumContentProps {
	form: UseFormReturn<FormData>
	followerCount: number
}

const PREMIUM_PRICES = [
	{ value: '1', label: '1 SUI' },
	{ value: '2', label: '2 SUI' },
	{ value: '5', label: '5 SUI' },
	{ value: '10', label: '10 SUI' }
]

export function PremiumContent({ form, followerCount }: PremiumContentProps) {
	const isPremium = form.watch('isPremium')

	// Reset premium price when isPremium is toggled off
	useEffect(() => {
		if (!isPremium) {
			form.setValue('premiumPrice', undefined)
		}
	}, [form, isPremium])

	return (
		<div className="space-y-4">
			<FormField
				control={form.control}
				name="isPremium"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<FormLabel className="text-base">Premium Content</FormLabel>
							<FormDescription>
								{followerCount >= 100
									? 'Make this content premium for your followers'
									: 'You need at least 100 followers to create premium content'}
							</FormDescription>
						</div>
						<FormControl>
							<Switch
								checked={field.value}
								onCheckedChange={field.onChange}
								disabled={followerCount < 100}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			{form.watch('isPremium') && (
				<FormField
					control={form.control}
					name="premiumPrice"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormLabel>Premium Price</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={(value) => field.onChange(Number(value))}
									defaultValue={field.value?.toString()}
									className="grid grid-cols-2 gap-4">
									{PREMIUM_PRICES.map((price) => (
										<FormItem key={price.value}>
											<FormControl>
												<div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent [&:has(:checked)]:border-primary">
													<RadioGroupItem
														value={price.value}
														id={price.value}
													/>
													<Label
														htmlFor={price.value}
														className="flex-1 cursor-pointer">
														{price.label}
													</Label>
												</div>
											</FormControl>
										</FormItem>
									))}
								</RadioGroup>
							</FormControl>
						</FormItem>
					)}
				/>
			)}
		</div>
	)
}
