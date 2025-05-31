import { SuiClient, type SuiTransactionBlockResponse } from '@mysten/sui/client'

export class SuiTransactionError extends Error {
	constructor(
		message: string,
		public readonly digest?: string,
		public readonly effects?: any,
		public readonly isCancelled: boolean = false
	) {
		super(message)
		this.name = 'SuiTransactionError'
	}
}

export const handleSuiError = (error: unknown) => {
	if (error instanceof SuiTransactionError) {
		return error
	}

	if (error instanceof Error) {
		if (error.message.includes('User rejected the request')) {
			return new SuiTransactionError(
				'Transaction cancelled by user',
				undefined,
				undefined,
				true
			)
		}
		return new SuiTransactionError(error.message)
	}

	return new SuiTransactionError('Unknown error occurred')
}

export const executeSuiTransaction = async ({
	client,
	signature,
	bytes
}: {
	client: SuiClient
	signature: string | string[]
	bytes: string
}): Promise<SuiTransactionBlockResponse> => {
	const { digest } = await client.executeTransactionBlock({
		signature,
		transactionBlock: bytes,
		requestType: 'WaitForEffectsCert'
	})

	const response = await client.waitForTransaction({
		digest,
		options: {
			showEffects: true,
			showObjectChanges: true
		}
	})

	if (response.effects?.status.status !== 'success') {
		throw new SuiTransactionError(
			response.effects?.status.error || 'Transaction failed',
			digest,
			response.effects
		)
	}

	return response
}

interface PaginatedObjectsParams {
	client: SuiClient
	address: string
	filter?: (obj: any) => boolean
}

export async function getPaginatedObjects({
	client,
	address,
	filter = () => true
}: PaginatedObjectsParams) {
	let objects: any[] = []
	let hasNextPage = true
	let nextCursor: string | null | undefined = null

	try {
		while (hasNextPage) {
			const res = await client.getOwnedObjects({
				owner: address,
				cursor: nextCursor,
				options: {
					showContent: true,
					showType: true
				}
			})
			hasNextPage = res.hasNextPage
			nextCursor = res.nextCursor
			objects.push(...res.data)
		}

		return objects.filter(filter)
	} catch (error) {
		console.error('Error fetching paginated objects:', error)
		throw new Error('Failed to fetch objects')
	}
}

export async function getCoinMetadata(client: SuiClient, coinType: string) {
	try {
		const metadata = await client.getCoinMetadata({ coinType })
		return metadata
	} catch (error) {
		console.warn(`Failed to fetch metadata for ${coinType}:`, error)
		return null
	}
}
