import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@mysten/sui/utils'
import { Users, UserPlus, Edit3, Check, X, Play } from 'lucide-react'
import { toast } from 'sonner'
import { ContentCard } from './content-card'
import { ProfileSkeleton } from './profile-skeleton'
import { ContentGridSkeleton } from './content-grid-skeleton'

export function ProfileContent() {
	const account = useCurrentAccount()
	const [isEditingName, setIsEditingName] = useState(false)
	const [isEditingBio, setIsEditingBio] = useState(false)
	const [editName, setEditName] = useState('')
	const [editBio, setEditBio] = useState('')

	// Queries
	const user = useQuery(
		api.users.getCurrentUser,
		account?.address ? { walletAddress: account.address } : 'skip'
	)
	const userContent = useQuery(
		api.users.getUserContent,
		account?.address ? { walletAddress: account.address } : 'skip'
	)

	// Mutations
	const updateProfile = useMutation(api.users.updateProfile)

	const handleSaveName = async () => {
		if (!account?.address) return

		try {
			await updateProfile({
				walletAddress: account.address,
				name: editName.trim()
			})
			setIsEditingName(false)
			toast.success('Name updated successfully')
		} catch (error) {
			toast.error('Failed to update name')
			console.error(error)
		}
	}

	const handleSaveBio = async () => {
		if (!account?.address) return

		try {
			await updateProfile({
				walletAddress: account.address,
				bio: editBio.trim()
			})
			setIsEditingBio(false)
			toast.success('Bio updated successfully')
		} catch (error) {
			toast.error('Failed to update bio')
			console.error(error)
		}
	}

	const startEditingName = () => {
		setEditName(user?.name || '')
		setIsEditingName(true)
	}

	const startEditingBio = () => {
		setEditBio(user?.bio || '')
		setIsEditingBio(true)
	}

	const cancelEditName = () => {
		setIsEditingName(false)
		setEditName('')
	}

	const cancelEditBio = () => {
		setIsEditingBio(false)
		setEditBio('')
	}

	if (!user) {
		return <ProfileSkeleton />
	}

	return (
		<div className="container max-w-4xl p-4 space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold">Profile</h1>
				<p className="text-muted-foreground">Manage your profile and content</p>
			</div>

			{/* User Information Card */}
			<Card>
				<CardHeader className="pb-4">
					<CardTitle>User Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar and Basic Info */}
					<div className="flex items-start gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={user.avatarUrl} />
							<AvatarFallback className="text-lg">
								{user.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-4">
							{/* Wallet Address */}
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Wallet Address
								</label>
								<div className="mt-1 font-mono text-sm bg-muted p-2 rounded-md">
									{account?.address
										? formatAddress(account.address)
										: 'Not connected'}
								</div>
							</div>

							{/* Name Field */}
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Name
								</label>
								{isEditingName ? (
									<div className="mt-1 flex gap-2">
										<Input
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											className="flex-1"
											placeholder="Enter your name"
										/>
										<Button
											size="sm"
											onClick={handleSaveName}
											disabled={!editName.trim()}>
											<Check className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={cancelEditName}>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<div className="mt-1 flex items-center gap-2">
										<span className="flex-1">{user.name}</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={startEditingName}>
											<Edit3 className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>

							{/* Bio Field */}
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Description
								</label>
								{isEditingBio ? (
									<div className="mt-1 space-y-2">
										<Textarea
											value={editBio}
											onChange={(e) => setEditBio(e.target.value)}
											placeholder="Tell us about yourself..."
											rows={3}
										/>
										<div className="flex gap-2">
											<Button size="sm" onClick={handleSaveBio}>
												<Check className="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={cancelEditBio}>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</div>
								) : (
									<div className="mt-1 flex items-start gap-2">
										<span className="flex-1 text-sm text-muted-foreground">
											{user.bio || 'No description yet...'}
										</span>
										<Button size="sm" variant="ghost" onClick={startEditingBio}>
											<Edit3 className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Stats Card */}
			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-md">
								<Users className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Followers</p>
								<p className="text-xl font-semibold">{user.followerCount}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-md">
								<UserPlus className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Following</p>
								<p className="text-xl font-semibold">{user.followingCount}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Created Videos Section */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle>Created Videos</CardTitle>
						<Badge variant="secondary">{userContent?.length || 0} videos</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{userContent === undefined ? (
						<ContentGridSkeleton />
					) : userContent.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-muted-foreground mb-4">
								<Play className="h-12 w-12 mx-auto mb-2" />
								<p>No videos created yet</p>
								<p className="text-sm">Start creating content to see it here</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{userContent.map((content) => (
								<ContentCard key={content._id} content={content} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
