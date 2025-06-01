import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'

export const getThreads = query({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		if (!args.userId) return []

		const threads = await ctx.db.query('threads').collect()

		// Filter threads that contain the user
		const userThreads = threads.filter((thread) =>
			thread.participants.some((id) => id === args.userId)
		)

		// Sort by last message time
		userThreads.sort((a, b) => b.lastMessageTime - a.lastMessageTime)

		// Fetch participant details for each thread
		const threadsWithDetails = await Promise.all(
			userThreads.map(async (thread) => {
				const participants = await Promise.all(
					thread.participants.map((id) => ctx.db.get(id))
				)
				return {
					...thread,
					participants: participants.filter(Boolean) as Doc<'users'>[]
				}
			})
		)

		return threadsWithDetails
	}
})

export const getMessages = query({
	args: {
		threadId: v.id('threads')
	},
	handler: async (ctx, args) => {
		if (!args.threadId) return []

		const messages = await ctx.db
			.query('messages')
			.withIndex('by_thread', (q) => q.eq('threadId', args.threadId))
			.order('desc')
			.collect()

		// Fetch sender details for each message
		const messagesWithSender = await Promise.all(
			messages.map(async (message) => {
				const sender = await ctx.db.get(message.senderId)
				return {
					...message,
					sender
				}
			})
		)

		return messagesWithSender
	}
})

export const sendMessage = mutation({
	args: {
		threadId: v.id('threads'),
		senderId: v.id('users'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		// Insert the message
		await ctx.db.insert('messages', {
			threadId: args.threadId,
			senderId: args.senderId,
			content: args.content
		})

		// Update thread's last message info
		await ctx.db.patch(args.threadId, {
			lastMessageTime: Date.now(),
			lastMessagePreview: args.content
		})
	}
})

export const createThread = mutation({
	args: {
		participantIds: v.array(v.id('users')),
		initialMessage: v.string(),
		senderId: v.id('users')
	},
	handler: async (ctx, args) => {
		// Create the thread
		const threadId = await ctx.db.insert('threads', {
			participants: args.participantIds,
			lastMessageTime: Date.now(),
			lastMessagePreview: args.initialMessage
		})

		// Add the first message
		await ctx.db.insert('messages', {
			threadId,
			senderId: args.senderId,
			content: args.initialMessage
		})

		return threadId
	}
})
