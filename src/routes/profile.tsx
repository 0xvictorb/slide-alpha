import { createFileRoute } from '@tanstack/react-router'
import { WalletGuard } from '@/components/guards/wallet-guard'
import { ProfileContent } from '@/components/profile'

export const Route = createFileRoute('/profile')({
	component: ProfilePage
})

function ProfilePage() {
	return (
		<WalletGuard>
			<ProfileContent />
		</WalletGuard>
	)
}
