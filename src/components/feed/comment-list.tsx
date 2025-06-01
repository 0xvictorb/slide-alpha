import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Trash2, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'

interface CommentListProps {
	contentId: Id<'content'>
	onLoadMore?: () => void
	hasMore?: boolean
	isLoadingMore?: boolean
	className?: string
}

export function CommentList({
	contentId,
	onLoadMore,
	hasMore = false,
	isLoadingMore = false,
	className
}: CommentListProps) {
	const [deletingCommentId, setDeletingCommentId] =
		useState<Id<'comments'> | null>(null)
	const comments = useQuery(api.content.getComments, { contentId })
	const deleteComment = useMutation(api.content.deleteComment)
	const currentAccount = useCurrentAccount()

	const handleDeleteComment = async (commentId: Id<'comments'>) => {
		if (!currentAccount?.address) {
			toast.error('Please connect your wallet')
			return
		}

		setDeletingCommentId(commentId)

		try {
			await deleteComment({
				commentId,
				walletAddress: currentAccount.address
			})
			toast.success('Comment deleted successfully!')
		} catch (error) {
			console.error('Failed to delete comment:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete comment'
			)
		} finally {
			setDeletingCommentId(null)
		}
	}

	const formatTimeAgo = (timestamp: number) => {
		const now = Date.now()
		const diff = now - timestamp
		const minutes = Math.floor(diff / (1000 * 60))
		const hours = Math.floor(diff / (1000 * 60 * 60))
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (minutes < 1) return 'now'
		if (minutes < 60) return `${minutes}m ago`
		if (hours < 24) return `${hours}h ago`
		if (days < 7) return `${days}d ago`
		return new Date(timestamp).toLocaleDateString()
	}

	if (comments === undefined) {
		return (
			<div className={cn('space-y-4', className)}>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="flex space-x-3">
						<Skeleton className="w-8 h-8 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-16 w-full" />
						</div>
					</div>
				))}
			</div>
		)
	}

	if (comments.length === 0) {
		return (
			<div className={cn('text-center py-8', className)}>
				<MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
				<p className="text-muted-foreground">No comments yet</p>
				<p className="text-sm text-muted-foreground">
					Be the first to comment!
				</p>
			</div>
		)
	}

	return (
		<div className={cn('space-y-4', className)}>
			{comments.map((comment) => (
				<div key={comment._id} className="flex space-x-3">
					<Avatar className="w-8 h-8">
						<AvatarImage src={comment.author.avatarUrl} />
						<AvatarFallback>
							{comment.author.name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<p className="font-medium text-sm">{comment.author.name}</p>
								<p className="text-xs text-muted-foreground">
									{formatTimeAgo(comment.createdAt)}
								</p>
							</div>

							{currentAccount?.address === comment.author.walletAddress && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeleteComment(comment._id)}
									disabled={deletingCommentId === comment._id}
									className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
									{deletingCommentId === comment._id ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										<Trash2 className="w-3 h-3" />
									)}
								</Button>
							)}
						</div>

						<p className="text-sm mt-1 break-words whitespace-pre-wrap">
							{comment.text}
						</p>
					</div>
				</div>
			))}

			{hasMore && (
				<div className="flex justify-center pt-4">
					<Button
						variant="neutral"
						size="sm"
						onClick={onLoadMore}
						disabled={isLoadingMore}
						className="min-w-[100px]">
						{isLoadingMore ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Loading...
							</>
						) : (
							'Load more'
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
