import { currentAccountAddressAtom } from '@/atoms/account.atom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

const useCurrentAccountAddress = () => {
	const currentAccount = useCurrentAccount()
	const setCurrentAccountAddress = useSetAtom(currentAccountAddressAtom)

	useEffect(() => {
		const accountAddress = currentAccount?.address ?? ''
		setCurrentAccountAddress(accountAddress)
	}, [currentAccount, setCurrentAccountAddress])
}

export default useCurrentAccountAddress
