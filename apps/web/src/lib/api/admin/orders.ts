import { api } from "@/lib/axios";
import type { BaseResponse, OrderListResponse } from "../types";

export interface OrderParams {
	skip?: number;
	limit?: number;
}

export const adminOrdersApi = {
	getGoldPurchases: async (params?: OrderParams) => {
		const response = await api.get<BaseResponse<OrderListResponse>>(
			"/api/admin/payments/purchases/gold",
			{ params }
		);
		return response.data.data;
	},

	getSilverPurchases: async (params?: OrderParams) => {
		const response = await api.get<BaseResponse<OrderListResponse>>(
			"/api/admin/payments/purchases/silver",
			{ params }
		);
		return response.data.data;
	},

	getOrnamentOrders: async (params?: OrderParams) => {
		const response = await api.get<BaseResponse<OrderListResponse>>(
			"/api/admin/payments/orders/ornaments",
			{ params }
		);
		return response.data.data;
	},
};
