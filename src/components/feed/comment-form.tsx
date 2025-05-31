import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { cn } from '@/lib/utils'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CommentFormProps {
	contentId: Id<'content'>
	onCommentAdded?: () => void
	className?: string
}

export function CommentForm({
	contentId,
	onCommentAdded,
	className
}: CommentFormProps) {
	const [text, setText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const createComment = useMutation(api.content.createComment)
	const currentAccount = useCurrentAccount()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!text.trim()) {
			toast.error('Please enter a comment')
			return
		}

		if (!currentAccount?.address) {
			toast.error('Please connect your wallet to comment')
			return
		}

		if (text.length > 1000) {
			toast.error('Comment cannot exceed 1000 characters')
			return
		}

		setIsSubmitting(true)

		try {
			await createComment({
				contentId,
				text: text.trim(),
				walletAddress: currentAccount.address
			})

			setText('')
			toast.success('Comment added successfully!')
			onCommentAdded?.()
		} catch (error) {
			console.error('Failed to create comment:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to add comment'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault()
			handleSubmit(e as any)
		}
	}

	const isDisabled = !text.trim() || isSubmitting || !currentAccount?.address

	return (
		<form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
			<div className="space-y-2">
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						currentAccount?.address
							? 'Add a comment... (Ctrl/Cmd + Enter to submit)'
							: 'Connect your wallet to comment'
					}
					disabled={isSubmitting || !currentAccount?.address}
					maxLength={1000}
					rows={3}
					className="resize-none"
				/>

				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						{text.length}/1000 characters
					</span>

					<Button
						type="submit"
						size="sm"
						disabled={isDisabled}
						className="min-w-[80px]">
						{isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Posting...
							</>
						) : (
							<>
								<Send className="w-4 h-4 mr-2" />
								Post
							</>
						)}
					</Button>
				</div>
			</div>
		</form>
	)
}
