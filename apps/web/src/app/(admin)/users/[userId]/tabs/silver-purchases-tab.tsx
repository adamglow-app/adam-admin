"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { adminOrdersApi } from "@/lib/api/admin/orders";

interface Props {
	userId: string;
}

function getStatusBadgeStyles(status: string) {
	if (status === "completed") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (status === "cancelled") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	if (status === "refunded") {
		return "bg-blue-50 text-blue-700 border-blue-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

function TableSkeleton() {
	const skeletonIds = ["skel-silver-1", "skel-silver-2", "skel-silver-3"];
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"Order Number",
							"Grams",
							"Price/Gram",
							"Total Amount",
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
					{skeletonIds.map((skeletId) => (
						<TableRow className="border-adam-border/30" key={skeletId}>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-20 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyState() {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<Package className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No silver purchases found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					This user hasn't made any silver purchases yet
				</p>
			</CardContent>
		</Card>
	);
}

export default function SilverPurchasesTab({ userId }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-silver-purchases", userId],
		queryFn: () =>
			adminOrdersApi.getSilverPurchases({ user_id: userId, limit: 100 }),
		retry: false,
	});

	if (isLoading) {
		return <TableSkeleton />;
	}

	if (!data?.orders || data.orders.length === 0) {
		return <EmptyState />;
	}

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Order Number
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Grams
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Price/Gram
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Total Amount
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
					{data.orders.map((order) => (
						<TableRow
							className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
							key={order.id}
						>
							<TableCell className="font-mono text-sm">
								{order.orderNumber}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								{Number.parseFloat(order.metalGrams).toFixed(3)} g
							</TableCell>
							<TableCell className="text-right font-medium text-adam-tinted-black text-sm">
								₹
								{Number.parseFloat(order.metalPricePerGram).toLocaleString(
									"en-IN"
								)}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								₹{Number.parseFloat(order.amount).toLocaleString("en-IN")}
							</TableCell>
							<TableCell>
								<Badge
									className={`border font-medium text-xs ${getStatusBadgeStyles(order.status)}`}
									variant="outline"
								>
									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
								</Badge>
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								{new Date(order.createdAt).toLocaleDateString("en-IN", {
									day: "numeric",
									month: "short",
									year: "numeric",
								})}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
