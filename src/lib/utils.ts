import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { joinURL } from 'ufo'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatImageUrl = (url?: string) => {
	if (!url) {
		return ''
	}

	if (!url.startsWith('https://')) {
		const cleanedUrl = url.replace('api/file-upload', '')
		const baseUrl = '/api/file-upload'

		return joinURL(import.meta.env.VITE_API_URL, baseUrl, cleanedUrl)
	}

	return url
}

export const padZero = (value: number, length: number) => {
	return value.toString().padStart(length, '0')
}

export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getExplorerUrl = (pathname: string) => {
	return joinURL('https://suiscan.xyz', pathname)
}
