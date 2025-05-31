import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface TokenPriceData {
	price: number;
	lastUpdated: number;
}

interface PriceResponse {
	[tokenId: string]: TokenPriceData;
}

const PRICE_API_BASE_URL = "https://prices.7k.ag/price";

const priceApi = axios.create({
	baseURL: PRICE_API_BASE_URL,
	timeout: 10000, // 10s timeout
	headers: {
		Accept: "application/json",
	},
});

const updatedKey = (key: string) => key.split("::").pop() || key;

const fetchTokenPrices = async (tokenIds: string[]): Promise<PriceResponse> => {
	const params = new URLSearchParams({
		ids: tokenIds.join(","),
	});

	const { data } = await priceApi.get<PriceResponse>("", { params });
	const refinedData = Object.fromEntries(
		Object.entries(data).map(([key, value]) => [
			updatedKey(key),
			{ price: value.price, lastUpdated: value.lastUpdated },
		]),
	);

	return refinedData;
};

export const useTokensFiatPrice = (
	tokenIds: string[],
	refreshInterval = 60000, // Default 60s refresh
) => {
	return useQuery({
		queryKey: ["tokenPrices", tokenIds],
		queryFn: () => fetchTokenPrices(tokenIds),
		refetchInterval: refreshInterval,
		staleTime: refreshInterval / 2,
		retry: 3, // Retry failed requests 3 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
	});
};
