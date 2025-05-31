interface ThumbnailOptions {
	maxSize?: number // max thumbnail dimension in pixels
	quality?: number // JPEG quality (0-1)
	format?: 'image/jpeg' | 'image/png' | 'image/webp'
}

interface ThumbnailResult {
	blob: Blob | null
	width: number
	height: number
	error?: Error
}

export function useThumbnailGenerator() {
	const generateImageThumbnail = async (
		file: File,
		options: ThumbnailOptions = {}
	): Promise<ThumbnailResult> => {
		const { maxSize = 400, quality = 0.7, format = 'image/jpeg' } = options

		try {
			const img = new Image()
			const imageUrl = URL.createObjectURL(file)

			try {
				await new Promise((resolve, reject) => {
					img.onload = resolve
					img.onerror = reject
					img.src = imageUrl
				})

				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					throw new Error('Failed to get canvas context')
				}

				// Calculate thumbnail size (maintaining aspect ratio)
				const ratio = Math.min(maxSize / img.width, maxSize / img.height)
				const width = img.width * ratio
				const height = img.height * ratio

				canvas.width = width
				canvas.height = height

				// Draw resized image
				ctx.drawImage(img, 0, 0, width, height)

				// Convert to blob
				const blob = await new Promise<Blob | null>((resolve) => {
					canvas.toBlob(resolve, format, quality)
				})

				return {
					blob,
					width,
					height
				}
			} finally {
				URL.revokeObjectURL(imageUrl)
			}
		} catch (error) {
			return {
				blob: null,
				width: 0,
				height: 0,
				error: error instanceof Error ? error : new Error('Unknown error')
			}
		}
	}

	const generateVideoThumbnail = async (
		file: File,
		options: ThumbnailOptions = {}
	): Promise<ThumbnailResult> => {
		const { maxSize = 400, quality = 0.7, format = 'image/jpeg' } = options

		try {
			const video = document.createElement('video')
			const videoUrl = URL.createObjectURL(file)

			try {
				video.src = videoUrl
				video.currentTime = 0
				await new Promise((resolve, reject) => {
					video.onloadeddata = resolve
					video.onerror = reject
				})

				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					throw new Error('Failed to get canvas context')
				}

				// Calculate thumbnail size (maintaining aspect ratio)
				const ratio = Math.min(
					maxSize / video.videoWidth,
					maxSize / video.videoHeight
				)
				const width = video.videoWidth * ratio
				const height = video.videoHeight * ratio

				canvas.width = width
				canvas.height = height

				// Capture frame
				ctx.drawImage(video, 0, 0, width, height)

				// Convert to blob
				const blob = await new Promise<Blob | null>((resolve) => {
					canvas.toBlob(resolve, format, quality)
				})

				return {
					blob,
					width,
					height
				}
			} finally {
				URL.revokeObjectURL(videoUrl)
			}
		} catch (error) {
			return {
				blob: null,
				width: 0,
				height: 0,
				error: error instanceof Error ? error : new Error('Unknown error')
			}
		}
	}

	const generateThumbnail = async (
		file: File,
		options?: ThumbnailOptions
	): Promise<ThumbnailResult> => {
		if (file.type.startsWith('image/')) {
			return generateImageThumbnail(file, options)
		} else if (file.type.startsWith('video/')) {
			return generateVideoThumbnail(file, options)
		}

		return {
			blob: null,
			width: 0,
			height: 0,
			error: new Error('Unsupported file type')
		}
	}

	return {
		generateThumbnail,
		generateImageThumbnail,
		generateVideoThumbnail
	}
}
