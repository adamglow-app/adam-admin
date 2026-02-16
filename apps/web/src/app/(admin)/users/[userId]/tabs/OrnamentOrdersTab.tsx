"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
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

function getFulfillmentBadgeStyles(status: string) {
	if (status === "picked_up") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "ready_for_pickup") {
		return "bg-blue-50 text-blue-700 border-blue-200";
	}
	if (status === "in_progress") {
		return "bg-purple-50 text-purple-700 border-purple-200";
	}
	if (status === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

function TableSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"Order Number",
							"Product",
							"Quantity",
							"Total Amount",
							"Status",
							"Fulfillment",
							"Date",
							"Actions",
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
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow className="border-adam-border/30" key={i}>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-12" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-20 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-24 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-32" />
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
					No ornament orders found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					This user hasn't placed any ornament orders yet
				</p>
			</CardContent>
		</Card>
	);
}

export default function OrnamentOrdersTab({ userId }: Props) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["admin-ornament-orders", userId],
		queryFn: () =>
			adminOrdersApi.getOrnamentOrders({ user_id: userId, limit: 100 }),
		retry: false,
	});

	const updateStatusMutation = useMutation({
		mutationFn: ({
			orderId,
			status,
		}: {
			orderId: string;
			status: "pending" | "in_progress" | "ready_for_pickup" | "picked_up";
		}) => adminOrdersApi.updateOrnamentFulfillmentStatus(orderId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin-ornament-orders", userId],
			});
			toast({
				title: "Success",
				description: "Fulfillment status updated successfully",
			});
			setUpdatingOrderId(null);
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message || "Failed to update fulfillment status",
				variant: "destructive",
			});
			setUpdatingOrderId(null);
		},
	});

	const handleStatusChange = (
		orderId: string,
		status: "pending" | "in_progress" | "ready_for_pickup" | "picked_up"
	) => {
		setUpdatingOrderId(orderId);
		updateStatusMutation.mutate({ orderId, status });
	};

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
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Product
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Quantity
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Total Amount
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Status
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Fulfillment
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Date
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.orders.map((order) => {
						const fulfillmentStatus =
							order.orderMetadata?.fulfillmentStatus || "pending";
						return (
							<TableRow
								className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
								key={order.id}
							>
								<TableCell className="font-mono text-sm">
									{order.orderNumber}
								</TableCell>
								<TableCell className="font-medium text-adam-tinted-black text-sm">
									{order.orderMetadata?.productName || "Product"}
								</TableCell>
								<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
									{order.productQuantity}
								</TableCell>
								<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
									₹{parseFloat(order.amount).toLocaleString("en-IN")}
								</TableCell>
								<TableCell>
									<Badge
										className={`border font-medium text-xs ${getStatusBadgeStyles(order.status)}`}
										variant="outline"
									>
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										className={`border font-medium text-xs ${getFulfillmentBadgeStyles(fulfillmentStatus)}`}
										variant="outline"
									>
										{fulfillmentStatus
											.split("_")
											.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
											.join(" ")}
									</Badge>
								</TableCell>
								<TableCell className="text-adam-grey text-sm">
									{new Date(order.createdAt).toLocaleDateString("en-IN", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</TableCell>
								<TableCell>
									<Select
										disabled={updatingOrderId === order.id}
										onValueChange={(value) =>
											handleStatusChange(
												order.id,
												value as
													| "pending"
													| "in_progress"
													| "ready_for_pickup"
													| "picked_up"
											)
										}
										value={fulfillmentStatus}
									>
										<SelectTrigger className="h-8 w-[160px] text-xs">
											<SelectValue placeholder="Update status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="in_progress">In Progress</SelectItem>
											<SelectItem value="ready_for_pickup">
												Ready for Pickup
											</SelectItem>
											<SelectItem value="picked_up">Picked Up</SelectItem>
										</SelectContent>
									</Select>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
}
