import { Home, PlusSquare, User } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function BottomNav() {
	const location = useLocation()
	const currentPath = location.pathname

	const navItems = [
		{
			icon: Home,
			label: 'Home',
			href: '/',
			isActive: currentPath === '/'
		},
		{
			icon: PlusSquare,
			label: 'Create',
			href: '/create',
			isActive: currentPath === '/create'
		},
		{
			icon: User,
			label: 'Profile',
			href: '/profile',
			isActive: currentPath.startsWith('/profile')
		}
	]

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center h-20">
			<div className="w-full max-w-[500px] border-t bg-background">
				<nav className="flex items-center justify-around p-4">
					{navItems.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								'flex flex-col items-center gap-1',
								'text-muted-foreground transition-colors hover:text-primary',
								item.isActive && 'text-primary'
							)}>
							<item.icon className="h-6 w-6" />
							<span className="text-xs">{item.label}</span>
						</Link>
					))}
				</nav>
			</div>
		</div>
	)
}
