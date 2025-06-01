import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SPLASH_STORAGE_KEY = 'slide-alpha-splash-completed'

interface SplashScreenProps {
	onComplete: () => void
	className?: string
	contentLoaded?: boolean // New prop to indicate when content is loaded
}

export function SplashScreen({
	onComplete,
	className,
	contentLoaded = false
}: SplashScreenProps) {
	const [loadingProgress, setLoadingProgress] = useState(0)
	const [showExploreButton, setShowExploreButton] = useState(false)
	const [isLaunching, setIsLaunching] = useState(false)

	// Simulate loading progress and wait for content
	useEffect(() => {
		if (contentLoaded) {
			// Content is loaded, complete the progress quickly
			const timer = setInterval(() => {
				setLoadingProgress((prev) => {
					if (prev >= 100) {
						clearInterval(timer)
						setTimeout(() => setShowExploreButton(true), 300)
						return 100
					}
					return prev + 10
				})
			}, 50)
			return () => clearInterval(timer)
		} else {
			// Content not loaded yet, progress slowly until 80%
			const timer = setInterval(() => {
				setLoadingProgress((prev) => {
					if (prev >= 80) {
						clearInterval(timer)
						return 80
					}
					return prev + 2
				})
			}, 100)
			return () => clearInterval(timer)
		}
	}, [contentLoaded])

	const handleExplore = async () => {
		setIsLaunching(true)

		// Store that user has completed splash
		localStorage.setItem(SPLASH_STORAGE_KEY, 'true')

		// Small delay for better UX
		setTimeout(() => {
			onComplete()
		}, 800)
	}

	return (
		<div
			className={cn(
				'fixed inset-0 bg-gradient-to-br from-main via-background to-main z-[100]',
				'flex items-center justify-center p-4',
				className
			)}>
			{/* Animated background */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-main/20 via-background/40 to-main/20 animate-pulse"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 text-center max-w-lg mx-auto">
				{/* Logo */}
				<div className="mb-16">
					<div className="flex items-center justify-center mb-8">
						<img src="/logo.webp" alt="Swipe Fun" className="w-80 h-auto" />
					</div>
				</div>

				{/* Loading Section */}
				{!showExploreButton ? (
					<div className="mb-12">
						{/* Loading Bar */}
						<div className="w-full bg-foreground/20 rounded-full h-3 mb-2 overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-main to-main-foreground rounded-full transition-all duration-300 ease-out"
								style={{ width: `${loadingProgress}%` }}
							/>
						</div>

						<p className="text-main-foreground text-sm">Loading...</p>
					</div>
				) : (
					<div className="mb-12 opacity-0 translate-y-2 animate-[fadeIn_0.5s_ease-out_forwards]">
						{/* Explore Button */}
						<Button onClick={handleExplore} disabled={isLaunching} size="lg">
							<span>Start Exploring</span>
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}

/**
 * Check if user has completed splash screen
 */
export const hasCompletedSplash = () => {
	return localStorage.getItem(SPLASH_STORAGE_KEY)?.toString() === 'true'
}

/**
 * Reset splash screen state - useful for testing
 */
export const resetSplash = () => {
	localStorage.removeItem(SPLASH_STORAGE_KEY)
}
