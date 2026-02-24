import { api } from "@/lib/axios";
import type {
	BaseResponse,
	Category,
	Product,
	ProductListResponse,
} from "../types";

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

	// Required fields
	formData.append("name", data.name ?? "");
	formData.append("grams", String(data.weight ?? 0));
	formData.append("category", data.category ?? "");
	formData.append("product_code", data.sku ?? "");
	formData.append("metal_purity", data.purity ?? "999");
	formData.append("metal_type", data.metalType ?? "gold");

	// Weight and quantity fields
	formData.append("gross_weight", String(data.grossWeight ?? data.weight ?? 0));
	formData.append("net_weight", String(data.netWeight ?? data.weight ?? 0));
	formData.append("stone_weight", String(data.stoneWeight ?? 0));
	formData.append("quantity", String(data.stock ?? 0));

	// Price-related fields
	formData.append("wastage_percentage", String(data.wastagePercentage ?? 0));
	formData.append("making_charge", String(data.makingCharge ?? 0));
	formData.append("gst", String(data.gst ?? 0));

	// Discount fields
	formData.append("discount_percentage", String(data.discountPercentage ?? 0));
	formData.append("discount_type", data.discountType ?? "overall");

	// Handle photo files - required by API
	if (photoFiles && photoFiles.length > 0) {
		for (const file of photoFiles) {
			formData.append("photos", file);
		}
	}

	// Handle certificate file - optional
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
			total: data.total,
			skip: data.skip,
			limit: data.limit,
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

	// Category management
	listCategories: async () => {
		const response = await api.get<BaseResponse<Category[]>>(
			"/api/admin/products/categories/"
		);
		return response.data.data;
	},

	createCategory: async (data: {
		name: string;
		description: string;
		isActive: boolean;
	}) => {
		const response = await api.post<BaseResponse<Category>>(
			"/api/admin/products/categories/",
			data
		);
		return response.data.data;
	},
};
