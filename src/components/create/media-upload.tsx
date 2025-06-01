import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { FileUploader } from '@/components/shared/file-uploader'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'
import { Switch } from '@/components/ui/switch'

type FormData = z.infer<typeof createContentSchema>

interface MediaUploadProps {
	form: UseFormReturn<FormData>
}

interface CloudinaryUploadResult {
	publicId: string
	url: string
	thumbnail?: string
	duration?: number
	tuskyFileId?: string
}

export function MediaUpload({ form }: MediaUploadProps) {
	const isOnChain = form.watch('isOnChain')

	return (
		<>
			<FormField
				control={form.control}
				name="isOnChain"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-border p-4 bg-gradient-to-r from-main via-secondary to-main relative overflow-hidden group transition-all duration-300 hover:shadow-lg animate-gradient bg-[length:200%_200%]">
						<div className="absolute inset-0 bg-gradient-to-r from-main/10 via-secondary/10 to-main/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient bg-[length:200%_200%]" />
						<div className="space-y-0.5 relative z-10">
							<FormLabel className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
								Store on-chain
							</FormLabel>
						</div>
						<FormControl>
							<Switch
								checked={field.value}
								onCheckedChange={field.onChange}
								className="relative z-10"
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="contentType"
				render={({ field }) => (
					<FormItem>
						<div className="space-y-4">
							<Tabs
								value={field.value}
								onValueChange={(value) => {
									field.onChange(value as 'video' | 'images')
									if (value === 'video') {
										form.setValue('images', undefined)
									} else {
										form.setValue('video', undefined)
									}
								}}
								className="w-full">
								<TabsContent value="video">
									<FileUploader
										accept="video/*"
										maxSize={100}
										multiple={false}
										onUploadComplete={(
											result: CloudinaryUploadResult | CloudinaryUploadResult[]
										) => {
											const videoResult = Array.isArray(result)
												? result[0]
												: result

											if (!videoResult.thumbnail || !videoResult.duration) {
												console.error('Missing thumbnail or duration for video')
												return
											}
											form.setValue('contentType', 'video')
											form.setValue('video', {
												cloudinaryPublicId: videoResult.publicId,
												cloudinaryUrl: videoResult.url,
												thumbnailUrl: videoResult.thumbnail,
												duration: videoResult.duration,
												...(videoResult.tuskyFileId && {
													tuskyFileId: videoResult.tuskyFileId
												})
											})
										}}
										enableTusky={isOnChain}
									/>
								</TabsContent>
								<TabsContent value="images">
									<FileUploader
										accept="image/*"
										maxSize={10}
										multiple={true}
										onUploadComplete={(
											result: CloudinaryUploadResult | CloudinaryUploadResult[]
										) => {
											const images = Array.isArray(result) ? result : [result]
											const imagesData = images.map((item, index) => ({
												cloudinaryPublicId: item.publicId,
												cloudinaryUrl: item.url,
												order: index,
												...(item.tuskyFileId && {
													tuskyFileId: item.tuskyFileId
												})
											}))
											form.setValue('contentType', 'images')
											form.setValue('images', imagesData)
										}}
										enableTusky={isOnChain}
									/>
								</TabsContent>
							</Tabs>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	)
}
