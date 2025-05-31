import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSkeleton() {
	return (
		<div className="container max-w-4xl p-4 space-y-8">
			<div>
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-4 w-64 mt-2" />
			</div>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-start gap-4">
						<Skeleton className="h-20 w-20 rounded-full" />
						<div className="flex-1 space-y-4">
							<div>
								<Skeleton className="h-4 w-24 mb-2" />
								<Skeleton className="h-8 w-full" />
							</div>
							<div>
								<Skeleton className="h-4 w-16 mb-2" />
								<Skeleton className="h-6 w-32" />
							</div>
							<div>
								<Skeleton className="h-4 w-20 mb-2" />
								<Skeleton className="h-16 w-full" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-20" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
