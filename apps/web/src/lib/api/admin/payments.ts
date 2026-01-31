import { api } from "@/lib/axios";
import type { BaseResponse, RefundStatus } from "../types";

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
};
