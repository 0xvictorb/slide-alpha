import { createFileRoute, useParams } from '@tanstack/react-router'
import { WalletGuard } from '@/components/guards/wallet-guard'
import { ProfileContent } from '@/components/profile'

export const Route = createFileRoute('/profile/$address')({
	component: ProfilePage
})

function ProfilePage() {
	const { address } = useParams({ from: Route.id })

	return (
		<WalletGuard>
			<ProfileContent profileAddress={address} />
		</WalletGuard>
	)
}
