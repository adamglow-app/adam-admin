import { api } from "@/lib/axios";
import type { BaseResponse, Scheme, SchemeListResponse } from "../types";

export interface SchemeParams {
	skip?: number;
	limit?: number;
}

export interface CreateSchemeData {
	name: string;
	description: string;
	termsAndConditions: string;
}

export interface UpdateSchemeData extends CreateSchemeData {
	isActive?: boolean;
}

// Raw API response types (snake_case)
interface RawScheme {
	id: string;
	name: string;
	description: string;
	terms_and_conditions: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

interface RawSchemeListResponse {
	schemes: RawScheme[];
	total: number;
	skip: number;
	limit: number;
}

// Transform raw API response to camelCase
function transformScheme(raw: RawScheme): Scheme {
	return {
		id: raw.id,
		name: raw.name,
		description: raw.description,
		termsAndConditions: raw.terms_and_conditions,
		isActive: raw.is_active,
		createdAt: raw.created_at,
		updatedAt: raw.updated_at,
	};
}

function transformSchemeListResponse(
	raw: RawSchemeListResponse
): SchemeListResponse {
	return {
		schemes: raw.schemes.map(transformScheme),
		total: raw.total,
		skip: raw.skip,
		limit: raw.limit,
	};
}

export const adminSchemesApi = {
	getAll: async (params?: SchemeParams) => {
		const response = await api.get<BaseResponse<RawSchemeListResponse>>(
			"/api/admin/schemes",
			{ params }
		);
		return transformSchemeListResponse(response.data.data);
	},

	getById: async (schemeId: string) => {
		const response = await api.get<BaseResponse<RawScheme>>(
			`/api/admin/schemes/${schemeId}`
		);
		return transformScheme(response.data.data);
	},

	create: async (data: CreateSchemeData) => {
		const response = await api.post<BaseResponse<RawScheme>>(
			"/api/admin/schemes",
			data
		);
		return transformScheme(response.data.data);
	},

	update: async (schemeId: string, data: UpdateSchemeData) => {
		const response = await api.patch<BaseResponse<RawScheme>>(
			`/api/admin/schemes/${schemeId}`,
			data
		);
		return transformScheme(response.data.data);
	},

	delete: async (schemeId: string) => {
		const response = await api.delete<BaseResponse<{ message: string }>>(
			`/api/admin/schemes/${schemeId}`
		);
		return response.data.data;
	},
};
