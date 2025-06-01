import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unfonts from 'unplugin-fonts/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
		tailwindcss(),
		react(),
		nodePolyfills({
			include: ['buffer', 'stream', 'util', 'process'],
			globals: {
				Buffer: true,
				global: true,
				process: true
			}
		}),
		tsconfigPaths(),
		Unfonts({
			google: {
				families: ['Inter:wght@400;500;600;700']
			}
		}),
		svgr()
	],
	envDir: 'env'
})
