import { type ChangeEvent, useRef, useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Play } from 'lucide-react'
import type { DragEndEvent } from '@dnd-kit/core'
import {
	DndContext,
	useSensor,
	useSensors,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	KeyboardSensor,
	type UniqueIdentifier
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useCloudinaryUpload } from '@/lib/cloudinary'

interface FileUploaderProps {
	className?: string
	accept?: string
	maxSize?: number // in MB
	onUploadComplete?: (publicId: string) => void
	isPremium?: boolean
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

interface DraggableFileProps {
	file: File
	onRemove: () => void
	isUploading: boolean
	uploadProgress: number
	onUpload: () => void
}

function DraggableFile({
	file,
	onRemove,
	isUploading,
	uploadProgress,
	onUpload
}: DraggableFileProps) {
	return (
		<div className="w-full space-y-4 p-4 bg-white rounded-lg shadow-sm border">
			<FilePreview file={file} className="w-full aspect-video" />

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Upload className="w-5 h-5 text-gray-400" />
					<span className="text-sm truncate max-w-[200px]">{file.name}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={onRemove}
					disabled={isUploading}>
					<X className="w-4 h-4" />
				</Button>
			</div>

			{isUploading ? (
				<div className="space-y-2">
					<Progress value={uploadProgress} />
					<p className="text-xs text-center text-gray-500">
						Uploading... {uploadProgress}%
					</p>
				</div>
			) : (
				<Button className="w-full" onClick={onUpload}>
					Upload file
				</Button>
			)}
		</div>
	)
}

function DropOverlay() {
	return (
		<div className="absolute inset-0 bg-primary/5 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
			<div className="text-center">
				<Upload className="w-10 h-10 text-primary mx-auto mb-2" />
				<p className="text-sm text-primary font-medium">Drop to upload</p>
			</div>
		</div>
	)
}

export function FileUploader({
	className,
	accept = 'image/*,video/*',
	maxSize = 50, // Default 50MB
	onUploadComplete,
	isPremium = false
}: FileUploaderProps) {
	const currentAccount = useCurrentAccount()
	const upload = useCloudinaryUpload()
	const currentUser = useQuery(api.users.getCurrentUser, {
		walletAddress: currentAccount?.address ?? ''
	})

	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Configure DND Kit sensors
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 5
			}
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 100,
				tolerance: 5
			}
		}),
		useSensor(KeyboardSensor)
	)

	const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		validateAndSetFile(file)
	}

	const validateAndSetFile = (file: File | null | undefined) => {
		if (!file) return

		// Validate file size
		if (file.size > maxSize * 1024 * 1024) {
			toast.error(`File size must be less than ${maxSize}MB`)
			return
		}

		// Validate file type
		const fileType = file.type.split('/')[0]
		if (!accept.includes(fileType)) {
			toast.error(`Only ${accept} files are allowed`)
			return
		}

		setSelectedFile(file)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { over } = event
		setActiveId(null)

		// If dropped in the upload zone
		if (over && over.id === 'upload-zone') {
			handleUpload()
		}
	}

	const handleUpload = async () => {
		if (!selectedFile || !currentUser?._id) return

		try {
			setIsUploading(true)
			setUploadProgress(0)

			// Create a fake progress simulation since we can't track Cloudinary upload progress directly
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) return prev // Stop at 90% until upload completes
					return prev + 10
				})
			}, 500)

			// Upload to Cloudinary and save to Convex
			const result = await upload(selectedFile, {
				title: selectedFile.name,
				authorId: currentUser._id,
				isPremium,
				isActive: true
			})

			clearInterval(progressInterval)
			setUploadProgress(100)

			onUploadComplete?.(result.public_id)
			toast.success('File uploaded successfully')
		} catch (error) {
			toast.error('Upload failed. Please try again.')
			console.error('Upload error:', error)
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
			setSelectedFile(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleClearFile = () => {
		setSelectedFile(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<DndContext
			sensors={sensors}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToWindowEdges]}>
			<div
				className={cn(
					'relative flex flex-col items-center justify-center w-full min-h-[200px] transition-colors',
					className
				)}>
				<div
					id="upload-zone"
					className={cn(
						'w-full min-h-[200px] p-4 border-2 border-dashed rounded-lg',
						activeId ? 'border-primary bg-primary/5' : 'border-gray-300'
					)}>
					<input
						type="file"
						accept={accept}
						ref={fileInputRef}
						onChange={handleFileSelect}
						className="hidden"
						disabled={isUploading}
					/>

					{!selectedFile ? (
						<div className="flex flex-col items-center gap-2 text-center h-full justify-center">
							<Upload className="w-10 h-10 text-gray-400" />
							<div className="flex flex-col gap-1">
								<Button
									variant="ghost"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}>
									Choose a file
								</Button>
								<p className="text-sm text-gray-500">or drag and drop</p>
							</div>
							<p className="text-xs text-gray-400">
								{accept.split(',').join(', ')} (max {maxSize}MB)
							</p>
						</div>
					) : (
						<DraggableFile
							file={selectedFile}
							onRemove={handleClearFile}
							isUploading={isUploading}
							uploadProgress={uploadProgress}
							onUpload={handleUpload}
						/>
					)}
				</div>

				<DragOverlay>{activeId ? <DropOverlay /> : null}</DragOverlay>
			</div>
		</DndContext>
	)
}
