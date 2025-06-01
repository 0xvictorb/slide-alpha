import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus } from 'lucide-react'
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

	const showFollowButton =
		!isOwnContent && currentAccount?.address && !isFollowing

	return (
		<div className={cn('flex items-center gap-3', className)}>
			{/* User Avatar and Info */}
			<div className="flex items-center gap-3">
				<div className="relative">
					<div
						className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
						onClick={handleProfileClick}>
						<Avatar className="w-12 h-12 border-2 border-white/10 group-hover:border-white/20 transition-colors">
							<AvatarImage src={author.avatarUrl} />
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
								{author.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-semibold text-white text-sm truncate leading-tight">
								{author.name}
							</p>
							<p className="text-white/60 text-xs truncate leading-tight mt-0.5">
								@{author.walletAddress.slice(0, 8)}...
							</p>
						</div>
					</div>

					{/* Small Follow Icon Button - positioned near avatar */}
					{showFollowButton && (
						<Button
							size="sm"
							onClick={handleFollowToggle}
							disabled={isFollowLoading}
							className="absolute -top-1 -right-1 w-6 h-6 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg border-2 border-white/20 transition-all hover:scale-110">
							{isFollowLoading ? (
								<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
							) : (
								<UserPlus className="w-3 h-3" />
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
