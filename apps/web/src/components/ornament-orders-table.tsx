"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import type { OrderItem } from "@/lib/api/types";

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

interface Props {
	orders: OrderItem[];
	queryKey: string[];
}

export function OrnamentOrdersTable({ orders, queryKey }: Props) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

	const updateStatusMutation = useMutation({
		mutationFn: ({
			orderId,
			status,
		}: {
			orderId: string;
			status: "pending" | "in_progress" | "ready_for_pickup" | "picked_up";
		}) => adminOrdersApi.updateOrnamentFulfillmentStatus(orderId, status),
		onSuccess: () => {
			// Invalidate and refetch to ensure fresh data
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({ queryKey: ["admin-orders-ornaments"] });
			queryClient.invalidateQueries({ queryKey: ["admin-ornament-orders"] });
			// Also refetch immediately
			queryClient.refetchQueries({ queryKey: ["admin-ornament-orders"] });
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

	return (
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
				{orders.map((order) => {
					// Try multiple locations for fulfillment status in order of priority
					let fulfillmentStatus = "pending";

					// Check direct field first
					if (order.fulfillmentStatus) {
						fulfillmentStatus = order.fulfillmentStatus;
					}
					// Check orderMetadata with camelCase
					else if (order.orderMetadata?.fulfillmentStatus) {
						fulfillmentStatus = String(order.orderMetadata.fulfillmentStatus);
					}
					// Check orderMetadata with snake_case
					else if (order.orderMetadata?.fulfillment_status) {
						fulfillmentStatus = String(order.orderMetadata.fulfillment_status);
					}
					// Check if it's in the metadata as a string
					else if (
						typeof order.orderMetadata === "object" &&
						order.orderMetadata !== null
					) {
						// Search through all metadata keys
						for (const [key, value] of Object.entries(order.orderMetadata)) {
							if (key.toLowerCase().includes("fulfillment")) {
								fulfillmentStatus = String(value);
								break;
							}
						}
					}

					return (
						<TableRow
							className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
							key={order.id}
						>
							<TableCell className="font-mono text-sm">
								{order.orderNumber}
							</TableCell>
							<TableCell className="font-medium text-adam-tinted-black text-sm">
								{(String(order.orderMetadata?.productName) !== "undefined" &&
									String(order.orderMetadata?.productName)) ||
									(String(order.orderMetadata?.product_name) !== "undefined" &&
										String(order.orderMetadata?.product_name)) ||
									"Product"}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								{order.productQuantity}
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
									key={`${order.id}-${fulfillmentStatus}`}
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
	);
}
