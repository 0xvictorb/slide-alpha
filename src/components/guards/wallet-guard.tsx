import { useCurrentAccount } from '@mysten/dapp-kit'
import WalletButton from '../shared/wallet-button'

interface WalletGuardProps {
	children: React.ReactNode
}

export function WalletGuard({ children }: WalletGuardProps) {
	const account = useCurrentAccount()

	if (!account) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 text-center">
				<h2 className="text-xl font-bold mb-3">Connect Your Wallet</h2>
				<p className="text-neutral-500 font-normal mb-6">
					Please connect your wallet to access this page
				</p>

				<WalletButton />
			</div>
		)
	}

	return <>{children}</>
}
