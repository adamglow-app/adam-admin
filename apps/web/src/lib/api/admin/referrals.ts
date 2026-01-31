import { api } from "@/lib/axios";
import type { BaseResponse, ReferralConfig } from "../types";

export const adminReferralsApi = {
	getConfig: async (metalType: string) => {
		const response = await api.get<BaseResponse<ReferralConfig>>(
			`/api/admin/referrals/config/${metalType}`
		);
		return response.data.data;
	},

	setConfig: async (data: ReferralConfig) => {
		const response = await api.post<BaseResponse<ReferralConfig>>(
			"/api/admin/referrals/config",
			data
		);
		return response.data.data;
	},
};
