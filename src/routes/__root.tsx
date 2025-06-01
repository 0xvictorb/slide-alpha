import {
	SuiClientProvider,
	WalletProvider,
	createNetworkConfig
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import NiceModal from '@ebay/nice-modal-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useCurrentAccountAddress from '@/hooks/use-current-account-address'
import useWalletAccountList from '@/hooks/use-wallet-account-list'
import { RootLayout } from '@/components/layout/root-layout'
import { useTokens } from '@/hooks/use-tokens'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1
		}
	}
})

const { networkConfig } = createNetworkConfig({
	localnet: { url: getFullnodeUrl('localnet') },
	devnet: { url: getFullnodeUrl('devnet') },
	testnet: { url: getFullnodeUrl('testnet') },
	mainnet: { url: getFullnodeUrl('mainnet') }
})

const GlobalHooks = () => {
	useCurrentAccountAddress()
	useWalletAccountList()
	useTokens()

	return null
}

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider
				networks={networkConfig}
				defaultNetwork={import.meta.env.VITE_NETWORK || 'devnet'}>
				<WalletProvider
					autoConnect
					slushWallet={{
						name: 'Sui Starter Kit'
					}}>
					<NiceModal.Provider>
						<RootLayout>
							<Outlet />
						</RootLayout>
						<GlobalHooks />
						<Toaster />
					</NiceModal.Provider>
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	)
})
