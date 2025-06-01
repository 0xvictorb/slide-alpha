import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useUser } from '../../hooks/useUser'
import type { Id } from '../../../convex/_generated/dataModel'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, BubbleChatIcon } from '@hugeicons/core-free-icons'
import { useNavigate } from '@tanstack/react-router'

interface Message {
	_id: Id<'messages'>
	_creationTime: number
	threadId: Id<'threads'>
	senderId: Id<'users'>
	content: string
	sender?: {
		_id: Id<'users'>
		name: string
	}
}

interface Thread {
	_id: Id<'threads'>
	_creationTime: number
	participants: Array<{
		_id: Id<'users'>
		name: string
	}>
	lastMessageTime: number
	lastMessagePreview: string
}

export const Route = createFileRoute('/chat/$threadId')({
	component: ChatDetailRoute
})

function ChatHeader({ threadName }: { threadName: string }) {
	const navigate = useNavigate()

	return (
		<div className="sticky top-0 z-50 bg-white/95 border-b-2 border-border">
			<div className="flex items-center justify-between px-4 py-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: '/chat' })}
					className="size-8">
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						size={20}
						className="text-foreground"
					/>
				</Button>
				<h1 className="text-lg font-semibold text-foreground">{threadName}</h1>
				<div className="w-10" /> {/* Spacer for center alignment */}
			</div>
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full text-center p-4">
			<HugeiconsIcon
				icon={BubbleChatIcon}
				size={48}
				className="text-muted-foreground mb-4"
			/>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No messages yet
			</h3>
			<p className="text-sm text-muted-foreground">
				Start the conversation by sending a message below.
			</p>
		</div>
	)
}

function ChatDetailRoute() {
	const { user } = useUser()
	const { threadId } = Route.useParams()
	const [newMessage, setNewMessage] = useState('')
	const navigate = useNavigate()

	const messages = useQuery(api.chat.getMessages, {
		threadId: threadId as Id<'threads'>
	}) as Message[] | undefined

	const threads = useQuery(api.chat.getThreads, {
		userId: user?._id || ('' as Id<'users'>)
	}) as Thread[] | undefined

	const thread = threads?.find((t) => t._id.toString() === threadId)

	const sendMessage = useMutation(api.chat.sendMessage)

	const handleSendMessage = () => {
		if (!user || !newMessage.trim() || !thread) return

		sendMessage({
			threadId: thread._id,
			senderId: user._id,
			content: newMessage.trim()
		})

		setNewMessage('')
	}

	const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
		setNewMessage(e.target.value)
	}

	// If threads are still loading, show nothing
	if (threads === undefined) return null

	// If thread not found, redirect back to chat list
	if (!thread) {
		navigate({ to: '/chat' })
		return null
	}

	const threadName = thread.participants
		.filter((p: { _id: Id<'users'>; name: string }) => p._id !== user?._id)
		.map((p: { _id: Id<'users'>; name: string }) => p.name)
		.join(', ')

	return (
		<div className="flex flex-col h-screen">
			<ChatHeader threadName={threadName} />
			<ScrollArea className="flex-1 p-4">
				{!messages || messages.length === 0 ? (
					<EmptyState />
				) : (
					<div className="flex flex-col-reverse">
						{messages.map((message: Message) => (
							<div
								key={message._id}
								className={`mb-4 max-w-[70%] ${
									message.senderId === user?._id ? 'ml-auto' : ''
								}`}>
								<div
									className={`p-3 rounded-lg ${
										message.senderId === user?._id
											? 'bg-primary text-primary-foreground'
											: 'bg-muted'
									}`}>
									{message.content}
								</div>
								<div className="text-xs text-gray-500 mt-1">
									{message.sender?.name}
								</div>
							</div>
						))}
					</div>
				)}
			</ScrollArea>

			{/* Message Input */}
			<div className="p-4 border-t border-gray-200">
				<form
					onSubmit={(e: FormEvent) => {
						e.preventDefault()
						handleSendMessage()
					}}
					className="flex gap-2">
					<Input
						value={newMessage}
						onChange={handleMessageChange}
						placeholder="Type a message..."
						className="flex-1"
					/>
					<Button type="submit">Send</Button>
				</form>
			</div>
		</div>
	)
}
