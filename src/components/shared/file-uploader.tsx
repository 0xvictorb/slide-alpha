import { useRef, useState, useEffect, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Play } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useCloudinaryUpload } from '@/lib/cloudinary'

interface CloudinaryUploadResult {
	publicId: string
	url: string
	thumbnail?: string
	duration?: number
}

interface FileUploaderProps {
	className?: string
	accept?: string
	maxSize?: number // in MB
	onUploadComplete?: (
		result: CloudinaryUploadResult | CloudinaryUploadResult[]
	) => void
	multiple?: boolean
}

interface FilePreviewProps {
	file: File
	className?: string
}

function FilePreview({ file, className }: FilePreviewProps) {
	const [previewUrl, setPreviewUrl] = useState<string>('')
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const url = URL.createObjectURL(file)
		setPreviewUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [file])

	if (file.type.startsWith('video/')) {
		return (
			<div
				className={cn(
					'relative rounded-lg overflow-hidden bg-black',
					className
				)}>
				<video
					ref={videoRef}
					src={previewUrl}
					className="w-full h-full object-contain"
					controls={false}
					muted
					loop
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<Play className="w-12 h-12 text-white opacity-80" />
				</div>
			</div>
		)
	}

	return (
		<div className={cn('relative rounded-lg overflow-hidden', className)}>
			<img
				src={previewUrl}
				alt={file.name}
				className="w-full h-full object-contain"
			/>
		</div>
	)
}

interface FileItemProps {
	file: File
	onRemove: () => void
	isUploading: boolean
	uploadProgress: number
	status: 'idle' | 'uploading' | 'completed' | 'error'
	errorMessage?: string
	onReplace: () => void
}

function FileItem({
	file,
	onRemove,
	onReplace,
	isUploading,
	uploadProgress,
	status,
	errorMessage
}: FileItemProps) {
	return (
		<div className="w-full space-y-4 p-4 bg-white rounded-lg shadow-sm border">
			<FilePreview file={file} className="w-full aspect-video" />

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{status === 'completed' ? (
						<div className="flex items-center gap-2 text-green-600">
							<Upload className="w-5 h-5" />
							<span className="text-sm">Upload complete</span>
						</div>
					) : status === 'error' ? (
						<div className="flex items-center gap-2 text-red-600">
							<X className="w-5 h-5" />
							<span className="text-sm">{errorMessage || 'Upload failed'}</span>
						</div>
					) : (
						<>
							<Upload className="w-5 h-5 text-gray-400" />
							<span className="text-sm truncate max-w-[200px]">
								{file.name}
							</span>
						</>
					)}
				</div>
				<div className="flex items-center gap-2">
					{status === 'completed' && (
						<Button
							variant="outline"
							size="sm"
							onClick={onReplace}
							disabled={isUploading}>
							Replace
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={onRemove}
						disabled={isUploading}>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{isUploading && (
				<div className="space-y-2">
					<Progress value={uploadProgress} />
					<p className="text-xs text-center text-gray-500">
						Uploading... {uploadProgress}%
					</p>
				</div>
			)}
		</div>
	)
}

export function FileUploader({
	className,
	accept = 'image/*,video/*',
	maxSize = 50,
	onUploadComplete,
	multiple = false
}: FileUploaderProps) {
	const currentAccount = useCurrentAccount()
	const upload = useCloudinaryUpload()
	const currentUser = useQuery(api.users.getCurrentUser, {
		walletAddress: currentAccount?.address ?? ''
	})

	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [uploadStatuses, setUploadStatuses] = useState<
		Map<
			string,
			{
				progress: number
				status: 'idle' | 'uploading' | 'completed' | 'error'
				error?: string
				result?: CloudinaryUploadResult
			}
		>
	>(new Map())
	const progressIntervalsRef = useRef<Map<string, number>>(new Map())
	const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

	const cancelUpload = useCallback((fileId: string) => {
		const intervalId = progressIntervalsRef.current.get(fileId)
		if (intervalId !== undefined) {
			window.clearInterval(intervalId)
			progressIntervalsRef.current.delete(fileId)
		}
		const controller = abortControllersRef.current.get(fileId)
		if (controller) {
			controller.abort()
			abortControllersRef.current.delete(fileId)
		}
		setUploadStatuses((prev) => {
			const newStatuses = new Map(prev)
			newStatuses.delete(fileId)
			return newStatuses
		})
	}, [])

	const handleUpload = async (file: File) => {
		if (!currentUser?._id) {
			setUploadStatuses((prev) => {
				const newStatuses = new Map(prev)
				newStatuses.set(file.name, {
					progress: 0,
					status: 'error',
					error: 'User not authenticated'
				})
				return newStatuses
			})
			return
		}

		const controller = new AbortController()
		abortControllersRef.current.set(file.name, controller)

		try {
			setUploadStatuses((prev) => {
				const newStatuses = new Map(prev)
				newStatuses.set(file.name, {
					progress: 0,
					status: 'uploading'
				})
				return newStatuses
			})

			// Create progress simulation
			const intervalId = window.setInterval(() => {
				setUploadStatuses((prev) => {
					const newStatuses = new Map(prev)
					const currentStatus = newStatuses.get(file.name)
					if (currentStatus && currentStatus.status === 'uploading') {
						newStatuses.set(file.name, {
							...currentStatus,
							progress: Math.min(currentStatus.progress + 10, 90)
						})
					}
					return newStatuses
				})
			}, 500)
			progressIntervalsRef.current.set(file.name, intervalId)

			const result = await upload(file)

			// Clear the progress interval
			window.clearInterval(intervalId)
			progressIntervalsRef.current.delete(file.name)

			// Transform and store the result
			const transformedResult: CloudinaryUploadResult = {
				publicId: result.public_id,
				url: result.secure_url,
				...(result.resource_type === 'video' &&
					result.thumbnail && {
						thumbnail: result.thumbnail,
						duration: result.duration
					})
			}

			setUploadStatuses((prev) => {
				const newStatuses = new Map(prev)
				newStatuses.set(file.name, {
					progress: 100,
					status: 'completed',
					result: transformedResult
				})

				// Check if all files are completed within the state update
				const allCompleted = Array.from(newStatuses.values()).every(
					(status) => status.status === 'completed'
				)

				if (allCompleted) {
					// Get all completed results
					const results = Array.from(newStatuses.values())
						.map((status) => status.result)
						.filter((result): result is CloudinaryUploadResult => !!result)

					// Check if we have any videos (we don't support mixed content types)
					const hasVideos = results.some((r) => r.thumbnail !== undefined)
					if (hasVideos && results.length > 1) {
						throw new Error('Multiple video uploads are not supported')
					}

					if (onUploadComplete) {
						onUploadComplete(multiple ? results : results[0])
					}
					toast.success('All files uploaded successfully')
				}

				return newStatuses
			})
		} catch (error: unknown) {
			console.error('Upload failed:', error)
			setUploadStatuses((prev) => {
				const newStatuses = new Map(prev)
				newStatuses.set(file.name, {
					progress: 0,
					status: 'error',
					error: error instanceof Error ? error.message : 'Upload failed'
				})
				return newStatuses
			})
			window.clearInterval(progressIntervalsRef.current.get(file.name))
			progressIntervalsRef.current.delete(file.name)
		}
	}

	const handleClearFile = (index: number) => {
		const file = selectedFiles[index]
		if (file) {
			cancelUpload(file.name)
		}
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
	}

	// Parse accept string into object for react-dropzone
	const acceptedTypes = accept.split(',').reduce(
		(acc, type) => {
			acc[type.trim()] = []
			return acc
		},
		{} as Record<string, string[]>
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: acceptedTypes,
		maxSize: maxSize * 1024 * 1024,
		multiple,
		disabled: false,
		onDropAccepted: (files) => {
			if (multiple) {
				setSelectedFiles((prev) => [...prev, ...files])
				files.forEach(handleUpload)
			} else {
				setSelectedFiles([files[0]])
				handleUpload(files[0])
			}
		},
		onDropRejected: (rejections) => {
			const [rejection] = rejections
			if (rejection.errors[0].code === 'file-too-large') {
				toast.error(`File size must be less than ${maxSize}MB`)
			} else if (rejection.errors[0].code === 'file-invalid-type') {
				toast.error(`Only ${accept} files are allowed`)
			} else {
				toast.error('Invalid file')
			}
		}
	})

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			selectedFiles.forEach((file) => cancelUpload(file.name))
		}
	}, [cancelUpload, selectedFiles])

	return (
		<div className={cn('w-full', className)}>
			<div
				{...getRootProps()}
				className={cn(
					'w-full min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors',
					isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
					selectedFiles.length > 0
						? 'cursor-default'
						: 'cursor-pointer hover:border-primary/50'
				)}>
				<input {...getInputProps()} />

				{selectedFiles.length === 0 ? (
					<div className="flex flex-col items-center gap-2 text-center h-full justify-center">
						<Upload className="w-10 h-10 text-gray-400" />
						<div className="flex flex-col gap-1">
							<Button variant="ghost" disabled={false}>
								Choose {multiple ? 'files' : 'a file'}
							</Button>
							<p className="text-sm text-gray-500">or drag and drop</p>
						</div>
						<p className="text-xs text-gray-400">
							{accept} (max {maxSize}MB)
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{selectedFiles.map((file, index) => {
							const status = uploadStatuses.get(file.name)
							return (
								<FileItem
									key={index}
									file={file}
									onRemove={() => handleClearFile(index)}
									onReplace={() => {
										const input = document.createElement('input')
										input.type = 'file'
										input.accept = accept
										input.click()
										input.onchange = (e) => {
											const newFile = (e.target as HTMLInputElement).files?.[0]
											if (newFile) {
												setSelectedFiles((prev) => {
													const newFiles = [...prev]
													newFiles[index] = newFile
													return newFiles
												})
												handleUpload(newFile)
											}
										}
									}}
									isUploading={status?.status === 'uploading'}
									uploadProgress={status?.progress ?? 0}
									status={status?.status ?? 'idle'}
									errorMessage={status?.error}
								/>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
