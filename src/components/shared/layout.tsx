import { Link } from '@tanstack/react-router'
import WalletButton from './wallet-button'
import { cn } from '@/lib/utils'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'

interface MenuItem {
	title: string
	description?: string
	to?: string
	items?: {
		title: string
		description: string
		to: string
	}[]
}

const menuItems: MenuItem[] = [
	{
		title: 'Tasks',
		description: 'Manage and track your tasks efficiently',
		to: '/'
	}
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-6">
						<Link
							to="/"
							className={cn(
								'flex items-center space-x-2 font-bold',
								'[&.active]:text-primary'
							)}>
							<img
								src="/logo.png"
								alt="Sui Starter Kit"
								className="h-6 w-auto"
							/>
						</Link>
						<NavigationMenu>
							<NavigationMenuList>
								{menuItems.map((item) => (
									<NavigationMenuItem key={item.title}>
										{item.items ? (
											<>
												<NavigationMenuTrigger className="h-9">
													{item.title}
												</NavigationMenuTrigger>
												<NavigationMenuContent>
													<div className="grid w-[400px] gap-3 p-4">
														<div className="flex flex-col gap-1">
															<p className="text-sm font-medium leading-none">
																{item.title}
															</p>
															<p className="text-sm text-muted-foreground">
																{item.description}
															</p>
														</div>
														<div className="grid gap-2">
															{item.items.map((subItem) => (
																<Link
																	key={subItem.title}
																	to={subItem.to}
																	className={cn(
																		'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
																		'[&.active]:bg-accent [&.active]:text-accent-foreground'
																	)}>
																	<div className="text-sm font-medium leading-none">
																		{subItem.title}
																	</div>
																	<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																		{subItem.description}
																	</p>
																</Link>
															))}
														</div>
													</div>
												</NavigationMenuContent>
											</>
										) : (
											<Link
												to={item.to}
												className={cn(
													'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
													'[&.active]:bg-accent [&.active]:text-accent-foreground'
												)}>
												{item.title}
											</Link>
										)}
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<div className="flex items-center gap-4">
						<Button variant="outline" asChild>
							<a
								href="https://docs.sui.io"
								target="_blank"
								rel="noopener noreferrer"
								className="hidden sm:inline-flex">
								Documentation
							</a>
						</Button>
						<WalletButton />
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
		</div>
	)
}
