import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { CommentsDrawer } from './comments-drawer'

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

	return (
		<div className="flex flex-col gap-4">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => handleLike('like')}
				className={userLike === 'like' ? 'text-primary' : 'text-white'}>
				<ThumbsUp className="w-6 h-6" />
				<span className="sr-only">Like</span>
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => handleLike('dislike')}
				className={userLike === 'dislike' ? 'text-primary' : 'text-white'}>
				<ThumbsDown className="w-6 h-6" />
				<span className="sr-only">Dislike</span>
			</Button>
			<CommentsDrawer
				contentId={contentId}
				trigger={
					<Button
						variant="ghost"
						size="icon"
						className="text-white hover:text-primary">
						<span className="sr-only">Comments</span>
					</Button>
				}
			/>
		</div>
	)
}
