import { SuiTransactionError } from '@/lib/sui'
import { buildTx, getQuote, setSuiClient } from '@7kprotocol/sdk-ts'
import { useSuiClient } from '@mysten/dapp-kit'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSuiBase } from './use-sui-base'

interface GetQuoteParams {
	tokenIn: string
	tokenOut: string
	amountIn: string
}

interface SwapParams extends GetQuoteParams {
	slippage: number
	kolAddress: string
}

export const use7kSwap = () => {
	const client = useSuiClient()
	const { account, executeTransaction } = useSuiBase()

	return useMutation({
		mutationFn: async ({
			amountIn,
			slippage,
			tokenIn,
			tokenOut,
			kolAddress
		}: SwapParams) => {
			if (!client || !account) {
				throw new SuiTransactionError('No account connected')
			}

			try {
				setSuiClient(client)
				const quoteResponse = await getQuote({
					tokenIn,
					tokenOut,
					amountIn
				})

				const results = await buildTx({
					slippage,
					quoteResponse,
					accountAddress: account.address,
					commission: {
						partner: kolAddress,
						commissionBps: 5
					}
				})

				if (!results?.tx) {
					throw new SuiTransactionError('Failed to build transaction')
				}

				return executeTransaction(results.tx)
			} catch (error) {
				console.error('Error swapping with 7k', error)

				throw error instanceof SuiTransactionError
					? error
					: new SuiTransactionError('Failed to swap with 7k')
			}
		}
	})
}

export const useGet7kExpectedAmount = ({
	amountIn,
	tokenIn,
	tokenOut
}: GetQuoteParams) => {
	const client = useSuiClient()
	const { account } = useSuiBase()

	return useQuery({
		queryKey: ['useGet7kExpectedAmount', tokenIn, tokenOut, amountIn],
		staleTime: 5 * 1000,
		refetchInterval: 6 * 1000,
		enabled: !!Number(amountIn) && !!tokenIn && !!tokenOut,
		queryFn: async () => {
			if (!client || !account) {
				throw new SuiTransactionError('No account connected')
			}

			try {
				setSuiClient(client)

				const quoteResponse = await getQuote({
					tokenIn,
					tokenOut,
					amountIn
				})

				return {
					decimal: quoteResponse.returnAmountWithDecimal,
					formatted: quoteResponse.returnAmount
				}
			} catch (error) {
				console.error('Error get 7k expected amount', error)

				throw error instanceof SuiTransactionError
					? error
					: new SuiTransactionError('Failed to get 7k expected amount')
			}
		}
	})
}
