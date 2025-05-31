'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import { v2 as cloudinary } from 'cloudinary'

// Ensure environment variables are present
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
	throw new Error('Missing required Cloudinary environment variables')
}

// Initialize Cloudinary with environment variables from Convex
cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET
})

export const generateUploadSignature = action({
	args: {
		timestamp: v.number(),
		folder: v.optional(v.string()),
		publicId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { timestamp, folder, publicId } = args

		// Parameters to sign
		const params: Record<string, any> = {
			timestamp
		}

		if (folder) {
			params.folder = folder
		}
		if (publicId) {
			params.public_id = publicId
		}

		// Generate the signature
		const signature = cloudinary.utils.api_sign_request(
			params,
			CLOUDINARY_API_SECRET
		)

		return {
			signature,
			cloudName: CLOUDINARY_CLOUD_NAME,
			apiKey: CLOUDINARY_API_KEY
		}
	}
})
