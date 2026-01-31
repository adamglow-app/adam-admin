import { api } from "@/lib/axios";
import type { BaseResponse, MetalPrice, PriceHistoryEntry } from "../types";

export const adminPricesApi = {
	getLatest: async () => {
		const response = await api.get<BaseResponse<MetalPrice[]>>(
			"/api/admin/prices/latest"
		);
		return response.data.data;
	},

	getHistory: async (params?: { metalType?: string }) => {
		const response = await api.get<BaseResponse<PriceHistoryEntry[]>>(
			"/api/admin/prices/history",
			{ params }
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
			data
		);
		return response.data.data;
	},
};
