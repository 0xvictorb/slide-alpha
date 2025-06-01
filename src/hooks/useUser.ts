import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentAccount } from '@mysten/dapp-kit'

export function useUser() {
	const account = useCurrentAccount()
	const user = useQuery(api.users.getUserByWallet, {
		walletAddress: account?.address || ''
	})

	return {
		user,
		isLoading: user === undefined
	}
}
