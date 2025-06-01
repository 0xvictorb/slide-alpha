import { useCallback, useState } from 'react'
import { Tusky } from '@tusky-io/ts-sdk/web'

interface TuskyUploadOptions {
	vaultId?: string
	onProgress?: (progress: number) => void
	onSuccess?: (uploadId: string) => void
	onError?: (error: Error) => void
}

interface TuskyUploadState {
	uploadId: string | null
	isUploading: boolean
	progress: number
	error: Error | null
}

// TODO: Make this configurable
const DEFAULT_VAULT_ID = 'f47e78fc-2648-48b1-b623-f17d46a15696'

export function useTuskyUpload(options: TuskyUploadOptions) {
	const { vaultId, onProgress, onSuccess, onError } = options

	const [state, setState] = useState<TuskyUploadState>({
		uploadId: null,
		isUploading: false,
		progress: 0,
		error: null
	})

	// Initialize Tusky client
	const tusky = new Tusky({
		apiKey: import.meta.env.VITE_TUSKY_API_KEY
	})

	const upload = useCallback(
		async (file: File) => {
			if (state.isUploading) {
				throw new Error('Upload already in progress')
			}

			setState((prev) => ({ ...prev, isUploading: true, error: null }))

			try {
				// Create a vault if vaultId is not provided
				const targetVaultId = vaultId || DEFAULT_VAULT_ID

				// Start the upload
				setState((prev) => ({ ...prev, progress: 0 }))
				onProgress?.(0)

				// Upload the file
				const uploadId = await tusky.file.upload(targetVaultId, file, {
					onProgress: (progress) => {
						setState((prev) => ({
							...prev,
							progress: Math.round(progress * 100)
						}))
						onProgress?.(Math.round(progress * 100))
					}
				})

				// Get file metadata
				const fileMetadata = await tusky.file.get(uploadId)

				// Update state with success
				setState((prev) => ({
					...prev,
					uploadId,
					isUploading: false,
					progress: 100,
					error: null
				}))

				onSuccess?.(uploadId)

				return {
					uploadId,
					blobId: fileMetadata.blobId,
					blobObjectId: fileMetadata.blobObjectId
				}
			} catch (error) {
				const err = error instanceof Error ? error : new Error('Upload failed')
				setState((prev) => ({
					...prev,
					isUploading: false,
					error: err
				}))
				onError?.(err)
				throw err
			}
		},
		[state.isUploading, vaultId, tusky, onProgress, onSuccess, onError]
	)

	const cancel = useCallback(() => {
		// Note: Tusky SDK doesn't provide direct cancel functionality
		// We can only update the state to reflect cancellation
		setState({
			uploadId: null,
			isUploading: false,
			progress: 0,
			error: null
		})
	}, [])

	return {
		upload,
		cancel,
		state
	}
}
