import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { RootLayout } from '@/components/layout/root-layout'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import 'unfonts.css'
import '@mysten/dapp-kit/dist/index.css'
import './index.css'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<ConvexProvider client={convex}>
				<RootLayout>
					<RouterProvider router={router} />
				</RootLayout>
			</ConvexProvider>
		</StrictMode>
	)
}
