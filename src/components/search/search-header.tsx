import { HugeiconsIcon } from '@hugeicons/react'
import {
	Search01Icon,
	ArrowLeft01Icon,
	Loading02Icon
} from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

interface SearchHeaderProps {
	searchQuery: string
	isSearching: boolean
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSubmit: (e: React.FormEvent) => void
}

export function SearchHeader({
	searchQuery,
	isSearching,
	onInputChange,
	onSubmit
}: SearchHeaderProps) {
	const navigate = useNavigate()

	return (
		<div className="sticky top-0 z-50 bg-white/95 border-b-2 border-border">
			<div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: '/' })}
					className="size-8">
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						className="w-5 h-5 text-foreground"
					/>
				</Button>

				<form onSubmit={onSubmit} className="flex-1">
					<div className="relative">
						<HugeiconsIcon
							icon={Search01Icon}
							className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
						/>
						<Input
							type="text"
							placeholder="Search content or #hashtags..."
							value={searchQuery}
							onChange={onInputChange}
							className="pl-10 border-2 border-border bg-white text-foreground placeholder-muted-foreground focus:border-ring"
						/>
					</div>
				</form>

				{isSearching && (
					<HugeiconsIcon
						icon={Loading02Icon}
						className="w-5 h-5 text-muted-foreground animate-spin"
					/>
				)}
			</div>
		</div>
	)
}
