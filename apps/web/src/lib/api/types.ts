export interface AdminUserListItem {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	aadhar: string;
	referralCode: string;
	kycStatus: "pending" | "verified" | "rejected";
	balances?: {
		gold?: number | string;
		silver?: number | string;
		goldGrams?: number | string;
		silverGrams?: number | string;
	};
	goldBalance?: number;
	silverBalance?: number;
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
	description?: string;
	// Frontend fields (normalized)
	sku?: string;
	price: number | string;
	metalType?: "gold" | "silver";
	category: string;
	subCategory?: string;
	weight?: number | string;
	purity?: string;
	stock?: number;
	status?: "active" | "inactive" | "out_of_stock";
	photos?: string[];
	certificate?: string;
	createdAt?: string;
	updatedAt?: string;
	// API fields (snake_case)
	productCode?: string;
	metalPurity?: string;
	grams?: string;
	quantity?: number;
	photoUrls?: string[];
	certificateUrl?: string;
	grossWeight?: string | number | null;
	netWeight?: string | number | null;
	stoneWeight?: string | number | null;
	makingCharge?: string | number;
	gst?: string | number;
	discountPercentage?: string | number;
	discountType?: string;
	wastagePercentage?: string | number;
}

export interface ProductListResponse {
	products: Product[];
	total?: number;
	skip?: number;
	limit?: number;
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

export interface RefundListItem {
	refund_id: string;
	order_id: string;
	order_number: string;
	razorpay_payment_id: string;
	razorpay_refund_id: string;
	refund_amount: number;
	refund_status: string;
	refunded_at: string;
	order_amount: number;
	order_status: string;
	user_id: string;
}

export interface RefundListResponse {
	refunds: RefundListItem[];
	total: number;
	total_refund_amount: number;
	skip: number;
	limit: number;
}

export interface AnalyticsSummary {
	total_ornament_orders: number;
	total_gold_sold_grams: number;
	total_silver_sold_grams: number;
	total_revenue: number;
	total_leasing_amount: number;
}

export interface AnalyticsDashboardResponse {
	analytics: AnalyticsSummary;
	refunds: RefundListResponse;
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

export interface OrderItem {
	id: string;
	userId: string;
	productId: string;
	orderType: string;
	orderNumber: string;
	walletPaymentAmount: string;
	razorpayPaymentAmount: string;
	amount: string;
	currency: string;
	taxAmount: string;
	discountAmount: string;
	productQuantity: number;
	productPrice: string;
	metalType: string;
	metalGrams: string;
	metalPricePerGram: string;
	status: string;
	notes: string;
	orderMetadata: Record<string, unknown>;
	fulfillmentStatus?: string;
	createdAt: string;
	updatedAt: string;
}

export interface OrderListResponse {
	orders: OrderItem[];
	total: number;
	skip: number;
	limit: number;
	metalType?: string;
}

export interface ReferralConfig {
	metalType: "gold" | "silver";
	rewardPercentage: number | string;
	welcomeBonus: number | string;
	isActive?: boolean;
}

export interface WalletTransaction {
	id: string;
	walletId: string;
	userId: string;
	transactionType: string;
	transactionCategory: string;
	amount: number;
	balanceBefore: number;
	balanceAfter: number;
	description: string;
	orderId: string;
	createdAt: string;
}

export interface WalletTransactionListResponse {
	transactions: WalletTransaction[];
	total: number;
	skip: number;
	limit: number;
}

export interface Redemption {
	id: string;
	userId: string;
	email: string;
	metalType: "gold" | "silver";
	grams: number;
	pricePerGram: number;
	totalAmount: number;
	bankName: string;
	accountNumber: string;
	ifscCode: string;
	accountHolderName: string;
	status: "pending" | "success" | "failed";
	razorpayPayoutId?: string;
	failureReason?: string;
	createdAt: string;
	processedAt?: string;
}

export interface RedemptionListResponse {
	redemptions: Redemption[];
	total?: number;
}

export interface Scheme {
	id: string;
	name: string;
	description: string;
	termsAndConditions: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SchemeListResponse {
	schemes: Scheme[];
	total: number;
	skip: number;
	limit: number;
}
export interface LeasingItem {
	id: string;
	userId: string;
	schemeId: string;
	leasingNumber: string;
	amount: string;
	currency: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface LeasingListResponse {
	leasings: LeasingItem[];
	total: number;
	skip: number;
	limit: number;
}

export interface Category {
	id: string;
	name: string;
	description: string;
	is_active: boolean;
	createdAt: string;
	updatedAt: string;
}
