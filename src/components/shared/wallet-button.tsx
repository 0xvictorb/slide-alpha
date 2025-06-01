import { useEffect, useState } from 'react'
import {
	ConnectModal,
	useCurrentAccount,
	useDisconnectWallet,
	useSwitchAccount,
	useSignPersonalMessage
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { LogOut, User, Wallet } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAtomValue } from 'jotai'
import { walletAccountListAtom } from '@/atoms/account.atom'
import { toast } from 'sonner'

const NONCE_MESSAGE = 'Sign in to Swipe Fun'

interface WalletButtonProps {
	needSignIn?: boolean
}

const WalletButton = ({ needSignIn = true }: WalletButtonProps) => {
	const currentAccount = useCurrentAccount()
	const { mutate: disconnect } = useDisconnectWallet()
	const { mutate: switchAccount } = useSwitchAccount()
	const { mutate: signMessage } = useSignPersonalMessage()
	const [open, setOpen] = useState(false)
	const accounts = useAtomValue(walletAccountListAtom)
	const connectWalletMutation = useMutation(api.users.connectWallet)

	// Handle wallet connection
	useEffect(() => {
		const handleWalletConnection = async () => {
			if (currentAccount?.address) {
				try {
					// Request signature
					if (needSignIn) {
						await signMessage({
							message: new TextEncoder().encode(NONCE_MESSAGE)
						})
					}

					// Connect wallet in our database
					const result = await connectWalletMutation({
						walletAddress: currentAccount.address,
						name: currentAccount.label || undefined
					})

					if (result.isNewUser) {
						toast.success('Welcome to Slide Alpha! 🎉')
					}
				} catch (error) {
					console.error('Failed to connect wallet:', error)
					toast.error('Failed to connect wallet. Please try again.')
				}
			}
		}

		handleWalletConnection()
	}, [
		currentAccount?.address,
		currentAccount?.label,
		connectWalletMutation,
		signMessage,
		needSignIn
	])

	if (currentAccount) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="flex items-center gap-2">
						<Wallet className="w-4 h-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{accounts.map((account) => (
						<DropdownMenuItem
							key={account.address}
							onClick={() => {
								switchAccount({ account })
							}}
							className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<User className="w-4 h-4" />
								<span>
									{account.suiNSName || formatAddress(account.address || '')}
								</span>
							</div>
							{account.address === currentAccount.address && (
								<span className="text-xs text-muted-foreground">Active</span>
							)}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => {
							disconnect()
							toast.success('Wallet disconnected')
						}}>
						<LogOut className="w-4 h-4 mr-2" />
						Disconnect
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}

	return (
		<ConnectModal
			trigger={
				<Button variant="default" className="text-xs">
					Connect Wallet
				</Button>
			}
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
		/>
	)
}

export default WalletButton
