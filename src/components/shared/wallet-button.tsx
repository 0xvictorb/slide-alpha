import { useCallback, useEffect, useState } from 'react'
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
const SIGNED_ADDRESSES_KEY = 'signed_wallet_addresses'

const WalletButton = () => {
	const currentAccount = useCurrentAccount()
	const { mutate: disconnect } = useDisconnectWallet()
	const { mutate: switchAccount } = useSwitchAccount()
	const { mutate: signMessage } = useSignPersonalMessage()
	const [open, setOpen] = useState(false)
	const accounts = useAtomValue(walletAccountListAtom)
	const connectWalletMutation = useMutation(api.users.connectWallet)

	// Get signed addresses from localStorage
	const getSignedAddresses = useCallback((): string[] => {
		const stored = localStorage.getItem(SIGNED_ADDRESSES_KEY)
		return stored ? JSON.parse(stored) : []
	}, [])

	// Add address to signed addresses
	const addSignedAddress = useCallback(
		(address: string) => {
			const addresses = getSignedAddresses()
			if (!addresses.includes(address)) {
				addresses.push(address)
				localStorage.setItem(SIGNED_ADDRESSES_KEY, JSON.stringify(addresses))
			}
		},
		[getSignedAddresses]
	)

	// Check if address has already signed
	const hasAddressSigned = useCallback(
		(address: string): boolean => {
			return getSignedAddresses().includes(address)
		},
		[getSignedAddresses]
	)

	// Handle wallet connection
	useEffect(() => {
		const handleWalletConnection = async () => {
			if (currentAccount?.address) {
				try {
					// Check if this address has already signed
					if (!hasAddressSigned(currentAccount.address)) {
						// Request signature
						await signMessage({
							message: new TextEncoder().encode(NONCE_MESSAGE)
						})
						// Store the signed address
						addSignedAddress(currentAccount.address)
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
		hasAddressSigned,
		addSignedAddress
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
