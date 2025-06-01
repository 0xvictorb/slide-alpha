import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/shared/optimized-image'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi
} from '@/components/ui/carousel'

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
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)
	const [count, setCount] = useState(0)
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

	useEffect(() => {
		if (!api) {
			return
		}

		setCount(api.scrollSnapList().length)
		setCurrent(api.selectedScrollSnap() + 1)

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap() + 1)
		})
	}, [api])

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
			<Carousel
				setApi={setApi}
				className="w-full h-full flex items-center justify-center"
				opts={{
					align: 'start',
					loop: true
				}}>
				<CarouselContent className="h-full w-full -ml-1">
					{images.map((image, index) => (
						<CarouselItem key={index} className="h-full">
							<div className="h-full flex items-center justify-center">
								<OptimizedImage
									src={image.url}
									alt={image.alt || `Image ${index + 1}`}
									className="w-full h-full object-contain"
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Navigation Buttons - Only show if there are multiple images */}
				{images.length > 1 && (
					<>
						<CarouselPrevious className="left-2 bg-black/50 border-none text-white hover:bg-black/70" />
						<CarouselNext className="right-2 bg-black/50 border-none text-white hover:bg-black/70" />

						{/* Image Counter */}
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
							{current} / {count}
						</div>
					</>
				)}
			</Carousel>
		</div>
	)
}
