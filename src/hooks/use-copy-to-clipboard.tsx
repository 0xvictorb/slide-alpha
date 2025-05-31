import { useState } from 'react'
import { toast } from 'sonner'

export interface useCopyToClipboardProps {
	timeout?: number
	showToast?: boolean
}

export function useCopyToClipboard({
	timeout = 2000,
	showToast = true
}: useCopyToClipboardProps = {}) {
	const [isCopied, setIsCopied] = useState<boolean>(false)

	const copyImageToClipboard = async (value: string) => {
		if (!value) {
			return
		}

		try {
			const res = await fetch(value)
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({
					[blob.type]: blob
				})
			])
			setIsCopied(true)
			if (showToast) toast.success('Image copied to clipboard')

			setTimeout(() => {
				setIsCopied(false)
			}, timeout)
		} catch (error) {
			if (showToast) toast.error('Failed to copy image to clipboard')
		}
	}

	const copyToClipboard = (value: string) => {
		if (!value) {
			return
		}

		navigator.clipboard.writeText(value).then(() => {
			setIsCopied(true)
			if (showToast) toast.success('Copied to clipboard')

			setTimeout(() => {
				setIsCopied(false)
			}, timeout)
		})
	}

	return { isCopied, copyToClipboard, copyImageToClipboard }
}
