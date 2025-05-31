import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
	images: Array<{
		url: string
		alt?: string
	}>
	className?: string
	onView?: () => void
}

export function ImageCarousel({
	images,
	className,
	onView
}: ImageCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [hasViewed, setHasViewed] = useState(false)

	// Use intersection observer to detect when carousel is in view
	const { ref: carouselRef, inView } = useInView({
		threshold: 0.7 // Trigger when 70% of the carousel is visible
	})

	// Track view when carousel comes into view
	useEffect(() => {
		if (inView && !hasViewed) {
			setHasViewed(true)
			onView?.()
		}
	}, [inView, hasViewed, onView])

	const nextImage = () => {
		setCurrentIndex((prev) => (prev + 1) % images.length)
	}

	const previousImage = () => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
	}

	if (!images.length) {
		return null
	}

	return (
		<div
			ref={carouselRef}
			className={cn(
				'relative w-full h-full flex items-center justify-center bg-black',
				className
			)}>
			<div className="relative w-full h-full max-w-[calc(100vh*9/16)] max-h-screen">
				{/* Current Image */}
				<img
					src={images[currentIndex].url}
					alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
					className="w-full h-full object-contain"
				/>

				{/* Navigation Buttons - Only show if there are multiple images */}
				{images.length > 1 && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
							onClick={previousImage}>
							<ChevronLeft className="w-6 h-6" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
							onClick={nextImage}>
							<ChevronRight className="w-6 h-6" />
						</Button>

						{/* Image Counter */}
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
							{currentIndex + 1} / {images.length}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
