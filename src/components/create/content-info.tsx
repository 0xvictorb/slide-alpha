import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'
import { useState } from 'react'

type FormData = z.infer<typeof createContentSchema>

interface ContentInfoProps {
	form: UseFormReturn<FormData>
}

export function ContentInfo({ form }: ContentInfoProps) {
	const [hashtagInput, setHashtagInput] = useState('')

	const processHashtags = (input: string) => {
		return input
			.split(' ')
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0)
			.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
	}

	return (
		<>
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Title</FormLabel>
						<FormControl>
							<Input placeholder="Give your content a title" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Description</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe your content"
								className="resize-none"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="hashtags"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Hashtags</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter hashtags separated by spaces"
								value={hashtagInput}
								onChange={(e) => setHashtagInput(e.target.value)}
								onBlur={() => {
									const hashtags = processHashtags(hashtagInput)
									field.onChange(hashtags)
									setHashtagInput(hashtags.join(' '))
								}}
							/>
						</FormControl>
						<FormDescription>
							Start each hashtag with # (e.g., #crypto #trading) or just type
							words and # will be added automatically
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	)
}
