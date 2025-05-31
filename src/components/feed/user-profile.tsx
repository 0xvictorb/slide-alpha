import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, UserCheck } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserProfileProps {
	author: {
		id: Id<'users'>
		name: string
		avatarUrl?: string
		walletAddress: string
	}
	onProfileClick?: () => void
	className?: string
}

export function UserProfile({
	author,
	onProfileClick,
	className
}: UserProfileProps) {
	const currentAccount = useCurrentAccount()
	const [isFollowLoading, setIsFollowLoading] = useState(false)

	// Check if current user is following this author
	const isFollowing = useQuery(
		api.users.isFollowing,
		currentAccount?.address && currentAccount.address !== author.walletAddress
			? {
					followerWalletAddress: currentAccount.address,
					followingWalletAddress: author.walletAddress
				}
			: 'skip'
	)

	const toggleFollow = useMutation(api.users.toggleFollow)

	// Check if viewing own content
	const isOwnContent = currentAccount?.address === author.walletAddress

	const handleFollowToggle = async () => {
		if (!currentAccount?.address) {
			toast.error('Please connect your wallet first')
			return
		}

		if (isOwnContent) {
			toast.error("You can't follow yourself")
			return
		}

		setIsFollowLoading(true)

		try {
			const nowFollowing = await toggleFollow({
				followerWalletAddress: currentAccount.address,
				followingWalletAddress: author.walletAddress
			})

			toast.success(
				nowFollowing ? `Following ${author.name}` : `Unfollowed ${author.name}`
			)
		} catch (error) {
			console.error('Failed to toggle follow:', error)
			toast.error('Failed to update follow status. Please try again.')
		} finally {
			setIsFollowLoading(false)
		}
	}

	const handleProfileClick = () => {
		onProfileClick?.()
		// TODO: Navigate to user profile page
		// navigate(`/profile/${author.walletAddress}`)
	}

	return (
		<div className={cn('flex items-center gap-3', className)}>
			{/* User Avatar and Info */}
			<div
				className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
				onClick={handleProfileClick}>
				<Avatar className="w-10 h-10 border-2 border-white/20">
					<AvatarImage src={author.avatarUrl} />
					<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
						{author.name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="font-semibold text-white text-sm truncate">
						{author.name}
					</p>
					<p className="text-white/70 text-xs truncate">
						@{author.walletAddress.slice(0, 8)}...
					</p>
				</div>
			</div>

			{/* Follow Button - only show if not viewing own content */}
			{!isOwnContent && currentAccount?.address && (
				<Button
					variant={isFollowing ? 'secondary' : 'default'}
					size="sm"
					onClick={handleFollowToggle}
					disabled={isFollowLoading}
					className={cn(
						'ml-auto min-w-[80px] h-8 text-xs font-medium',
						isFollowing
							? 'bg-white/20 text-white hover:bg-white/30'
							: 'bg-white text-black hover:bg-white/90'
					)}>
					{isFollowLoading ? (
						<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
					) : isFollowing ? (
						<>
							<UserCheck className="w-3 h-3 mr-1" />
							Following
						</>
					) : (
						<>
							<UserPlus className="w-3 h-3 mr-1" />
							Follow
						</>
					)}
				</Button>
			)}
		</div>
	)
}
