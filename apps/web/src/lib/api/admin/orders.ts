import { api } from "@/lib/axios";
import type {
	BaseResponse,
	OrderListResponse,
	RedemptionListResponse,
	WalletTransactionListResponse,
} from "../types";

export interface OrderParams {
	skip?: number;
	limit?: number;
	user_id?: string;
	status_filter?: string;
	fulfillment_status?: string;
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

	getWalletTransactions: async (params?: OrderParams) => {
		const response = await api.get<BaseResponse<WalletTransactionListResponse>>(
			"/api/admin/payments/wallet/transactions",
			{ params }
		);
		return response.data.data;
	},

	getRedemptions: async (params?: OrderParams) => {
		const response = await api.get<BaseResponse<RedemptionListResponse>>(
			"/api/admin/redemptions",
			{ params }
		);
		return response.data.data;
	},

	updateOrnamentFulfillmentStatus: async (
		orderId: string,
		fulfillmentStatus:
			| "pending"
			| "in_progress"
			| "ready_for_pickup"
			| "picked_up"
	) => {
		const response = await api.patch<BaseResponse<{ message: string }>>(
			`/api/admin/payments/orders/${orderId}/fulfillment-status`,
			{ fulfillmentStatus, fulfillment_status: fulfillmentStatus }
		);
		return response.data.data;
	},
};
