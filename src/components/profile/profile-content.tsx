import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatAddress } from '@mysten/sui/utils'
import { UserPlus, Play, UserCheck, Camera, Edit, Check } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import { ContentCard } from './content-card'
import { ProfileSkeleton } from './profile-skeleton'
import { ContentGridSkeleton } from './content-grid-skeleton'
import { ProfileEditDrawer } from './profile-edit-drawer'
import { useNavigate } from '@tanstack/react-router'

interface ProfileContentProps {
	profileAddress: string
}

function ProfileHeader({
	user,
	isOwnProfile,
	isFollowing,
	onToggleFollow
}: {
	user: any
	isOwnProfile: boolean
	isFollowing: boolean | undefined
	onToggleFollow: () => void
}) {
	const navigate = useNavigate()
	const account = useCurrentAccount()

	return (
		<div className="sticky top-0 z-50 bg-white/95 border-b-2 border-border">
			<div className="flex items-center justify-between px-4 py-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: '/' })}
					className="size-8">
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						size={20}
						className="text-foreground"
					/>
				</Button>
				<h1 className="text-lg font-semibold text-foreground">
					{user?.name || 'Profile'}
				</h1>
				{!isOwnProfile && account?.address ? (
					<Button
						onClick={onToggleFollow}
						variant={isFollowing ? 'neutral' : 'default'}
						size="sm">
						{isFollowing ? (
							<>
								<UserCheck className="h-4 w-4 mr-2" />
								Following
							</>
						) : (
							<>
								<UserPlus className="h-4 w-4 mr-2" />
								Follow
							</>
						)}
					</Button>
				) : (
					<div className="w-10" /> // Spacer for center alignment
				)}
			</div>
		</div>
	)
}

export function ProfileContent({ profileAddress }: ProfileContentProps) {
	const account = useCurrentAccount()

	// Check if viewing own profile
	const isOwnProfile = account?.address === profileAddress

	// Queries
	const user = useQuery(api.users.getUserByWallet, {
		walletAddress: profileAddress
	})
	const userContent = useQuery(api.users.getUserContent, {
		walletAddress: profileAddress
	})

	// Follow status query (only if not own profile)
	const isFollowing = useQuery(
		api.users.isFollowing,
		!isOwnProfile && account?.address
			? {
					followerWalletAddress: account.address,
					followingWalletAddress: profileAddress
				}
			: 'skip'
	)

	// Mutations
	const toggleFollow = useMutation(api.users.toggleFollow)

	const handleToggleFollow = async () => {
		if (!account?.address || isOwnProfile) return

		try {
			const nowFollowing = await toggleFollow({
				followerWalletAddress: account.address,
				followingWalletAddress: profileAddress
			})
			toast.success(nowFollowing ? 'Now following' : 'Unfollowed')
		} catch (error) {
			toast.error('Failed to toggle follow')
			console.error(error)
		}
	}

	if (!user) {
		return <ProfileSkeleton />
	}

	return (
		<div className="flex flex-col h-full">
			<ProfileHeader
				user={user}
				isOwnProfile={isOwnProfile}
				isFollowing={isFollowing}
				onToggleFollow={handleToggleFollow}
			/>
			<ScrollArea className="flex-1">
				<div className="max-w-2xl max-h-[calc(100vh-140px)] space-y-6">
					<div className="space-y-6">
						{/* Profile Banner Card */}
						{/* Banner Background */}
						<div className="relative h-48 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600">
							<div className="absolute inset-0 bg-black/20" />
							{/* Background Pattern */}
							<div className="absolute inset-0 opacity-30">
								<div
									className="w-full h-full"
									style={{
										backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
										backgroundSize: '40px 40px'
									}}
								/>
							</div>
						</div>

						{/* Profile Content */}
						<CardContent className="relative -mt-16 px-4 pb-6">
							{/* Avatar */}
							<div className="flex justify-center mb-4">
								{isOwnProfile ? (
									<ProfileEditDrawer user={user}>
										<div className="relative group cursor-pointer">
											<Avatar className="h-24 w-24 border-4 border-white shadow-lg">
												<AvatarImage src={user.avatarUrl} />
												<AvatarFallback className="text-2xl bg-white text-primary">
													{user.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
												<Camera className="h-6 w-6 text-white" />
											</div>
										</div>
									</ProfileEditDrawer>
								) : (
									<Avatar className="h-24 w-24 border-4 border-white shadow-lg">
										<AvatarImage src={user.avatarUrl} />
										<AvatarFallback className="text-2xl bg-white text-primary">
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								)}
							</div>

							{/* Username and Basic Info */}
							<div className="text-center mb-6">
								{/* Name */}
								<div className="flex items-center justify-center gap-2 mb-2">
									<h2 className="text-xl font-bold flex items-center gap-2">
										@{user.name}
										<Badge
											variant="default"
											className="bg-blue-500 hover:bg-blue-600">
											<Check className="h-3 w-3" />
										</Badge>
									</h2>
								</div>

								{/* Join Date */}
								<p className="text-sm text-muted-foreground mb-4">
									joined on{' '}
									{new Date(user._creationTime).toLocaleDateString('en-US', {
										month: '2-digit',
										day: '2-digit',
										year: 'numeric'
									})}
								</p>

								{/* Stats */}
								<div className="flex justify-center gap-8 mb-6">
									<div className="text-center">
										<p className="text-2xl font-bold">{user.followingCount}</p>
										<p className="text-sm text-muted-foreground">Following</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold">{user.followerCount}</p>
										<p className="text-sm text-muted-foreground">Followers</p>
									</div>
								</div>

								{/* Action Buttons */}
								{isOwnProfile ? (
									<div className="flex gap-3 justify-center mb-6">
										<ProfileEditDrawer user={user}>
											<Button variant="secondary">
												<Edit className="h-4 w-4 mr-2" />
												Edit Profile
											</Button>
										</ProfileEditDrawer>
									</div>
								) : (
									account?.address && (
										<div className="flex gap-3 justify-center mb-6">
											<Button
												onClick={handleToggleFollow}
												className={`px-8 ${
													isFollowing
														? 'bg-green-500 hover:bg-green-600 text-white'
														: 'bg-green-500 hover:bg-green-600 text-white'
												}`}>
												{isFollowing ? 'Following' : 'Follow'}
												{!isFollowing && <UserPlus className="h-4 w-4 ml-2" />}
											</Button>
											<Button
												variant="secondary"
												className="px-8 bg-purple-500 hover:bg-purple-600 text-white border-purple-500">
												Message
												<HugeiconsIcon
													icon={ArrowLeft01Icon}
													size={16}
													className="ml-2 rotate-180"
												/>
											</Button>
										</div>
									)
								)}

								{/* Bio */}
								<div className="text-center">
									<p className="text-sm text-muted-foreground max-w-md mx-auto">
										{user.bio ||
											(isOwnProfile
												? 'Add a bio to tell people about yourself...'
												: 'No bio available')}
									</p>
								</div>

								{/* Wallet Address */}
								<div className="mt-4 text-center">
									<p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded-full inline-block">
										{formatAddress(profileAddress)}
									</p>
								</div>
							</div>
						</CardContent>

						{/* Created Videos Section */}
						<div className="px-4 pb-10">
							<CardHeader className="pb-4">
								<div className="flex items-center justify-between">
									<CardTitle>
										{isOwnProfile
											? 'Created Content'
											: `${user.name}'s Content`}
									</CardTitle>
									<Badge variant="secondary">
										{userContent?.length || 0} videos
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								{userContent === undefined ? (
									<ContentGridSkeleton />
								) : userContent.length === 0 ? (
									<div className="text-center py-12">
										<div className="text-muted-foreground mb-4">
											<Play className="h-12 w-12 mx-auto mb-2" />
											<p>
												{isOwnProfile
													? 'No videos created yet'
													: `${user.name} hasn't created any videos yet`}
											</p>
											{isOwnProfile && (
												<p className="text-sm">
													Start creating content to see it here
												</p>
											)}
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{userContent.map((content) => (
											<ContentCard
												key={content._id}
												content={content}
												profileAddress={profileAddress}
											/>
										))}
									</div>
								)}
							</CardContent>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	)
}
