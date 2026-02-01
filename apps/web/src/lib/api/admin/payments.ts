import { api } from "@/lib/axios";
import type {
	BaseResponse,
	RefundHistory,
	RefundListResponse,
	RefundStatus,
} from "../types";

export const adminPaymentsApi = {
	initiateRefund: async (
		orderId: string,
		data: { amount: number; reason: string }
	) => {
		const response = await api.post<BaseResponse<RefundStatus>>(
			`/api/admin/payments/refund/${orderId}`,
			data
		);
		return response.data.data;
	},

	getRefundStatus: async (orderId: string) => {
		const response = await api.get<BaseResponse<RefundStatus>>(
			`/api/admin/payments/refund/${orderId}/status`
		);
		return response.data.data;
	},

	getRefundHistory: async () => {
		const response = await api.get<BaseResponse<RefundHistory[]>>(
			"/api/admin/payments/refunds"
		);
		return response.data.data;
	},

	// New API integration for refund list
	getRefundList: async (params?: { skip?: number; limit?: number }) => {
		const response = await api.get<BaseResponse<RefundListResponse>>(
			"/api/admin/analytics/refunds",
			{ params }
		);
		return response.data.data;
	},
};
