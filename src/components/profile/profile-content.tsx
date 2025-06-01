import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatAddress } from '@mysten/sui/utils'
import {
	UserPlus,
	UserCheck,
	Camera,
	Edit,
	Share,
	MessageCircle,
	Copy
} from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, TvSmartIcon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import { ContentCard } from './content-card'
import { ProfileSkeleton } from './profile-skeleton'
import { ContentGridSkeleton } from './content-grid-skeleton'
import { ProfileEditDrawer } from './profile-edit-drawer'
import { useNavigate } from '@tanstack/react-router'
import WalletButton from '../../components/shared/wallet-button'

interface ProfileContentProps {
	profileAddress: string
}

function ProfileHeader({
	user,
	isOwnProfile
}: {
	user: any
	isOwnProfile: boolean
	isFollowing: boolean | undefined
	onToggleFollow: () => void
}) {
	const navigate = useNavigate()

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
				{isOwnProfile ? (
					<div className="flex items-center gap-2">
						<WalletButton />
					</div>
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

	const handleShareProfile = async () => {
		if (!user) return

		try {
			if (navigator.share) {
				await navigator.share({
					title: `${user.name}'s Profile`,
					text: `Check out ${user.name}'s profile`,
					url: window.location.href
				})
			} else {
				// Fallback to clipboard
				await navigator.clipboard.writeText(window.location.href)
				toast.success('Profile link copied to clipboard!')
			}
		} catch (error) {
			toast.error('Failed to share profile')
			console.error(error)
		}
	}

	const handleChatClick = () => {
		// TODO: Implement chat functionality
		toast.info('Chat feature coming soon!')
	}

	const handleCopyAddress = async () => {
		try {
			await navigator.clipboard.writeText(profileAddress)
			toast.success('Address copied to clipboard!')
		} catch (error) {
			toast.error('Failed to copy address')
			console.error(error)
		}
	}

	return (
		<div className="flex flex-col h-full">
			<ProfileHeader
				user={user}
				isOwnProfile={isOwnProfile}
				isFollowing={isFollowing}
				onToggleFollow={handleToggleFollow}
			/>
			{user ? (
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
													<AvatarFallback className="text-2xl bg-white text-main">
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
											<AvatarFallback className="text-2xl bg-white text-main">
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									)}
								</div>

								{/* Username and Basic Info */}
								<div className="text-center mb-6">
									{/* Name */}
									<div className="flex items-center justify-center gap-2 mb-2">
										<h2 className="text-xl font-semibold flex items-center gap-2">
											@{user.name}
										</h2>
									</div>

									{/* Wallet Address */}
									<div className="mb-4">
										<div
											className="text-xs text-foreground/50 font-mono bg-secondary-background px-3 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer hover:bg-secondary-background/80 hover:text-foreground/70 transition-colors"
											onClick={handleCopyAddress}
											title="Click to copy address">
											<span>{formatAddress(profileAddress)}</span>
											<Copy className="h-3 w-3" />
										</div>
									</div>

									{/* Join Date */}
									<p className="text-xs text-foreground/50 mb-4">
										joined on{' '}
										{new Date(user._creationTime).toLocaleDateString('en-US', {
											month: '2-digit',
											day: '2-digit',
											year: 'numeric'
										})}
									</p>

									{/* Action Buttons */}
									{isOwnProfile ? (
										<div className="flex gap-3 justify-center mb-6">
											<ProfileEditDrawer user={user}>
												<Button variant="secondary" className="px-6">
													<Edit className="h-4 w-4 mr-2" />
													Edit Profile
												</Button>
											</ProfileEditDrawer>
											<Button
												variant="default"
												className="px-6"
												onClick={handleShareProfile}>
												<Share className="h-4 w-4 mr-2" />
												Share Profile
											</Button>
										</div>
									) : (
										account?.address && (
											<div className="flex gap-3 justify-center mb-6">
												<Button
													onClick={handleToggleFollow}
													variant={isFollowing ? 'secondary' : 'default'}
													className={`px-6 ${
														isFollowing
															? 'bg-secondary-background hover:bg-secondary-background/80 text-foreground/70 border border-border'
															: 'bg-blue-500 hover:bg-blue-600 text-white'
													}`}>
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
												<Button
													variant="ghost"
													className="px-6"
													onClick={handleChatClick}>
													<MessageCircle className="h-4 w-4 mr-2" />
													Chat
												</Button>
											</div>
										)
									)}

									{/* Stats */}
									<div className="flex justify-center gap-4 mb-6">
										<Card className="p-2 min-w-[100px]">
											<div className="text-center">
												<p className="text-2xl font-bold text-foreground">
													{user.followingCount}
												</p>
												<p className="text-sm text-foreground/60 font-medium">
													Following
												</p>
											</div>
										</Card>
										<Card className="p-2 min-w-[100px]">
											<div className="text-center">
												<p className="text-2xl font-bold text-foreground">
													{user.followerCount}
												</p>
												<p className="text-sm text-foreground/60 font-medium">
													Followers
												</p>
											</div>
										</Card>
									</div>

									{/* Bio */}
									<div className="text-center">
										<p className="text-sm text-foreground/60 max-w-md mx-auto">
											{user.bio ||
												(isOwnProfile
													? 'Add a bio to tell people about yourself...'
													: 'No bio available')}
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
												<HugeiconsIcon
													icon={TvSmartIcon}
													size={48}
													className="text-secondary mb-4 mx-auto"
												/>
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
			) : (
				<ProfileSkeleton />
			)}
		</div>
	)
}
