import { createFileRoute } from '@tanstack/react-router'
import { FileUploader } from '@/components/shared/file-uploader'
import { VideoFeed } from '@/components/feed/video-feed'

export const Route = createFileRoute('/')({
	component: Index
})

function Index() {
	return (
		<div className="container mx-auto max-w-6xl p-6">
			<div className="space-y-6">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
					<p className="text-sm text-muted-foreground">
						Manage and track your tasks efficiently
					</p>
				</div>

				<FileUploader />
				<VideoFeed />
			</div>
		</div>
	)
}
