import { BottomNav } from '../shared/bottom-nav'
import { Card } from '../ui/card'
import { motion } from 'framer-motion'

interface RootLayoutProps {
	children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
	return (
		<div className="w-full h-screen max-h-screen overflow-hidden flex justify-center relative">
			{/* Animated gradient background */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-br from-main via-background to-main"
				animate={{
					backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
				style={{
					backgroundSize: '200% 200%'
				}}
			/>

			<main className="w-full max-w-[500px] h-screen max-h-screen relative z-10">
				<Card className="p-0 pb-20 rounded-none">{children}</Card>
				<BottomNav />
			</main>
		</div>
	)
}
