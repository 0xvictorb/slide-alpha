import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SUI_TYPE_ARG, SUI_DECIMALS } from "@mysten/sui/utils";
import { fromDecimals } from "@/lib/number";

interface UseTokenBalanceProps {
	tokenType?: string; // If not provided, will fetch SUI balance
	tokenDecimals?: number;
}

export const useTokenBalance = ({
	tokenType,
	tokenDecimals = SUI_DECIMALS,
}: UseTokenBalanceProps = {}) => {
	const client = useSuiClient();
	const account = useCurrentAccount();

	return useQuery({
		queryKey: ["tokenBalance", account?.address, tokenType, tokenDecimals],
		queryFn: async () => {
			if (!account?.address) return "0";

			const balance = await client.getBalance({
				owner: account.address,
				coinType: tokenType || SUI_TYPE_ARG,
			});

			return fromDecimals(balance.totalBalance, tokenDecimals);
		},
		enabled: !!account?.address,
	});
};
