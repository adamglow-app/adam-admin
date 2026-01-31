import { api } from "@/lib/axios";
import type {
	AdminUserDetail,
	AdminUserListResponse,
	BaseResponse,
} from "../types";

export const adminUsersApi = {
	list: async (params?: { skip?: number; limit?: number }) => {
		const response = await api.get<BaseResponse<AdminUserListResponse>>(
			"/api/admin/users/",
			{ params }
		);
		return response.data.data;
	},

	getById: async (userId: string) => {
		const response = await api.get<BaseResponse<AdminUserDetail>>(
			`/api/admin/users/${userId}`
		);
		return response.data.data;
	},
};
