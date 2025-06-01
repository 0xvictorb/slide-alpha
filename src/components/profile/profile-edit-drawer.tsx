import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import {
	Drawer,
	DrawerContent,
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
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
			<DrawerContent className="mx-auto max-w-[500px] h-[85vh]">
				<DrawerHeader className="flex-shrink-0 border-b border-border/10 pb-4">
					<DrawerTitle>Edit Profile</DrawerTitle>
				</DrawerHeader>

				<ScrollArea className="flex-1">
					<div className="px-4 py-6 space-y-6">
						{/* Avatar Section */}
						<div className="flex flex-col items-center space-y-4 py-4">
							<div className="text-center space-y-3">
								<AvatarUpload
									currentAvatarUrl={user?.avatarUrl}
									userName={user?.name}
									size="lg"
									onUploadComplete={() => {
										toast.success('Avatar uploaded successfully')
									}}
								/>
							</div>
						</div>

						{/* Profile Information */}
						<Card className="border-0 bg-secondary-background/30 shadow-sm">
							<CardContent className="p-6 space-y-6">
								{/* Name Section */}
								<div className="space-y-3">
									<Label htmlFor="name" className="block">
										Display Name
									</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Enter your display name"
										maxLength={50}
									/>
									<div className="flex justify-between items-center">
										<p className="text-xs text-foreground/60">
											This is how others will see your name
										</p>
										<p className="text-xs text-foreground/50 font-medium">
											{name.length}/50
										</p>
									</div>
								</div>

								{/* Bio Section */}
								<div className="space-y-3">
									<Label htmlFor="bio" className="block">
										Bio
									</Label>
									<Textarea
										id="bio"
										value={bio}
										onChange={(e) => setBio(e.target.value)}
										placeholder="Share something about yourself..."
										rows={4}
										maxLength={200}
									/>
									<div className="flex justify-between items-center">
										<p className="text-xs text-foreground/60">
											Tell others what makes you unique
										</p>
										<p className="text-xs text-foreground/50 font-medium">
											{bio.length}/200
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</ScrollArea>

				<DrawerFooter className="border-t border-border/10 flex-shrink-0 p-4 bg-background/95">
					<div className="flex gap-3 w-full">
						<DrawerClose asChild>
							<Button
								variant="neutral"
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
					</div>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
