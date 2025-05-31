import { noop } from 'es-toolkit'
import * as React from 'react'
import { NumberFormatBase, useNumericFormat } from 'react-number-format'
import type {
	InputAttributes,
	NumericFormatProps
} from 'react-number-format/types/types'

import { cn } from '@/lib/utils'

interface Props extends Omit<NumericFormatProps, 'onChange'> {
	/**
	 * Triggered only when the input value changes.
	 * @param e - The change event of the input element.
	 * @example
	 * <NumericInput onInputChange={(e) => console.log(e.target.value)} />
	 */
	onInputChange?: React.ChangeEventHandler<HTMLInputElement>
	/**
	 * Triggered every time the value changes, including programmatic changes (e.g. setValue).
	 * @param value - The new value of the input.
	 * @example
	 * <NumericInput onChange={(value) => console.log(value)} />
	 */
	onChange?: (value: string) => void
	/**
	 * Indicates if there is an error.
	 * @example
	 * <NumericInput isError={true} />
	 */
	isError?: boolean
	/**
	 * Indicates whether to keep format prefix/suffix when the value is undefined.
	 * @default false;
	 * @example
	 * <NumericInput keepFormat={true} />
	 */
	keepFormat?: boolean
}

const NumericFormatInput = <BaseType extends any = InputAttributes>(
	props: NumericFormatProps<BaseType>
) => {
	const numericFormatProps = useNumericFormat(props)

	return (
		<NumberFormatBase
			{...numericFormatProps}
			format={(numStr) => {
				let formattedValue = numStr

				// @ts-ignore due to invalid type reference, fix later
				const isKeepFormat = props.keepFormat

				if (
					isKeepFormat &&
					(numStr === '' || numStr === '-') &&
					(props.suffix !== undefined || props.prefix !== undefined)
				) {
					formattedValue = `${props.prefix ?? ''}${numStr}${props.suffix ?? ''}`
				} else if (numericFormatProps.format) {
					formattedValue = numericFormatProps.format(numStr)
				}
				return formattedValue
			}}
		/>
	)
}

export const NumericInput = React.forwardRef<HTMLInputElement, Props>(
	(
		{ onInputChange, onChange, decimalScale, isError, className, ...props },
		ref
	) => {
		return (
			<>
				<NumericFormatInput
					placeholder="0"
					thousandSeparator
					decimalScale={decimalScale}
					allowNegative={false}
					className={cn(
						'rounded-none bg-transparent font-medium text-[30px] text-white/90 placeholder:text-white/60',
						'focus-visible:!shadow-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-transparent',
						'w-full',
						'truncate',
						className,
						isError && 'text-pink-100'
					)}
					{...props}
					onChange={onInputChange ?? noop}
					onValueChange={(values) => onChange?.(values.value)}
				/>
				{/* Fix warning about ref not being forwarded */}
				<div ref={ref} className="hidden" />
			</>
		)
	}
)

NumericInput.displayName = 'NumericInput'
