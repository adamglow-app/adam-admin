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
		<div className="rounded-md border border-adam-border shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 border-b bg-white">
						{["Order ID", "Amount", "Reason", "Status", "Processed At"].map(
							(header) => (
								<TableHead className="font-semibold" key={header}>
									{header}
								</TableHead>
							)
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow
							className="border-adam-border/30 border-b hover:bg-adam-secondary/5"
							key={`skeleton-${i}`}
						>
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
						<Card className="border border-red-200 bg-red-50">
							<CardContent className="flex flex-col items-center justify-center p-8">
								<div className="rounded-full bg-red-100 p-3">
									<svg
										className="h-6 w-6 text-red-600"
										fill="none"
										height="24"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										width="24"
									>
										<path
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
								<p className="mt-4 font-medium text-red-800">
									Unable to load refunds
								</p>
								<p className="mt-1 text-red-600 text-sm">
									There was a problem fetching the refund history.
								</p>
								<Button
									className="mt-4 bg-red-600 text-white hover:bg-red-700"
									onClick={() =>
										queryClient.invalidateQueries({
											queryKey: ["admin-refunds"],
										})
									}
									variant="outline"
								>
									Try Again
								</Button>
							</CardContent>
						</Card>
					) : refunds.length === 0 ? (
						<EmptyRefunds />
					) : (
						<div className="rounded-md border border-adam-border shadow-sm">
							<Table>
								<TableHeader>
									<TableRow className="border-adam-border/30 border-b bg-white">
										<TableHead className="font-semibold">Order ID</TableHead>
										<TableHead className="text-right font-semibold">
											Amount
										</TableHead>
										<TableHead className="font-semibold">Reason</TableHead>
										<TableHead className="font-semibold">Status</TableHead>
										<TableHead className="font-semibold">
											Processed At
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{refunds.map((refund: RefundHistory) => (
										<TableRow
											className="border-adam-border/30 border-b hover:bg-adam-secondary/5"
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
