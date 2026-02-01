import { api } from "@/lib/axios";
import type { BaseResponse, Product, ProductListResponse } from "../types";

// Helper to normalize API response to frontend format
function normalizeProduct(data: Product): Product {
	return {
		...data,
		// Normalize price to number
		price:
			typeof data.price === "string"
				? Number.parseFloat(data.price)
				: data.price,
		// Map API fields to frontend fields
		sku: data.sku ?? data.productCode,
		purity: data.purity ?? data.metalPurity,
		weight:
			data.weight ?? (data.grams ? Number.parseFloat(data.grams) : undefined),
		stock: data.stock ?? data.quantity,
		photos: data.photos ?? data.photoUrls ?? [],
		certificate: data.certificate ?? data.certificateUrl,
		// Default status to "active" if not provided by API
		status: data.status ?? "active",
		metalType: data.metalType as "gold" | "silver",
	};
}

// Helper to create FormData from product data
function createProductFormData(
	data: Partial<Product>,
	photoFiles?: File[],
	certificateFile?: File
): FormData {
	const formData = new FormData();

	// Map camelCase to snake_case and add to FormData
	if (data.name) {
		formData.append("name", data.name);
	}
	if (data.price !== undefined) {
		formData.append("price", String(data.price));
	}
	if (data.weight !== undefined) {
		formData.append("grams", String(data.weight));
	}
	if (data.category) {
		formData.append("category", data.category);
	}
	if (data.description) {
		formData.append("description", data.description);
	}
	if (data.sku) {
		formData.append("product_code", data.sku);
	}
	if (data.purity) {
		formData.append("metal_purity", data.purity);
	}
	if (data.metalType) {
		formData.append("metal_type", data.metalType);
	}
	if (data.stock !== undefined) {
		formData.append("quantity", String(data.stock));
	}

	// Optional fields with defaults
	formData.append("discount_percentage", "0");
	formData.append("discount_type", "overall");
	formData.append("gross_weight", String(data.weight ?? 0));
	formData.append("net_weight", String(data.weight ?? 0));
	formData.append("stone_weight", "0");
	formData.append("making_charge", "0");
	formData.append("gst", "0");

	// Handle photo files
	if (photoFiles && photoFiles.length > 0) {
		for (const file of photoFiles) {
			formData.append("photos", file);
		}
	}

	// Handle certificate file
	if (certificateFile) {
		formData.append("certificate", certificateFile);
	}

	return formData;
}

export const adminProductsApi = {
	list: async (params?: { skip?: number; limit?: number }) => {
		const response = await api.get<BaseResponse<ProductListResponse>>(
			"/api/admin/products/",
			{ params }
		);
		const data = response.data.data;
		return {
			...data,
			products: data.products.map(normalizeProduct),
		};
	},

	getById: async (productId: string) => {
		const response = await api.get<BaseResponse<Product>>(
			`/api/admin/products/${productId}`
		);
		return normalizeProduct(response.data.data);
	},

	create: async (
		data: Partial<Product>,
		photoFiles?: File[],
		certificateFile?: File
	) => {
		const formData = createProductFormData(data, photoFiles, certificateFile);
		const response = await api.post<BaseResponse<Product>>(
			"/api/admin/products/",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return normalizeProduct(response.data.data);
	},

	update: async (
		productId: string,
		data: Partial<Product>,
		photoFiles?: File[],
		certificateFile?: File
	) => {
		const formData = createProductFormData(data, photoFiles, certificateFile);
		const response = await api.put<BaseResponse<Product>>(
			`/api/admin/products/${productId}`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return normalizeProduct(response.data.data);
	},

	delete: async (productId: string) => {
		const response = await api.delete<BaseResponse<null>>(
			`/api/admin/products/${productId}`
		);
		return response.data.data;
	},
};
