import { cn } from '@/lib/utils'

interface OptimizedImageProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string
	width?: number
	height?: number
	quality?: number
	format?: 'jpg' | 'webp' | 'png' | 'auto'
	fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
	className?: string
	alt: string
}

/**
 * OptimizedImage component that uses wsrv.nl for image optimization and CDN delivery
 *
 * @param src - Source URL of the image
 * @param width - Desired width of the image
 * @param height - Desired height of the image
 * @param quality - Quality of the image (1-100)
 * @param format - Output format of the image (jpg, webp, png, or auto)
 * @param fit - How the image should fit within its dimensions
 * @param className - Additional CSS classes
 * @param alt - Alt text for the image
 */
export function OptimizedImage({
	src,
	width,
	height,
	quality = 80,
	format = 'auto',
	fit = 'cover',
	className,
	alt,
	...props
}: OptimizedImageProps) {
	// Construct the wsrv.nl URL with optimization parameters
	const optimizedUrl = new URL('https://wsrv.nl/')
	optimizedUrl.searchParams.set('url', src)

	if (width) {
		optimizedUrl.searchParams.set('w', width.toString())
	}

	if (height) {
		optimizedUrl.searchParams.set('h', height.toString())
	}

	optimizedUrl.searchParams.set('q', quality.toString())
	optimizedUrl.searchParams.set('output', format)
	optimizedUrl.searchParams.set('fit', fit)

	// Enable default optimization features
	optimizedUrl.searchParams.set('a', 'attention') // Use attention-based cropping
	optimizedUrl.searchParams.set('il', 'true') // Enable interlaced/progressive loading
	optimizedUrl.searchParams.set('af', 'true') // Enable auto format based on browser support

	return (
		<img
			src={optimizedUrl.toString()}
			width={width}
			height={height}
			className={cn('object-cover', className)}
			alt={alt}
			loading="lazy"
			{...props}
		/>
	)
}
