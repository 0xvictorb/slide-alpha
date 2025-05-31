import { createFileRoute } from '@tanstack/react-router'
import { VideoFeed } from '@/components/feed/video-feed'

export const Route = createFileRoute('/')({
	component: Index
})

function Index() {
	return (
		<div className="container mx-auto max-w-6xl p-6">
			<div className="space-y-6">
				<VideoFeed />
			</div>
		</div>
	)
}
