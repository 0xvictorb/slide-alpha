import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect } from 'react'
import { WalletGuard } from '@/components/guards/wallet-guard'

export const Route = createFileRoute('/profile')({
	component: ProfilePage
})

function ProfilePage() {
	const navigate = useNavigate()
	const currentAccount = useCurrentAccount()

	// Redirect to user's profile when wallet connects
	useEffect(() => {
		if (currentAccount?.address) {
			navigate({
				to: '/profile/$address',
				params: { address: currentAccount.address },
				replace: true
			})
		}
	}, [currentAccount?.address, navigate])

	return (
		<WalletGuard>
			{/* This will never render because the useEffect above will redirect before wallet guard allows children */}
			<div />
		</WalletGuard>
	)
}
