import { Link } from '@tanstack/react-router'
import WalletButton from './wallet-button'
import { cn } from '@/lib/utils'

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
					</div>
					<div className="flex items-center gap-4">
						<WalletButton />
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
		</div>
	)
}
