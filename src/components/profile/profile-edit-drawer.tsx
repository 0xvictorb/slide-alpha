import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerFooter,
	DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { AvatarUpload } from './avatar-upload'

interface ProfileEditDrawerProps {
	user: any
	children: React.ReactNode
}

export function ProfileEditDrawer({ user, children }: ProfileEditDrawerProps) {
	const account = useCurrentAccount()
	const [isOpen, setIsOpen] = useState(false)
	const [name, setName] = useState(user?.name || '')
	const [bio, setBio] = useState(user?.bio || '')
	const [isLoading, setIsLoading] = useState(false)

	const updateProfile = useMutation(api.users.updateProfile)

	const handleSave = async () => {
		if (!account?.address) return

		setIsLoading(true)
		try {
			await updateProfile({
				walletAddress: account.address,
				name: name.trim(),
				bio: bio.trim()
			})
			toast.success('Profile updated successfully')
			setIsOpen(false)
		} catch (error) {
			toast.error('Failed to update profile')
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCancel = () => {
		setName(user?.name || '')
		setBio(user?.bio || '')
		setIsOpen(false)
	}

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className="max-h-[90vh]">
				<DrawerHeader className="text-center">
					<DrawerTitle>Edit Profile</DrawerTitle>
					<DrawerDescription>
						Update your profile information and avatar
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto px-4 pb-4">
					<div className="max-w-md mx-auto space-y-6">
						{/* Avatar Section */}
						<div className="text-center">
							<Label className="text-sm font-medium mb-2 block">
								Profile Picture
							</Label>
							<div className="flex justify-center">
								<AvatarUpload
									currentAvatarUrl={user?.avatarUrl}
									userName={user?.name}
									size="lg"
									onUploadComplete={() => {
										toast.success('Avatar uploaded successfully')
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Click to upload a new profile picture
							</p>
						</div>

						{/* Name Section */}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-sm font-medium">
								Display Name
							</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your display name"
								maxLength={50}
							/>
							<p className="text-xs text-muted-foreground">
								{name.length}/50 characters
							</p>
						</div>

						{/* Bio Section */}
						<div className="space-y-2">
							<Label htmlFor="bio" className="text-sm font-medium">
								Bio
							</Label>
							<Textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell people about yourself..."
								rows={4}
								maxLength={200}
								className="resize-none"
							/>
							<p className="text-xs text-muted-foreground">
								{bio.length}/200 characters
							</p>
						</div>
					</div>
				</div>

				<DrawerFooter className="flex-row gap-2">
					<DrawerClose asChild>
						<Button
							variant="secondary"
							onClick={handleCancel}
							className="flex-1">
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
					</DrawerClose>
					<Button
						onClick={handleSave}
						disabled={isLoading || !name.trim()}
						className="flex-1">
						<Save className="h-4 w-4 mr-2" />
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
