import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploader } from '@/components/shared/file-uploader'
import type { UseFormReturn } from 'react-hook-form'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'

type FormData = z.infer<typeof createContentSchema>

interface MediaUploadProps {
	form: UseFormReturn<FormData>
}

interface CloudinaryUploadResult {
	publicId: string
	url: string
	thumbnail?: string
	duration?: number
}

export function MediaUpload({ form }: MediaUploadProps) {
	return (
		<FormField
			control={form.control}
			name="contentType"
			render={({ field }) => (
				<FormItem>
					<Tabs
						value={field.value}
						onValueChange={(value) => {
							// Type assertion since we know the value can only be 'video' or 'images'
							field.onChange(value as 'video' | 'images')
							// Reset media fields when switching types
							if (value === 'video') {
								form.setValue('images', undefined)
							} else {
								form.setValue('video', undefined)
							}
						}}
						className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="video">Video</TabsTrigger>
							<TabsTrigger value="images">Images</TabsTrigger>
						</TabsList>
						<TabsContent value="video" className="mt-4">
							<FileUploader
								accept="video/*"
								maxSize={100}
								multiple={false}
								onUploadComplete={(
									result: CloudinaryUploadResult | CloudinaryUploadResult[]
								) => {
									const videoResult = Array.isArray(result) ? result[0] : result

									if (!videoResult.thumbnail || !videoResult.duration) {
										console.error('Missing thumbnail or duration for video')
										return
									}
									form.setValue('contentType', 'video')
									form.setValue('video', {
										cloudinaryPublicId: videoResult.publicId,
										cloudinaryUrl: videoResult.url,
										thumbnailUrl: videoResult.thumbnail,
										duration: videoResult.duration
									})
								}}
							/>
						</TabsContent>
						<TabsContent value="images" className="mt-4">
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
										order: index
									}))
									form.setValue('contentType', 'images')
									form.setValue('images', imagesData)
								}}
							/>
						</TabsContent>
					</Tabs>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
