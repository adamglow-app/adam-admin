"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminPaymentsApi } from "@/lib/api/admin/payments";

export default function PaymentsPage() {
	const [orderId, setOrderId] = useState("");
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	const refundMutation = useMutation({
		mutationFn: (data: { orderId: string; amount: number; reason: string }) =>
			adminPaymentsApi.initiateRefund(data.orderId, data),
		onSuccess: (data) => {
			toast.success(`Refund initiated successfully. Order: ${data.orderId}`);
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

	return (
		<div className="space-y-8">
			<h1 className="font-bold text-3xl">Payments & Refunds</h1>

			<Card>
				<CardHeader>
					<CardTitle>Initiate Refund</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="orderId">Order ID</Label>
								<Input
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
								id="reason"
								onChange={(e) => setReason(e.target.value)}
								placeholder="Enter refund reason"
								required
								value={reason}
							/>
						</div>
						<Button disabled={refundMutation.isPending} type="submit">
							{refundMutation.isPending ? "Processing..." : "Initiate Refund"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recent Refunds</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Recent refund transactions will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
