import BigNumber from 'bignumber.js'

const ten = new BigNumber(10)
const DEFAULT_DECIMALS = 9

export function fromDecimals(
	num: number | string,
	decimals: number | string = DEFAULT_DECIMALS
) {
	return BigNumber(num).div(ten.pow(decimals)).toFixed()
}

export const removeLeadingZeros = (
	value: string | number | bigint | BigNumber
) => {
	const strValue = value.toString()
	if (strValue === '0.') {
		return '0.'
	}
	let res = strValue.replace(/^0+(?=\d)/, '').replace(/^0+(\.)/, '0$1')
	if (strValue.endsWith('.')) {
		res += '.'
	}

	if (res === '') {
		res = '0'
	}
	if (res === '.') {
		res = '0.'
	}
	return res
}

export const removeTrailingZeros = (
	value: string | number | bigint | BigNumber
) => {
	const strValue = value.toString()
	if (strValue.includes('.')) {
		if (strValue.endsWith('.')) {
			return strValue.replace(/(\.\d*?[1-9])?0+$/, '$1')
		}
		return strValue.replace(/(\.\d*?[1-9])?0+$/, '$1').replace(/\.$/, '')
	}
	return strValue
}

export interface FormatNumberOptions {
	decimals?: number | string
	prefix?: string
	suffix?: string
	trailingZeros?: boolean
	roundingMode?: BigNumber.RoundingMode
}

export const formatNumber = (
	value: string | number | bigint | BigNumber,
	{
		decimals = DEFAULT_DECIMALS,
		prefix = '',
		suffix = '',
		trailingZeros = true,
		roundingMode
	}: FormatNumberOptions = {}
) => {
	if (value === null || value === undefined) return ''

	const bnValue =
		value instanceof BigNumber ? value : new BigNumber(value.toString())
	const numberDecimals =
		typeof decimals === 'string' ? Number(decimals) : decimals
	const dp = bnValue.dp()
	const formattedValue =
		dp && dp > numberDecimals
			? `${prefix}${bnValue.toFormat(numberDecimals, roundingMode)}${suffix}`
			: `${prefix}${bnValue.toFormat()}${suffix}`

	return trailingZeros ? removeTrailingZeros(formattedValue) : formattedValue
}

export function toDecimals(
	src: number | string | bigint | BigNumber,
	decimals: string | number = DEFAULT_DECIMALS
) {
	const strSrc = src.toString()
	return BigNumber(strSrc).multipliedBy(ten.pow(decimals)).toFixed(0)
}

export const tryParseNumber = (value: string) => {
	const cleanedValue = value.replace(/[^0-9.]/g, '')
	if (cleanedValue === '') {
		return 0
	}

	const parsedValue = Number.parseFloat(cleanedValue)
	return Number.isNaN(parsedValue) ? 0 : parsedValue
}

export const numberTransformer = (value: string, maxDecimal = 9) => {
	const cleanedValue = removeLeadingZeros(value.replace(/[^0-9.]/g, ''))
	const firstDotIndex = cleanedValue.indexOf('.')
	const validatedValue =
		firstDotIndex === -1
			? cleanedValue
			: cleanedValue.slice(0, firstDotIndex + 1) +
				cleanedValue.slice(firstDotIndex + 1).replace(/\./g, '')

	const parsedValue = Number.parseFloat(validatedValue)
	if (Number.isNaN(parsedValue)) {
		return ''
	}

	let formattedValue = formatNumber(validatedValue, { decimals: maxDecimal })

	const match = value.match(/\.(\d*)/)
	if (match) {
		formattedValue = `${formattedValue.split('.')[0]}.${match[1]}`
	} else if (value.endsWith('.')) {
		formattedValue += '.'
	}
	const splitFormattedValue = formattedValue.split('.')
	if (splitFormattedValue.length > 1) {
		const decimalPart = splitFormattedValue[1]
		const truncatedDecimalPart = decimalPart
			? decimalPart.slice(0, maxDecimal)
			: ''
		formattedValue = `${splitFormattedValue[0]}.${truncatedDecimalPart}`
	}

	return formattedValue
}

export function clampTransformedValue(
	value: string,
	lowerBound: string,
	upperBound: string,
	maxDecimal: number
) {
	const cleanedValue = removeLeadingZeros(value.replace(/[^0-9.]/g, ''))
	const firstDotIndex = cleanedValue.indexOf('.')
	const validatedValue =
		firstDotIndex === -1
			? cleanedValue
			: cleanedValue.slice(0, firstDotIndex + 1) +
				cleanedValue.slice(firstDotIndex + 1).replace(/\./g, '')

	const parsedValue = Number.parseFloat(validatedValue)
	if (parsedValue < Number.parseFloat(lowerBound)) {
		return numberTransformer(lowerBound, maxDecimal)
	}
	if (parsedValue > Number.parseFloat(upperBound)) {
		return numberTransformer(upperBound, maxDecimal)
	}
	return numberTransformer(validatedValue, maxDecimal)
}

export function toBigInt(value: number | string | bigint | BigNumber): bigint {
	try {
		return typeof value === 'bigint' ? value : BigInt(value.toString())
	} catch (error) {
		return BigInt(0)
	}
}

export function fromFemto(value: number | string | bigint | BigNumber) {
	return fromDecimals(value.toString(), 18)
}

export function toFemto(value: number | string | bigint | BigNumber) {
	return toDecimals(value.toString(), 18)
}

export function abbreviateNumber(
	value: number | BigNumber,
	decimals: number,
	minDecimals?: number
) {
	const bigNumber = value instanceof BigNumber ? value.toNumber() : value

	return Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: decimals,
		minimumFractionDigits: minDecimals ?? decimals
	}).format(bigNumber)
}

export function formatWithSubscript(number: string, decimals?: number) {
	// Special case for zero values
	if (Number(number) === 0) {
		return '0'
	}

	// Remove trailing zeros before processing
	const trimmedNumber = number.replace(/\.?0+$/, '')
	const scientificStr = trimmedNumber.toString()

	// If the number doesn't contain multiple zeros, return as is
	if (!scientificStr.includes('0'.repeat(3))) {
		return decimals !== undefined
			? new BigNumber(scientificStr).toFixed(decimals)
			: scientificStr
	}

	// Find consecutive zeros
	const matches = scientificStr.match(/0+/g)
	if (!matches) return scientificStr

	// Find the longest sequence of zeros
	const longestZeroSequence = matches.reduce((a, b) =>
		a.length > b.length ? a : b
	)

	// Only process if we have at least 3 zeros
	if (longestZeroSequence.length < 3) return scientificStr

	// Replace the zeros with subscript number
	const subscriptDigits: { [key: string]: string } = {
		'0': '₀',
		'1': '₁',
		'2': '₂',
		'3': '₃',
		'4': '₄',
		'5': '₅',
		'6': '₆',
		'7': '₇',
		'8': '₈',
		'9': '₉'
	}

	const zeroCount = longestZeroSequence.length
	const subscriptNum = zeroCount
		.toString()
		.split('')
		.map((digit) => subscriptDigits[digit])
		.join('')

	// Replace the longest sequence of zeros with the subscript
	const parts = scientificStr.split(longestZeroSequence)

	// Apply decimal places limit if specified
	if (decimals !== undefined) {
		parts[1] = parts[1]?.slice(0, decimals)
	}

	let result = `${parts[0]}0${subscriptNum}${parts[1] || ''}`

	return result
}
