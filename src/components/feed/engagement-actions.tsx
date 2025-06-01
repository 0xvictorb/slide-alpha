import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { CommentsDrawer } from './comments-drawer'
import { Message01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import IconLike from '@/assets/icons/like.svg?react'
import IconLikeFilled from '@/assets/icons/like-filled.svg?react'
import IconDislike from '@/assets/icons/dislike.svg?react'
import IconDislikeFilled from '@/assets/icons/dislike-filled.svg?react'

interface EngagementActionsProps {
	contentId: Id<'content'>
}

export function EngagementActions({ contentId }: EngagementActionsProps) {
	const currentAccount = useCurrentAccount()
	const toggleLike = useMutation(api.content.toggleLike)
	const userLike = useQuery(
		api.content.getUserLike,
		currentAccount?.address
			? { contentId, walletAddress: currentAccount.address }
			: 'skip'
	)

	// Get content stats for like/dislike counts
	const contentStats = useQuery(api.content.getContentStats, { contentId })
	const commentCount = useQuery(api.content.getCommentCount, { contentId })

	const handleLike = async (type: 'like' | 'dislike') => {
		if (!currentAccount?.address) {
			toast.error('Please connect your wallet first')
			return
		}

		try {
			await toggleLike({
				contentId,
				type,
				walletAddress: currentAccount.address
			})
		} catch (error) {
			console.error('Failed to toggle like:', error)
			toast.error('Failed to like content. Please try again.')
		}
	}

	const formatCount = (count: number) => {
		if (count >= 1000000) {
			return `${(count / 1000000).toFixed(1)}M`
		}
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}K`
		}
		return count.toString()
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Like Button */}
			<div className="flex flex-col items-center gap-1">
				<button
					onClick={() => handleLike('like')}
					className={
						userLike === 'like'
							? 'text-secondary'
							: 'text-white hover:text-secondary'
					}>
					{userLike === 'like' ? (
						<IconLikeFilled className="w-6 h-6" />
					) : (
						<IconLike className="w-6 h-6" />
					)}
					<span className="sr-only">Like</span>
				</button>
				{contentStats && (
					<span className="text-white text-xs font-medium">
						{formatCount(contentStats.likes)}
					</span>
				)}
			</div>

			{/* Dislike Button */}
			<div className="flex flex-col items-center gap-1">
				<button
					onClick={() => handleLike('dislike')}
					className={
						userLike === 'dislike'
							? 'text-red-600'
							: 'text-white hover:text-red-600'
					}>
					{userLike === 'dislike' ? (
						<IconDislikeFilled className="w-6 h-6" />
					) : (
						<IconDislike className="w-6 h-6" />
					)}
					<span className="sr-only">Dislike</span>
				</button>
				{contentStats && (
					<span className="text-white text-xs font-medium">
						{formatCount(contentStats.dislikes)}
					</span>
				)}
			</div>

			{/* Comment Button */}
			<div className="flex flex-col items-center gap-1">
				<CommentsDrawer
					contentId={contentId}
					trigger={
						<button className="text-white hover:text-primary">
							<HugeiconsIcon
								onClick={() => handleLike('dislike')}
								icon={Message01Icon}
								size={24}
							/>
							<span className="sr-only">Comments</span>
						</button>
					}
				/>
				{commentCount !== undefined && (
					<span className="text-white text-xs font-medium">
						{formatCount(commentCount)}
					</span>
				)}
			</div>
		</div>
	)
}
