import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

export function ProfileSkeleton() {
	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="sticky top-0 z-50 bg-white/95 border-b-2 border-border">
				<div className="flex items-center justify-between px-4 py-3">
					<Button variant="ghost" size="icon" className="size-8">
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							size={20}
							className="text-foreground"
						/>
					</Button>
					<Skeleton className="h-6 w-24" />
					<div className="w-10" />
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="max-w-2xl max-h-[calc(100vh-140px)] space-y-6">
					<div className="space-y-6">
						{/* Profile Banner Card */}
						<Card className="overflow-hidden border-2 border-dashed border-blue-300">
							{/* Banner Background */}
							<div className="relative h-48 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600">
								<div className="absolute inset-0 bg-black/20" />
								{/* Background Pattern */}
								<div className="absolute inset-0 opacity-30">
									<div
										className="w-full h-full"
										style={{
											backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
											backgroundSize: '40px 40px'
										}}
									/>
								</div>
							</div>

							{/* Profile Content */}
							<CardContent className="relative -mt-16 px-6 pb-6">
								{/* Avatar */}
								<div className="flex justify-center mb-4">
									<Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
								</div>

								{/* Username and Basic Info */}
								<div className="text-center mb-6">
									{/* Name */}
									<div className="flex items-center justify-center gap-2 mb-2">
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>

									{/* Join Date */}
									<Skeleton className="h-4 w-40 mx-auto mb-4" />

									{/* Stats */}
									<div className="flex justify-center gap-8 mb-6">
										<div className="text-center">
											<Skeleton className="h-8 w-8 mx-auto mb-1" />
											<Skeleton className="h-3 w-16" />
										</div>
										<div className="text-center">
											<Skeleton className="h-8 w-8 mx-auto mb-1" />
											<Skeleton className="h-3 w-16" />
										</div>
									</div>

									{/* Bio */}
									<div className="text-center">
										<Skeleton className="h-16 w-full max-w-md mx-auto" />
									</div>

									{/* Wallet Address */}
									<div className="mt-4 text-center">
										<Skeleton className="h-6 w-32 mx-auto rounded-full" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Created Videos Section */}
						<div className="px-6">
							<Card>
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Skeleton className="h-32 w-full rounded-lg" />
										<Skeleton className="h-32 w-full rounded-lg" />
										<Skeleton className="h-32 w-full rounded-lg" />
										<Skeleton className="h-32 w-full rounded-lg" />
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	)
}
