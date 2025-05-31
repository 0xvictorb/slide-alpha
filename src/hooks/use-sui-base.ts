import {
	useCurrentAccount,
	useSignTransaction,
	useSuiClient
} from '@mysten/dapp-kit'
import { BluefinXTx } from '@7kprotocol/sdk-ts'
import { Transaction } from '@mysten/sui/transactions'
import {
	executeSuiTransaction,
	SuiTransactionError,
	handleSuiError
} from '@/lib/sui'

export const useSuiBase = () => {
	const client = useSuiClient()
	const account = useCurrentAccount()
	const { mutateAsync: signTransaction } = useSignTransaction()

	const executeTransaction = async (transaction: Transaction | BluefinXTx) => {
		if (!account?.chains[0]) {
			throw new SuiTransactionError('No account connected')
		}

		try {
			const { signature, bytes } = await signTransaction({
				transaction:
					transaction instanceof BluefinXTx ? transaction.txBytes : transaction
			})

			return executeSuiTransaction({
				client,
				signature,
				bytes
			})
		} catch (error) {
			throw handleSuiError(error)
		}
	}

	return {
		client,
		account,
		signTransaction,
		executeTransaction
	}
}
