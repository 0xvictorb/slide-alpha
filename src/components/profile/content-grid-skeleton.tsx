import { Skeleton } from '@/components/ui/skeleton'

export function ContentGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{[...Array(6)].map((_, i) => (
				<Skeleton key={i} className="aspect-[9/16] w-full" />
			))}
		</div>
	)
}
