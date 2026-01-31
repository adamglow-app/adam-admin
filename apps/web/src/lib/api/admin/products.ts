import { api } from "@/lib/axios";
import type { BaseResponse, Product, ProductListResponse } from "../types";

export const adminProductsApi = {
	list: async (params?: { skip?: number; limit?: number }) => {
		const response = await api.get<BaseResponse<ProductListResponse>>(
			"/api/admin/products/",
			{ params }
		);
		return response.data.data;
	},

	getById: async (productId: string) => {
		const response = await api.get<BaseResponse<Product>>(
			`/api/admin/products/${productId}`
		);
		return response.data.data;
	},

	create: async (data: Partial<Product>) => {
		const response = await api.post<BaseResponse<Product>>(
			"/api/admin/products/",
			data
		);
		return response.data.data;
	},

	update: async (productId: string, data: Partial<Product>) => {
		const response = await api.put<BaseResponse<Product>>(
			`/api/admin/products/${productId}`,
			data
		);
		return response.data.data;
	},

	delete: async (productId: string) => {
		const response = await api.delete<BaseResponse<null>>(
			`/api/admin/products/${productId}`
		);
		return response.data.data;
	},
};
