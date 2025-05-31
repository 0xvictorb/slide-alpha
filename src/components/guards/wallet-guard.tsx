import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'

interface WalletGuardProps {
	children: React.ReactNode
}

export function WalletGuard({ children }: WalletGuardProps) {
	const account = useCurrentAccount()

	if (!account) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
				<h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
				<p className="text-muted-foreground mb-8">
					Please connect your wallet to access this page
				</p>
				<ConnectButton />
			</div>
		)
	}

	return <>{children}</>
}
