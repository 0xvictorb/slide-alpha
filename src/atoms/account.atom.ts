import { atom } from 'jotai'
import type { WalletAccount } from '@mysten/wallet-standard'

export interface ExtendedWalletAccount extends WalletAccount {
	suiNSName: string
}

export const walletAccountListAtom = atom<ExtendedWalletAccount[]>([])
export const currentAccountAddressAtom = atom<string>('')
