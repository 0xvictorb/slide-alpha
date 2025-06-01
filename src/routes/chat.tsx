import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '../components/ui/button'
import { ScrollArea } from '../components/ui/scroll-area'
import { useUser } from '../hooks/useUser'
import type { Id } from '../../convex/_generated/dataModel'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, MessageIcon } from '@hugeicons/core-free-icons'
import { useNavigate } from '@tanstack/react-router'

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

export const Route = createFileRoute('/chat')({
	component: ChatRoute
})

function ChatHeader() {
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
				<h1 className="text-lg font-semibold text-foreground">Messages</h1>
				<div className="w-10" /> {/* Spacer for center alignment */}
			</div>
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full text-center p-4 px-20 pt-20">
			<HugeiconsIcon
				icon={MessageIcon}
				size={48}
				className="text-secondary mb-4"
			/>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No messages yet
			</h3>
			<p className="text-sm text-neutral-500">
				Start a conversation with other users to see your messages here.
			</p>
		</div>
	)
}

function ChatRoute() {
	const { user } = useUser()
	const navigate = useNavigate()

	const threads = useQuery(api.chat.getThreads, {
		userId: user?._id || ('' as Id<'users'>)
	}) as Thread[] | undefined

	return (
		<div className="flex flex-col h-screen">
			<ChatHeader />
			<ScrollArea className="flex-1">
				{!threads || threads.length === 0 ? (
					<EmptyState />
				) : (
					<div className="p-4">
						{threads.map((thread: Thread) => (
							<div
								key={thread._id}
								className="p-4 cursor-pointer rounded-lg mb-2 hover:bg-gray-100"
								onClick={() =>
									navigate({
										to: '/chat/$threadId',
										params: { threadId: thread._id.toString() }
									})
								}>
								<div className="font-semibold">
									{thread.participants
										.filter((p) => p._id !== user?._id)
										.map((p) => p.name)
										.join(', ')}
								</div>
								<div className="text-sm text-gray-500 truncate">
									{thread.lastMessagePreview}
								</div>
							</div>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
