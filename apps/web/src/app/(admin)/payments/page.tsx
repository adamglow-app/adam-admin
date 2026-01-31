"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminPaymentsApi } from "@/lib/api/admin/payments";
import type { RefundHistory } from "@/lib/api/types";

function RefundHistorySkeleton() {
	return (
		<div className="rounded-md border border-adam-border">
			<Table>
				<TableHeader>
					<TableRow className="bg-adam-muted/30">
						{["Order ID", "Amount", "Reason", "Status", "Processed At"].map(
							(header) => (
								<TableHead className="font-medium" key={header}>
									{header}
								</TableHead>
							)
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow className="hover:bg-adam-muted/20" key={`skeleton-${i}`}>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-40" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-28" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function EmptyRefunds() {
	return (
		<div className="rounded-lg border border-adam-border bg-white p-8 text-center">
			<p className="text-adam-grey">No refund transactions yet</p>
		</div>
	);
}

function getStatusBadge(status: string) {
	const variants: Record<
		string,
		"default" | "secondary" | "destructive" | "outline"
	> = {
		completed: "default",
		pending: "secondary",
		failed: "destructive",
	};
	return (
		<Badge className="text-xs" variant={variants[status] || "outline"}>
			{status}
		</Badge>
	);
}

export default function PaymentsPage() {
	const queryClient = useQueryClient();
	const [orderId, setOrderId] = useState("");
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	const {
		data: refundsData,
		isLoading: refundsLoading,
		error: refundsError,
	} = useQuery({
		queryKey: ["admin-refunds"],
		queryFn: () => adminPaymentsApi.getRefundHistory(),
		retry: false,
	});

	const refundMutation = useMutation({
		mutationFn: (data: { orderId: string; amount: number; reason: string }) =>
			adminPaymentsApi.initiateRefund(data.orderId, data),
		onSuccess: (data) => {
			toast.success(`Refund initiated successfully. Order: ${data.orderId}`);
			queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
			setOrderId("");
			setAmount("");
			setReason("");
		},
		onError: () => {
			toast.error("Failed to initiate refund");
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!(orderId && amount && reason)) {
			toast.error("Please fill in all fields");
			return;
		}
		refundMutation.mutate({
			orderId,
			amount: Number.parseFloat(amount),
			reason,
		});
	}

	const refunds = refundsData || [];

	return (
		<div className="space-y-6">
			<div className="border-adam-border border-b pb-4">
				<h1 className="font-semibold text-adam-tinted-black text-xl">
					Payments & Refunds
				</h1>
				<p className="mt-0.5 text-adam-grey text-sm">
					Manage refunds and view transaction history
				</p>
			</div>

			<Card className="border-adam-border">
				<CardHeader>
					<CardTitle className="text-base">Initiate Refund</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="orderId">Order ID</Label>
								<Input
									className="border-adam-border focus:border-adam-secondary"
									id="orderId"
									onChange={(e) => setOrderId(e.target.value)}
									placeholder="Enter order ID"
									required
									value={orderId}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="amount">Amount (₹)</Label>
								<Input
									className="border-adam-border focus:border-adam-secondary"
									id="amount"
									onChange={(e) => setAmount(e.target.value)}
									placeholder="Enter refund amount"
									required
									type="number"
									value={amount}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="reason">Reason</Label>
							<Input
								className="border-adam-border focus:border-adam-secondary"
								id="reason"
								onChange={(e) => setReason(e.target.value)}
								placeholder="Enter refund reason"
								required
								value={reason}
							/>
						</div>
						<Button
							className="bg-adam-secondary hover:bg-adam-gradient-top"
							disabled={refundMutation.isPending}
							type="submit"
						>
							{refundMutation.isPending ? "Processing..." : "Initiate Refund"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className="border-adam-border">
				<CardHeader>
					<CardTitle className="text-base">Recent Refunds</CardTitle>
				</CardHeader>
				<CardContent>
					{refundsLoading ? (
						<RefundHistorySkeleton />
					) : refundsError ? (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
							Error loading refunds. Please try again.
						</div>
					) : refunds.length === 0 ? (
						<EmptyRefunds />
					) : (
						<div className="rounded-md border border-adam-border">
							<Table>
								<TableHeader>
									<TableRow className="bg-adam-muted/30 hover:bg-adam-muted/30">
										<TableHead className="font-medium">Order ID</TableHead>
										<TableHead className="text-right font-medium">
											Amount
										</TableHead>
										<TableHead className="font-medium">Reason</TableHead>
										<TableHead className="font-medium">Status</TableHead>
										<TableHead className="font-medium">Processed At</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{refunds.map((refund: RefundHistory) => (
										<TableRow
											className="transition-colors hover:bg-adam-muted/20"
											key={refund.id}
										>
											<TableCell className="font-mono text-sm">
												{refund.orderId}
											</TableCell>
											<TableCell className="text-right font-medium">
												₹{refund.amount.toLocaleString()}
											</TableCell>
											<TableCell className="max-w-[200px] truncate text-sm">
												{refund.reason}
											</TableCell>
											<TableCell>{getStatusBadge(refund.status)}</TableCell>
											<TableCell className="text-adam-grey text-sm">
												{refund.processedAt
													? new Date(refund.processedAt).toLocaleString()
													: "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
