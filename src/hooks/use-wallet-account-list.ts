import { walletAccountListAtom } from '@/atoms/account.atom'
import { useAccounts, useSuiClientQueries } from '@mysten/dapp-kit'
import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

const useWalletAccountList = () => {
	const accounts = useAccounts()
	const setWalletAccountList = useSetAtom(walletAccountListAtom)

	const results = useSuiClientQueries({
		queries: accounts.map((account) => ({
			method: 'resolveNameServiceNames',
			params: {
				address: account.address
			},
			options: {
				enabled: !!account.address
			}
		}))
	})

	const suiNSNames = useMemo(() => {
		return results.map((result) => result.data?.data?.[0] ?? '')
	}, [results])

	useEffect(() => {
		setWalletAccountList(
			accounts.map((account, index) => ({
				address: account.address,
				publicKey: account.publicKey,
				chains: account.chains,
				features: account.features,
				label: account.label,
				icon: account.icon,
				suiNSName: suiNSNames[index] || ''
			}))
		)
	}, [accounts, suiNSNames, setWalletAccountList])
}

export default useWalletAccountList
