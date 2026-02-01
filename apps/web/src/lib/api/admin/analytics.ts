import { api } from "@/lib/axios";
import type {
	AnalyticsDashboardResponse,
	AnalyticsSummary,
	BaseResponse,
	RefundListResponse,
} from "../types";

export interface DashboardParams {
	start_date?: string;
	end_date?: string;
	refund_skip?: number;
	refund_limit?: number;
}

export interface RefundParams {
	skip?: number;
	limit?: number;
}

export const adminAnalyticsApi = {
	getSummary: async (params?: { start_date?: string; end_date?: string }) => {
		const response = await api.get<BaseResponse<AnalyticsSummary>>(
			"/api/admin/analytics/summary",
			{ params }
		);
		return response.data.data;
	},

	getRefunds: async (params?: RefundParams) => {
		const response = await api.get<BaseResponse<RefundListResponse>>(
			"/api/admin/analytics/refunds",
			{ params }
		);
		return response.data.data;
	},

	getDashboard: async (params?: DashboardParams) => {
		const response = await api.get<BaseResponse<AnalyticsDashboardResponse>>(
			"/api/admin/analytics/dashboard",
			{ params }
		);
		return response.data.data;
	},
};
