import { useState } from 'react'
import {
	ConnectModal,
	useCurrentAccount,
	useDisconnectWallet,
	useSwitchAccount
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { LogOut, SwitchCamera, User, Wallet } from 'lucide-react'

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

const WalletButton = () => {
	const currentAccount = useCurrentAccount()
	const { mutate: disconnect } = useDisconnectWallet()
	const { mutate: switchAccount } = useSwitchAccount()
	const [open, setOpen] = useState(false)
	const accounts = useAtomValue(walletAccountListAtom)

	console.log(accounts)

	if (currentAccount) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex items-center gap-2">
						<Wallet className="w-4 h-4" />
						{currentAccount.label || formatAddress(currentAccount.address)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{accounts.map((account) => (
						<DropdownMenuItem
							key={account.address}
							onClick={() => switchAccount({ account })}
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
					<DropdownMenuItem onClick={() => disconnect()}>
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
					<SwitchCamera className="w-3 h-3" />
					Connect Wallet
				</Button>
			}
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
		/>
	)
}

export default WalletButton
