import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'peer flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
			'border border-primary',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
			className
		)}
		{...props}>
		<CheckboxPrimitive.Indicator className="text-primary-foreground">
			{props.checked ? (
				<CheckCircle2 className="h-4 w-4" />
			) : (
				<Circle className="h-4 w-4 text-primary" />
			)}
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
