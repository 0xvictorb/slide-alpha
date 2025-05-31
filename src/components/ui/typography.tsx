import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const typographyVariants = cva('text-foreground', {
	variants: {
		variant: {
			h1: 'text-4.5xl font-semibold leading-[3.5rem]',
			h2: 'text-4xl font-semibold leading-[3rem]',
			h3: 'text-[32px] font-semibold leading-[2.5rem]',
			h4: 'text-2xl font-semibold leading-[2rem]',
			h5: 'text-xl font-semibold leading-[1.75rem]',
			h6: 'text-lg font-semibold leading-[1.5rem]',
			body1: 'text-base leading-[1.5rem]',
			body2: 'text-sm leading-[1.25rem]',
			caption: 'text-xs leading-[1rem]',
			label: 'text-sm leading-[20px]',
			link: 'text-base font-semibold text-primary hover:underline'
		},
		weight: {
			light: 'font-light',
			normal: 'font-normal',
			medium: 'font-medium',
			semibold: 'font-semibold',
			bold: 'font-bold'
		}
	},
	defaultVariants: {
		variant: 'body1',
		weight: 'normal'
	}
})

export type TypographyVariantProps = VariantProps<typeof typographyVariants>

export type TypographyElementType = React.ElementType

export type TypographyProps<Element extends TypographyElementType = 'p'> =
	React.ComponentPropsWithoutRef<Element> &
		TypographyVariantProps & {
			as?: Element
			className?: string
		}

const getDefaultElement = (variant?: TypographyVariantProps['variant']) => {
	switch (variant) {
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			return variant
		case 'label':
			return 'label'
		case 'link':
			return 'a'
		default:
			return 'p'
	}
}

const Typography = <Element extends TypographyElementType = 'p'>({
	as,
	className,
	variant,
	weight,
	...props
}: TypographyProps<Element>) => {
	const Component = (as || getDefaultElement(variant)) as TypographyElementType

	return (
		<Component
			className={cn(typographyVariants({ variant, weight }), className)}
			{...props}
		/>
	)
}

Typography.displayName = 'Typography'

export { Typography, typographyVariants }
