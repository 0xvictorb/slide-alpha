import { createFileRoute } from '@tanstack/react-router'
import { ContentFeed } from '@/components/feed/content-feed'

export const Route = createFileRoute('/')({
	component: Index
})

function Index() {
	return <ContentFeed />
}
