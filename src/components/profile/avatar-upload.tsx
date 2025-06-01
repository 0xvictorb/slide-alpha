import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useCloudinaryUpload } from '@/lib/cloudinary'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
	currentAvatarUrl?: string
	userName: string
	className?: string
	size?: 'sm' | 'md' | 'lg'
	onUploadComplete?: (avatarUrl: string) => void
}

export function AvatarUpload({
	currentAvatarUrl,
	userName,
	className,
	size = 'lg',
	onUploadComplete
}: AvatarUploadProps) {
	const account = useCurrentAccount()
	const [isUploading, setIsUploading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const upload = useCloudinaryUpload()
	const updateAvatar = useMutation(api.users.updateAvatar)

	const sizeClasses = {
		sm: 'h-16 w-16',
		md: 'h-20 w-20',
		lg: 'h-24 w-24'
	}

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file || !account?.address) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file')
			return
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be less than 5MB')
			return
		}

		setIsUploading(true)

		try {
			// Create preview
			const objectUrl = URL.createObjectURL(file)
			setPreviewUrl(objectUrl)

			// Upload to Cloudinary
			const result = await upload(file)

			// Update user avatar in Convex
			await updateAvatar({
				walletAddress: account.address,
				avatarUrl: result.media_url
			})

			// Clean up preview
			URL.revokeObjectURL(objectUrl)
			setPreviewUrl(null)

			toast.success('Profile picture updated!')
			onUploadComplete?.(result.media_url)
		} catch (error) {
			console.error('Avatar upload failed:', error)
			toast.error('Failed to update profile picture')

			// Clean up preview on error
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
				setPreviewUrl(null)
			}
		} finally {
			setIsUploading(false)
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleAvatarClick = () => {
		if (!isUploading) {
			fileInputRef.current?.click()
		}
	}

	const cancelUpload = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
			setPreviewUrl(null)
		}
		setIsUploading(false)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const displayUrl = previewUrl || currentAvatarUrl

	return (
		<div className={cn('relative flex flex-col items-center', className)}>
			<div className="relative group">
				<Avatar
					className={cn(
						sizeClasses[size],
						'border-4 border-white shadow-lg cursor-pointer relative'
					)}>
					<AvatarImage src={displayUrl} alt={userName} />
					<AvatarFallback className="text-lg bg-background text-main">
						{userName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				{/* Upload overlay */}
				<div
					onClick={handleAvatarClick}
					className={cn(
						'absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
						isUploading && 'opacity-100'
					)}>
					{isUploading ? (
						<Loader2 className="h-6 w-6 text-white animate-spin" />
					) : (
						<Camera className="h-6 w-6 text-white" />
					)}
				</div>

				{/* Cancel button when uploading */}
				{isUploading && previewUrl && (
					<Button
						size="sm"
						variant="destructive"
						className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 z-10"
						onClick={cancelUpload}>
						<X className="h-3 w-3" />
					</Button>
				)}
			</div>

			{/* Upload button for large size */}
			{size === 'lg' && (
				<Button
					variant="secondary"
					size="sm"
					onClick={handleAvatarClick}
					disabled={isUploading}
					className="mt-2">
					<Upload className="h-3 w-3 mr-1" />
					{isUploading ? 'Uploading...' : 'Change Photo'}
				</Button>
			)}

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={isUploading}
			/>
		</div>
	)
}
