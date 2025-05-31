import { api } from '@convex/_generated/api'
import { useAction } from 'convex/react'

interface CloudinaryUploadResult {
	public_id: string
	url: string
	playback_url: string
	asset_id: string
	resource_type: 'image' | 'video'
	duration?: number // For videos only
}

interface CloudinarySignature {
	timestamp: number
	folder?: string
	publicId?: string
}

export async function uploadToCloudinary(
	file: File,
	options: {
		folder?: string
		resourceType?: 'image' | 'video' | 'auto'
		generateSignature: (params: CloudinarySignature) => Promise<{
			signature: string
			cloudName: string
			apiKey: string
		}>
	}
): Promise<CloudinaryUploadResult> {
	const formData = new FormData()
	formData.append('file', file)

	if (options.folder) {
		formData.append('folder', options.folder)
	}

	// Add timestamp and generate signature
	const timestamp = Math.round(new Date().getTime() / 1000)
	formData.append('timestamp', timestamp.toString())

	const { signature, apiKey, cloudName } = await options.generateSignature({
		timestamp,
		folder: options.folder
	})

	formData.append('signature', signature)
	formData.append('api_key', apiKey)

	const resourceType = options.resourceType || 'auto'
	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
		{
			method: 'POST',
			body: formData
		}
	)

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || 'Upload failed')
	}

	const data = await response.json()
	return {
		public_id: data.public_id,
		url: data.url,
		playback_url: data.playback_url,
		asset_id: data.asset_id,
		resource_type: data.resource_type,
		duration: data.duration
	}
}

// React hook for handling file uploads
export function useCloudinaryUpload() {
	const generateSignatureAction = useAction(
		api.cloudinary.generateUploadSignature
	)

	// Wrap the action to ensure type safety
	const generateSignature = async (params: CloudinarySignature) => {
		const result = await generateSignatureAction(params)
		if (!result.cloudName || !result.apiKey || !result.signature) {
			throw new Error('Invalid signature response')
		}
		return {
			signature: result.signature,
			cloudName: result.cloudName,
			apiKey: result.apiKey
		}
	}

	const upload = async (file: File) => {
		try {
			// Upload the main file
			const result = await uploadToCloudinary(file, {
				folder: 'sui',
				generateSignature
			})

			// For videos, generate a thumbnail using Cloudinary's transformation URL
			let thumbnailUrl: string | undefined
			if (result.resource_type === 'video') {
				thumbnailUrl = `https://res-console.cloudinary.com/flask-image/media_explorer_thumbnails/${result.asset_id}/card`
			}

			return {
				public_id: result.public_id,
				media_url:
					result.resource_type === 'video' ? result.playback_url : result.url,
				resource_type: result.resource_type,
				duration: result.duration,
				thumbnail: thumbnailUrl
			}
		} catch (error) {
			console.error('Upload failed:', error)
			throw error
		}
	}

	return upload
}
