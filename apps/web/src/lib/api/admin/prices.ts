import { api } from "@/lib/axios";
import type { BaseResponse, MetalPrice, PriceHistoryEntry } from "../types";

export const adminPricesApi = {
	getGoldPrice: async () => {
		const response = await api.get<BaseResponse<MetalPrice>>(
			"/api/admin/prices/latest",
			{ params: { metal_type: "gold" } }
		);
		return response.data.data;
	},

	getSilverPrice: async () => {
		const response = await api.get<BaseResponse<MetalPrice>>(
			"/api/admin/prices/latest",
			{ params: { metal_type: "silver" } }
		);
		return response.data.data;
	},

	getHistory: async (params: {
		metalType: string;
		startDate?: string;
		endDate?: string;
	}) => {
		const response = await api.get<BaseResponse<PriceHistoryEntry[]>>(
			"/api/admin/prices/history",
			{
				params: {
					metal_type: params.metalType,
					start_date: params.startDate,
					end_date: params.endDate,
				},
			}
		);
		return response.data.data;
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
