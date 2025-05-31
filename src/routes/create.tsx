import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { WalletGuard } from '@/components/guards/wallet-guard'
import { MediaUpload } from '@/components/create/media-upload'
import { ContentInfo } from '@/components/create/content-info'
import { TokenPromotion } from '@/components/create/token-promotion'
import { PremiumContent } from '@/components/create/premium-content'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

type FormData = z.infer<typeof createContentSchema>

export const Route = createFileRoute('/create')({
	component: CreatePage
})

function CreatePage() {
	const account = useCurrentAccount()
	const navigate = useNavigate()
	const createContent = useMutation(api.content.createContent)

	const form = useForm<FormData>({
		resolver: zodResolver(createContentSchema),
		defaultValues: {
			// Media info
			contentType: 'video' as const,
			video: undefined,
			images: undefined,

			// Content info
			title: '',
			description: undefined,
			hashtags: [],

			// Status
			isPremium: false,

			// Token promotion
			isPromotingToken: false,
			promotedTokenId: undefined
		}
	})

	async function onSubmit(values: FormData) {
		if (!account?.address) {
			toast.error('Please connect your wallet first')
			return
		}

		try {
			// Validate that we have either video or images based on contentType
			if (values.contentType === 'video' && !values.video) {
				toast.error('Please upload a video')
				return
			}
			if (
				values.contentType === 'images' &&
				(!values.images || values.images.length === 0)
			) {
				toast.error('Please upload at least one image')
				return
			}

			await createContent({
				...values,
				authorWalletAddress: account.address,
				hashtags: values.hashtags || []
			})

			toast.success('Content created successfully')
			navigate({ to: '/' })
		} catch (error) {
			console.error('Error creating content:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to create content'
			)
		}
	}

	const followerCount = 150 // TODO: Get actual follower count

	return (
		<WalletGuard>
			<div className="container max-w-2xl p-4 space-y-8">
				<div>
					<h1 className="text-2xl font-bold">Create Content</h1>
					<p className="text-muted-foreground">
						Share your content with the community
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<MediaUpload form={form} />
						<ContentInfo form={form} />
						<Separator />
						<TokenPromotion form={form} />
						<Separator />
						<PremiumContent form={form} followerCount={followerCount} />
						<Button type="submit" className="w-full">
							Create Content
						</Button>
					</form>
				</Form>
			</div>
		</WalletGuard>
	)
}
