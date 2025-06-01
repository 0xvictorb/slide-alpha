export const SUI_ADDRESS = '0x2::sui::SUI'
export const SUI_FULL_ADDRESS =
	'0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
export const USDC_ADDRESS =
	'0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

export const SC_PACKAGE_CONFIG = {
	_7kPackageId: import.meta.env.VITE_7K_PACKAGE_ID || '',
	_7kConfig: import.meta.env.VITE_7K_CONFIG || '',
	_7kVault: import.meta.env.VITE_7K_VAULT || '',
	_7kCommissionPartner: import.meta.env.VITE_7K_COMMISSION_PARTNER || '',
	_7kCommissionBps: import.meta.env.VITE_7K_COMMISSION_BPS || ''
}

export const VIDEO_PLATFORM_CONFIG = {
	PACKAGE_ID:
		'0xa8caa120c4b1811ee0aaeff40735203b83d96e39815b42f4465e6ca306761f26',
	PLATFORM_ID:
		'0x868aa132090a6aafc8058942ca604c149abb6bd415c018d84cdd9280f0dc4a14',
	PLATFORM_INITIAL_SHARED_VERSION: 349179669
} as const

// Utility constants
export const MIST_PER_SUI = 1_000_000_000 // 1 SUI = 1 billion MIST
