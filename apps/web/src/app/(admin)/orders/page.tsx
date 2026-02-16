"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins, Package, ShoppingCart, Wallet } from "lucide-react";
import { useState } from "react";
import { OrnamentOrdersTable } from "@/components/ornament-orders-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminOrdersApi } from "@/lib/api/admin/orders";
import type { OrderItem, WalletTransaction } from "@/lib/api/types";

function OrdersSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"Order #",
							"User",
							"Amount",
							"Metal",
							"Grams",
							"Status",
							"Date",
						].map((header) => (
							<TableHead
								className="font-semibold text-adam-grey text-xs uppercase tracking-wider"
								key={header}
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{["oskel-1", "oskel-2", "oskel-3", "oskel-4", "oskel-5"].map(
						(key) => (
							<TableRow className="border-adam-border/30" key={key}>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-20 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyOrders({ type }: { type: string }) {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<ShoppingCart className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No {type} orders found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					There are no {type} orders at the moment.
				</p>
			</CardContent>
		</Card>
	);
}

function getStatusStyles(status: string) {
	const normalizedStatus = status?.toLowerCase() ?? "";
	if (normalizedStatus === "completed") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (normalizedStatus === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (normalizedStatus === "cancelled") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	if (normalizedStatus === "refunded") {
		return "bg-slate-50 text-slate-700 border-slate-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

function formatCurrency(amount: string | number | undefined): string {
	if (!amount) {
		return "₹0";
	}
	const numAmount =
		typeof amount === "string" ? Number.parseFloat(amount) : amount;
	return `₹${numAmount.toLocaleString()}`;
}

function formatDate(dateString: string | undefined): string {
	if (!dateString) {
		return "---";
	}
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return "---";
	}
}

function OrderRow({ order }: { order: OrderItem }) {
	return (
		<TableRow className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50">
			<TableCell>
				<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-xs">
					{order.orderNumber ?? "---"}
				</code>
			</TableCell>
			<TableCell>
				<span className="font-medium text-adam-tinted-black text-sm">
					{order.userId?.slice(0, 8) ?? "---"}
				</span>
			</TableCell>
			<TableCell className="text-sm">
				<span className="font-semibold text-adam-tinted-black">
					{formatCurrency(order.amount)}
				</span>
				{order.discountAmount && Number(order.discountAmount) > 0 && (
					<div className="text-adam-trailing text-xs">
						Discount: -₹{Number(order.discountAmount).toLocaleString()}
					</div>
				)}
			</TableCell>
			<TableCell>
				<Badge
					className={`border font-medium text-xs ${
						order.metalType?.toLowerCase() === "gold"
							? "border-amber-200 bg-amber-50 text-amber-700"
							: "border-slate-200 bg-slate-50 text-slate-700"
					}`}
					variant="outline"
				>
					{order.metalType
						? order.metalType.charAt(0).toUpperCase() + order.metalType.slice(1)
						: "---"}
				</Badge>
			</TableCell>
			<TableCell className="text-sm">
				<span className="font-medium text-adam-tinted-black">
					{order.metalGrams ? Number(order.metalGrams).toFixed(2) : "0.00"}
				</span>
				<span className="text-adam-grey"> g</span>
			</TableCell>
			<TableCell>
				<Badge
					className={`border font-medium text-xs ${getStatusStyles(order.status)}`}
					variant="outline"
				>
					{order.status
						? order.status.charAt(0).toUpperCase() + order.status.slice(1)
						: "---"}
				</Badge>
			</TableCell>
			<TableCell className="text-adam-grey text-sm">
				{formatDate(order.createdAt)}
			</TableCell>
		</TableRow>
	);
}

function OrdersTable({
	orders,
	isLoading,
	isEmpty,
}: {
	orders: OrderItem[];
	isLoading: boolean;
	isEmpty: boolean;
}) {
	if (isLoading) {
		return <OrdersSkeleton />;
	}
	if (isEmpty) {
		return <EmptyOrders type="order" />;
	}
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Order #
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							User
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Amount
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Metal
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Grams
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Status
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Date
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.map((order) => (
						<OrderRow key={order.id} order={order} />
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

function WalletTransactionRow({
	transaction,
}: {
	transaction: WalletTransaction;
}) {
	return (
		<TableRow className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50">
			<TableCell>
				<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-xs">
					{transaction.id?.slice(0, 8) ?? "---"}
				</code>
			</TableCell>
			<TableCell>
				<span className="font-medium text-adam-tinted-black text-sm">
					{transaction.userId?.slice(0, 8) ?? "---"}
				</span>
			</TableCell>
			<TableCell>
				<Badge
					className="border border-blue-200 bg-blue-50 font-medium text-blue-700 text-xs"
					variant="outline"
				>
					{transaction.transactionType ?? "---"}
				</Badge>
			</TableCell>
			<TableCell>
				<span className="font-medium text-adam-grey text-xs">
					{transaction.transactionCategory ?? "---"}
				</span>
			</TableCell>
			<TableCell className="text-sm">
				<span className="font-semibold text-adam-tinted-black">
					{formatCurrency(transaction.amount)}
				</span>
			</TableCell>
			<TableCell className="text-sm">
				<div className="flex flex-col gap-1">
					<span className="text-adam-grey text-xs">
						Before: {formatCurrency(transaction.balanceBefore)}
					</span>
					<span className="text-adam-grey text-xs">
						After: {formatCurrency(transaction.balanceAfter)}
					</span>
				</div>
			</TableCell>
			<TableCell className="text-sm">
				<span className="text-adam-grey">
					{transaction.description || "---"}
				</span>
			</TableCell>
			<TableCell className="text-adam-grey text-sm">
				{formatDate(transaction.createdAt)}
			</TableCell>
		</TableRow>
	);
}

function WalletTransactionsSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"ID",
							"User",
							"Type",
							"Category",
							"Amount",
							"Balance",
							"Description",
							"Date",
						].map((header) => (
							<TableHead
								className="font-semibold text-adam-grey text-xs uppercase tracking-wider"
								key={header}
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{["wskel-1", "wskel-2", "wskel-3", "wskel-4", "wskel-5"].map(
						(key) => (
							<TableRow className="border-adam-border/30" key={key}>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

function WalletTransactionsTable({
	transactions,
	isLoading,
	isEmpty,
}: {
	transactions: WalletTransaction[];
	isLoading: boolean;
	isEmpty: boolean;
}) {
	if (isLoading) {
		return <WalletTransactionsSkeleton />;
	}
	if (isEmpty) {
		return <EmptyOrders type="wallet transaction" />;
	}
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							ID
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							User
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Type
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Category
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Amount
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Balance
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Description
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Date
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.map((transaction) => (
						<WalletTransactionRow
							key={transaction.id}
							transaction={transaction}
						/>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

export default function OrdersPage() {
	const [goldSkip, setGoldSkip] = useState(0);
	const [silverSkip, setSilverSkip] = useState(0);
	const [ornamentSkip, setOrnamentSkip] = useState(0);
	const [walletSkip, setWalletSkip] = useState(0);
	const LIMIT = 50;

	const {
		data: goldData,
		isLoading: goldLoading,
		error: goldError,
	} = useQuery({
		queryKey: ["admin-orders-gold", goldSkip],
		queryFn: () =>
			adminOrdersApi.getGoldPurchases({ skip: goldSkip, limit: LIMIT }),
		retry: false,
	});

	const {
		data: silverData,
		isLoading: silverLoading,
		error: silverError,
	} = useQuery({
		queryKey: ["admin-orders-silver", silverSkip],
		queryFn: () =>
			adminOrdersApi.getSilverPurchases({ skip: silverSkip, limit: LIMIT }),
		retry: false,
	});

	const {
		data: ornamentData,
		isLoading: ornamentLoading,
		error: ornamentError,
	} = useQuery({
		queryKey: ["admin-orders-ornaments", ornamentSkip],
		queryFn: () =>
			adminOrdersApi.getOrnamentOrders({ skip: ornamentSkip, limit: LIMIT }),
		retry: false,
	});

	const {
		data: walletData,
		isLoading: walletLoading,
		error: walletError,
	} = useQuery({
		queryKey: ["admin-wallet-transactions", walletSkip],
		queryFn: () =>
			adminOrdersApi.getWalletTransactions({ skip: walletSkip, limit: LIMIT }),
		retry: false,
	});

	const goldOrders = goldData?.orders ?? [];
	const silverOrders = silverData?.orders ?? [];
	const ornamentOrders = ornamentData?.orders ?? [];
	const walletTransactions = walletData?.transactions ?? [];

	const goldTotal = goldData?.total ?? 0;
	const silverTotal = silverData?.total ?? 0;
	const ornamentTotal = ornamentData?.total ?? 0;
	const walletTotal = walletData?.total ?? 0;

	const goldHasMore = goldOrders.length + goldSkip < goldTotal;
	const silverHasMore = silverOrders.length + silverSkip < silverTotal;
	const ornamentHasMore = ornamentOrders.length + ornamentSkip < ornamentTotal;
	const walletHasMore = walletTransactions.length + walletSkip < walletTotal;

	const goldErrorOccurred = goldError !== undefined;
	const silverErrorOccurred = silverError !== undefined;
	const ornamentErrorOccurred = ornamentError !== undefined;
	const walletErrorOccurred = walletError !== undefined;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Orders
				</h1>
				<p className="text-adam-grey text-sm">
					Manage and track all purchase orders
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-0 bg-white shadow-sm">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
							<Coins className="h-5 w-5 text-amber-600" />
						</div>
						<div>
							<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
								Gold Purchases
							</p>
							<p className="font-bold text-adam-tinted-black text-xl">
								{goldTotal.toLocaleString()}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 bg-white shadow-sm">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
							<ShoppingCart className="h-5 w-5 text-slate-600" />
						</div>
						<div>
							<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
								Silver Purchases
							</p>
							<p className="font-bold text-adam-tinted-black text-xl">
								{silverTotal.toLocaleString()}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 bg-white shadow-sm">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
							<Package className="h-5 w-5 text-orange-600" />
						</div>
						<div>
							<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
								Ornament Orders
							</p>
							<p className="font-bold text-adam-tinted-black text-xl">
								{ornamentTotal.toLocaleString()}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 bg-white shadow-sm">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
							<Wallet className="h-5 w-5 text-purple-600" />
						</div>
						<div>
							<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
								Wallet Transactions
							</p>
							<p className="font-bold text-adam-tinted-black text-xl">
								{walletTotal.toLocaleString()}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Error State */}
			{(goldErrorOccurred ||
				silverErrorOccurred ||
				ornamentErrorOccurred ||
				walletErrorOccurred) && (
				<Card className="border-0 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
					<CardContent className="py-4">
						<p className="font-medium text-red-800">Error loading data</p>
						<p className="mt-1 text-red-600 text-sm">
							Please try refreshing the page.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Orders Tabs */}
			<Tabs className="space-y-4" defaultValue="gold">
				<TabsList className="bg-white shadow-sm">
					<TabsTrigger className="gap-2" value="gold">
						<Coins className="h-4 w-4" />
						Gold Purchases
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="silver">
						<ShoppingCart className="h-4 w-4" />
						Silver Purchases
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="ornaments">
						<Package className="h-4 w-4" />
						Ornament Orders
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="wallet">
						<Wallet className="h-4 w-4" />
						Wallet Transactions
					</TabsTrigger>
				</TabsList>

				<TabsContent value="gold">
					<div className="space-y-4">
						<OrdersTable
							isEmpty={goldOrders.length === 0}
							isLoading={goldLoading}
							orders={goldOrders}
						/>
						{goldHasMore && (
							<div className="flex justify-center">
								<Button
									className="bg-adam-secondary hover:bg-adam-gradient-top"
									onClick={() => setGoldSkip((prev) => prev + LIMIT)}
									variant="outline"
								>
									Load More
								</Button>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="silver">
					<div className="space-y-4">
						<OrdersTable
							isEmpty={silverOrders.length === 0}
							isLoading={silverLoading}
							orders={silverOrders}
						/>
						{silverHasMore && (
							<div className="flex justify-center">
								<Button
									className="bg-adam-secondary hover:bg-adam-gradient-top"
									onClick={() => setSilverSkip((prev) => prev + LIMIT)}
									variant="outline"
								>
									Load More
								</Button>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="ornaments">
					<div className="space-y-4">
						{ornamentLoading && <OrdersSkeleton />}
						{!ornamentLoading && ornamentOrders.length === 0 && (
							<EmptyOrders type="ornament" />
						)}
						{!ornamentLoading && ornamentOrders.length > 0 && (
							<Card className="overflow-x-auto border-0 shadow-sm">
								<OrnamentOrdersTable
									orders={ornamentOrders}
									queryKey={["admin-orders-ornaments", String(ornamentSkip)]}
								/>
							</Card>
						)}
						{ornamentHasMore && (
							<div className="flex justify-center">
								<Button
									className="bg-adam-secondary hover:bg-adam-gradient-top"
									onClick={() => setOrnamentSkip((prev) => prev + LIMIT)}
									variant="outline"
								>
									Load More
								</Button>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="wallet">
					<div className="space-y-4">
						<WalletTransactionsTable
							isEmpty={walletTransactions.length === 0}
							isLoading={walletLoading}
							transactions={walletTransactions}
						/>
						{walletHasMore && (
							<div className="flex justify-center">
								<Button
									className="bg-adam-secondary hover:bg-adam-gradient-top"
									onClick={() => setWalletSkip((prev) => prev + LIMIT)}
									variant="outline"
								>
									Load More
								</Button>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
