import { createFileRoute, useParams } from '@tanstack/react-router'
import { WalletGuard } from '@/components/guards/wallet-guard'
import { UserContentFeed } from '@/components/profile/user-content-feed'

export const Route = createFileRoute('/profile/$address/content/$contentId')({
	component: UserContentFeedPage
})

function UserContentFeedPage() {
	const { address, contentId } = useParams({ from: Route.id })

	return (
		<WalletGuard>
			<UserContentFeed profileAddress={address} startContentId={contentId} />
		</WalletGuard>
	)
}
