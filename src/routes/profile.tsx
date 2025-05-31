import { createFileRoute } from '@tanstack/react-router'
import { WalletGuard } from '@/components/guards/wallet-guard'

export const Route = createFileRoute('/profile')({
	component: ProfilePage
})

function ProfilePage() {
	return (
		<WalletGuard>
			<div className="container max-w-2xl p-4 space-y-8">
				<div>
					<h1 className="text-2xl font-bold">Profile</h1>
					<p className="text-muted-foreground">
						Manage your profile and content
					</p>
				</div>
				{/* TODO: Implement profile content */}
			</div>
		</WalletGuard>
	)
}
