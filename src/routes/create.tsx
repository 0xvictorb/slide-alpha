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
// import { PremiumContent } from '@/components/create/premium-content'
import { createContentSchema } from '@/lib/validations/create-content'
import { z } from 'zod'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

type FormData = z.infer<typeof createContentSchema>

export const Route = createFileRoute('/create')({
	component: CreatePage
})

function CreateHeader() {
	const navigate = useNavigate()

	return (
		<div className="sticky top-0 z-50 bg-white/95 border-b-2 border-border">
			<div className="flex items-center justify-between px-4 py-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: '/' })}
					className="size-8">
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						size={20}
						className="text-foreground"
					/>
				</Button>
				<h1 className="text-lg font-semibold text-foreground">Create</h1>
				<div className="w-10" /> {/* Spacer for center alignment */}
			</div>
		</div>
	)
}

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

	// const followerCount = 150 // TODO: Get actual follower count

	return (
		<WalletGuard>
			<div className="flex flex-col h-full">
				<CreateHeader />
				<ScrollArea className="flex-1">
					<div className="max-w-2xl max-h-[calc(100vh-140px)] space-y-8">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit, (errors) => {
									console.log(errors)
								})}
								className="space-y-6 py-4 px-6">
								<MediaUpload form={form} />
								<ContentInfo form={form} />
								<Separator />
								<TokenPromotion form={form} />
								{/* <Separator />
								<PremiumContent form={form} followerCount={followerCount} /> */}
								<div className="pb-2">
									<Button type="submit" className="w-full">
										Create Content
									</Button>
								</div>
							</form>
						</Form>
					</div>
				</ScrollArea>
			</div>
		</WalletGuard>
	)
}
