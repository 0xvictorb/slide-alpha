import { api } from '@convex/_generated/api'
import { useMutation, useAction } from 'convex/react'
import type { Id } from '@convex/_generated/dataModel'

interface CloudinaryUploadResult {
	public_id: string
	secure_url: string
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
		secure_url: data.secure_url,
		resource_type: data.resource_type,
		duration: data.duration
	}
}

// React hook for handling file uploads
export function useCloudinaryUpload() {
	const saveContent = useMutation(api.content.saveContent)
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

	const upload = async (
		file: File,
		{
			title,
			description,
			authorId,
			isPremium = false,
			isActive = true
		}: {
			title: string
			description?: string
			authorId: Id<'users'>
			isPremium?: boolean
			isActive?: boolean
		}
	) => {
		try {
			// Upload the main file
			const result = await uploadToCloudinary(file, {
				folder: 'sui',
				generateSignature
			})

			// For videos, generate a thumbnail using Cloudinary's transformation URL
			let thumbnail:
				| Pick<
						CloudinaryUploadResult,
						'public_id' | 'secure_url' | 'resource_type'
				  >
				| undefined
			if (result.resource_type === 'video') {
				const thumbnailPublicId = result.public_id.replace(
					'/content/',
					'/thumbnails/'
				)
				thumbnail = {
					public_id: thumbnailPublicId,
					secure_url: result.secure_url.replace(
						'/upload/',
						'/upload/c_thumb,w_640,h_640/'
					),
					resource_type: 'image'
				}
			}

			// Save to Convex
			await saveContent({
				cloudinaryPublicId: result.public_id,
				cloudinaryUrl: result.secure_url,
				cloudinaryResourceType: result.resource_type,
				thumbnailPublicId: thumbnail?.public_id,
				thumbnailUrl: thumbnail?.secure_url,
				authorId,
				title,
				description,
				duration: result.duration,
				isPremium,
				isActive
			})

			return result
		} catch (error) {
			console.error('Upload failed:', error)
			throw error
		}
	}

	return upload
}
