import { api } from "@/lib/axios";
import type {
	BaseResponse,
	MetalPrice,
	PriceHistoryEntry,
	PriceHistoryResponse,
} from "../types";

// Helper to normalize API response to camelCase
function normalizeMetalPrice(data: MetalPrice): MetalPrice {
	return {
		...data,
		pricePerGram: data.pricePerGram ?? data.price_per_gram,
		metalType: data.metalType ?? data.metal_type,
		// Use updated_at if available, otherwise fall back to created_at, then date
		timestamp: data.updated_at ?? data.created_at ?? data.timestamp ?? data.date,
	};
}

export const adminPricesApi = {
	getGoldPrice: async () => {
		const response = await api.get<BaseResponse<MetalPrice>>(
			"/api/admin/prices/latest",
			{ params: { metal_type: "gold" } }
		);
		return normalizeMetalPrice(response.data.data);
	},

	getSilverPrice: async () => {
		const response = await api.get<BaseResponse<MetalPrice>>(
			"/api/admin/prices/latest",
			{ params: { metal_type: "silver" } }
		);
		return normalizeMetalPrice(response.data.data);
	},

	getLatest: async () => {
		const [gold, silver] = await Promise.all([
			adminPricesApi.getGoldPrice(),
			adminPricesApi.getSilverPrice(),
		]);
		return [gold, silver].filter(Boolean);
	},

	getHistory: async (params: {
		metalType: string;
		startDate?: string;
		endDate?: string;
	}) => {
		const response = await api.get<BaseResponse<PriceHistoryResponse>>(
			"/api/admin/prices/history",
			{
				params: {
					metal_type: params.metalType,
					start_date: params.startDate,
					end_date: params.endDate,
				},
			}
		);
		// API returns { metal_type: string, data: [...] }, we need to extract and add metalType to each entry
		const historyData = response.data.data;
		const metalType = historyData.metal_type;
		return historyData.data.map((entry: PriceHistoryEntry) => ({
			...entry,
			metalType,
		}));
	},

	update: async (data: {
		metalType: string;
		buyPrice: number;
		sellPrice: number;
	}) => {
		const response = await api.post<BaseResponse<MetalPrice>>(
			"/api/admin/prices/",
			null,
			{
				params: {
					metal_type: data.metalType,
					price_per_gram: data.sellPrice,
				},
			}
		);
		return response.data.data;
	},
};
