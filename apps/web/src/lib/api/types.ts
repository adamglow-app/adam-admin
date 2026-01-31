export interface AdminUserListItem {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	aadhar: string;
	referralCode: string;
	createdAt: string;
	updatedAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
	balances: {
		gold: number;
		silver: number;
	};
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
	price: number;
	metalType: "gold" | "silver";
	category: string;
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
	metalType: "gold" | "silver";
	buyPrice?: number;
	sellPrice?: number;
	pricePerGram?: number;
	timestamp?: string;
}

export interface PriceHistoryEntry {
	date: string;
	price: number;
	metalType?: string;
}

export interface RefundRequest {
	orderId: string;
	amount: number;
	reason: string;
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
