export const SUI_ADDRESS = '0x2::sui::SUI'
export const USDC_ADDRESS =
	'0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

export const SC_PACKAGE_CONFIG = {
	_7kPackageId: import.meta.env.VITE_7K_PACKAGE_ID || '',
	_7kConfig: import.meta.env.VITE_7K_CONFIG || '',
	_7kVault: import.meta.env.VITE_7K_VAULT || '',
	_7kCommissionPartner: import.meta.env.VITE_7K_COMMISSION_PARTNER || '',
	_7kCommissionBps: import.meta.env.VITE_7K_COMMISSION_BPS || ''
}
