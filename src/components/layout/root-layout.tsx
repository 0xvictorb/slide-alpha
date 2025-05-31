interface RootLayoutProps {
	children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
	return (
		<div className="w-full min-h-screen flex justify-center">
			<div className="w-full max-w-[500px] min-h-screen bg-background relative">
				{children}
			</div>
		</div>
	)
}
