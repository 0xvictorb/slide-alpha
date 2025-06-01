import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Card } from '../ui/card'
import {
	Home01Icon,
	PlusSignIcon,
	Search01Icon,
	BubbleChatIcon,
	User03Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '../ui/button'

export function BottomNav() {
	const location = useLocation()
	const currentPath = location.pathname

	const navItems = [
		{
			icon: Home01Icon,
			label: 'Home',
			href: '/',
			isActive: currentPath === '/'
		},
		{
			icon: Search01Icon,
			label: 'Search',
			href: '/search',
			isActive: currentPath === '/search'
		},
		{
			icon: PlusSignIcon,
			label: 'Create',
			href: '/create',
			isActive: currentPath === '/create',
			isSpecial: true
		},
		{
			icon: BubbleChatIcon,
			label: 'Chat',
			href: '/chat',
			isActive: currentPath === '/chat'
		},
		{
			icon: User03Icon,
			label: 'Profile',
			href: '/profile',
			isActive: currentPath.startsWith('/profile')
		}
	]

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center h-20">
			<Card className="w-full max-w-[500px] bg-white rounded-none p-0">
				<nav className="flex items-center justify-around p-4 gap-0 relative">
					{navItems.map((item) => {
						if (item.isSpecial) {
							return (
								<Link
									key={item.href}
									to={item.href}
									className={cn('flex flex-col items-center gap-1', '-mt-12')}>
									<Button variant="secondary" size="icon" className="size-12">
										<HugeiconsIcon
											icon={item.icon}
											size={24}
											className="text-white"
										/>
									</Button>
								</Link>
							)
						}

						return (
							<Link
								key={item.href}
								to={item.href}
								className={cn(
									'flex flex-col items-center gap-1',
									'text-muted-foreground transition-colors hover:text-foreground',
									item.isActive && 'text-secondary font-semibold'
								)}>
								<HugeiconsIcon
									icon={item.icon}
									size={24}
									className={cn(
										'transition-colors',
										item.isActive && 'text-secondary'
									)}
								/>
								<span className="text-xs text-inherit">{item.label}</span>
							</Link>
						)
					})}
				</nav>
			</Card>
		</div>
	)
}
