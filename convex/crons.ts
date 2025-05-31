import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Fetch tokens every 5 minutes
crons.interval('fetch-tokens', { minutes: 5 }, internal.tokens.fetchTokens, {})

export default crons
