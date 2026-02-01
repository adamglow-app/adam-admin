export interface AdminUserListItem {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	aadhar: string;
	referralCode: string;
	kycStatus: "pending" | "verified" | "rejected";
	balances: {
		gold: number;
		silver: number;
	};
	createdAt: string;
	updatedAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
	totalOrders: number;
	totalTransactions: number;
}

export interface AdminUserListResponse {
	users: AdminUserListItem[];
	total: number;
}

export interface BaseResponse<T> {
	status: string;
	message: string;
	data: T;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	sku: string;
	price: number;
	metalType: "gold" | "silver";
	category: string;
	subCategory?: string;
	weight: number;
	purity: string;
	stock: number;
	status: "active" | "inactive" | "out_of_stock";
	photos: string[];
	certificate?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProductListResponse {
	products: Product[];
	total: number;
	skip: number;
	limit: number;
}

export interface MetalPrice {
	id: string;
	metalType?: "gold" | "silver";
	metal_type?: "gold" | "silver";
	buyPrice?: number;
	sellPrice?: number;
	pricePerGram?: number;
	price_per_gram?: number;
	timestamp?: string;
	date?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PriceHistoryEntry {
	date: string;
	price: number;
	metalType?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PriceHistoryResponse {
	metal_type: string;
	data: PriceHistoryEntry[];
}

export interface Order {
	id: string;
	userId: string;
	userEmail: string;
	metalType: "gold" | "silver";
	quantity: number;
	pricePerGram: number;
	totalAmount: number;
	status: "pending" | "completed" | "cancelled" | "refunded";
	createdAt: string;
}

export interface RefundRequest {
	orderId: string;
	amount: number;
	reason: string;
}

export interface RefundHistory {
	id: string;
	orderId: string;
	amount: number;
	reason: string;
	status: "pending" | "completed" | "failed";
	processedBy?: string;
	createdAt: string;
	processedAt?: string;
}

export interface RefundStatus {
	orderId: string;
	status: "pending" | "completed" | "failed";
	amount: number;
	createdAt: string;
}

export interface ReferralConfig {
	metalType: "gold" | "silver";
	referrerBonus: number;
	refereeBonus: number;
	minInvestment: number;
}
