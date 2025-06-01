import { useState, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'
import { MessageCircle } from 'lucide-react'

interface CommentsDrawerProps {
	contentId: Id<'content'>
	className?: string
	trigger?: React.ReactNode
}

export function CommentsDrawer({
	contentId,
	className,
	trigger
}: CommentsDrawerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [commentsOffset, setCommentsOffset] = useState(0)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const COMMENTS_LIMIT = 20

	const commentCount = useQuery(api.content.getCommentCount, { contentId })
	const comments = useQuery(api.content.getComments, {
		contentId,
		limit: COMMENTS_LIMIT,
		offset: commentsOffset
	})

	const hasMore = comments
		? comments.length === COMMENTS_LIMIT + commentsOffset
		: false

	const handleCommentAdded = useCallback(() => {
		// Reset to show newest comments when a new one is added
		setCommentsOffset(0)
	}, [])

	const handleLoadMore = async () => {
		if (isLoadingMore || !hasMore) return

		setIsLoadingMore(true)
		try {
			setCommentsOffset((prev) => prev + COMMENTS_LIMIT)
		} finally {
			setIsLoadingMore(false)
		}
	}

	const defaultTrigger = (
		<Button
			variant="ghost"
			size="sm"
			className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
			<MessageCircle className="w-4 h-4" />
			<span>{commentCount || 0}</span>
		</Button>
	)

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger asChild className={className}>
				{trigger || defaultTrigger}
			</DrawerTrigger>
			<DrawerContent className="max-h-[80vh] max-w-[780px] mx-auto">
				<DrawerHeader className="pb-0">
					<DrawerTitle>Comments</DrawerTitle>
					<DrawerDescription>
						{commentCount === undefined
							? 'Loading comments...'
							: commentCount === 0
								? 'No comments yet'
								: `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex flex-col h-full max-h-[calc(80vh-120px)]">
					{/* Comment Form */}
					<div className="px-4 py-3 border-b">
						<CommentForm
							contentId={contentId}
							onCommentAdded={handleCommentAdded}
						/>
					</div>

					{/* Comments List */}
					<div className="flex-1 overflow-y-auto px-4 py-3">
						<CommentList
							contentId={contentId}
							onLoadMore={handleLoadMore}
							hasMore={hasMore}
							isLoadingMore={isLoadingMore}
						/>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
