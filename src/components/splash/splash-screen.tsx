import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
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
				'fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-[100]',
				'flex items-center justify-center p-4',
				className
			)}>
			{/* Animated background */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 animate-pulse"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 text-center max-w-sm mx-auto">
				{/* Logo */}
				<div className="mb-12">
					<div className="flex items-center justify-center mb-6">
						<div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
							<Sparkles className="w-10 h-10 text-white" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">Slide Alpha</h1>
					<p className="text-white/70 text-lg">Loading your experience...</p>
				</div>

				{/* Loading Section */}
				{!showExploreButton ? (
					<div className="mb-8">
						{/* Loading Bar */}
						<div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 ease-out"
								style={{ width: `${loadingProgress}%` }}
							/>
						</div>

						{/* Loading Text */}
						<p className="text-white/60 text-sm">
							{loadingProgress < 30 && 'Initializing platform...'}
							{loadingProgress >= 30 &&
								loadingProgress < 60 &&
								'Loading content...'}
							{loadingProgress >= 60 &&
								loadingProgress < 80 &&
								'Preparing videos...'}
							{loadingProgress >= 80 &&
								loadingProgress < 100 &&
								'Almost ready...'}
							{loadingProgress === 100 && 'Ready to explore!'}
						</p>
					</div>
				) : (
					<div className="mb-8 opacity-0 translate-y-2 animate-[fadeIn_0.5s_ease-out_forwards]">
						{/* Success Animation */}
						<div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
							<div className="w-8 h-8 text-green-400">✓</div>
						</div>
						<p className="text-white/80 text-lg mb-6">Everything is ready!</p>

						{/* Explore Button */}
						<Button
							onClick={handleExplore}
							disabled={isLaunching}
							size="lg"
							className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 border-0">
							{isLaunching ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
									<span>Launching...</span>
								</div>
							) : (
								<span>Explore Slide Alpha</span>
							)}
						</Button>
					</div>
				)}

				{/* Footer */}
				<p className="text-white/40 text-xs">
					Swipe up and down to navigate • Connect wallet to trade
				</p>
			</div>
		</div>
	)
}

/**
 * Check if user has completed splash screen
 */
export const hasCompletedSplash = () => {
	return localStorage.getItem(SPLASH_STORAGE_KEY) === 'true'
}

/**
 * Reset splash screen state - useful for testing
 */
export const resetSplash = () => {
	localStorage.removeItem(SPLASH_STORAGE_KEY)
}
