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

type FormData = z.infer<typeof createContentSchema>

interface PremiumContentProps {
	form: UseFormReturn<FormData>
	followerCount: number
}

export function PremiumContent({ form, followerCount }: PremiumContentProps) {
	return (
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
	)
}
