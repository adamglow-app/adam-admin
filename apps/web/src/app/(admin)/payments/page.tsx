"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock,
	CreditCard,
	FileText,
	RefreshCw,
	Search,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{["Order ID", "Amount", "Reason", "Status", "Processed At"].map(
							(header) => (
								<TableHead
									className="font-semibold text-adam-grey text-xs uppercase tracking-wider"
									key={header}
								>
									{header}
								</TableHead>
							)
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => {
						const skeletonKey = `refund-skeleton-${i}`;
						return (
							<TableRow className="border-adam-border/30" key={skeletonKey}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Skeleton className="h-8 w-8 rounded-lg" />
										<Skeleton className="h-4 w-28" />
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-24 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyRefunds() {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<CreditCard className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No refunds yet
				</h3>
				<p className="mt-1 text-center text-adam-grey text-sm">
					Refund transactions will appear here once processed
				</p>
			</CardContent>
		</Card>
	);
}

function getStatusConfig(status: string) {
	if (status === "completed") {
		return {
			icon: CheckCircle2,
			className: "border-emerald-200 bg-emerald-50 text-emerald-700",
			label: "Completed",
		};
	}
	if (status === "pending") {
		return {
			icon: Clock,
			className: "border-amber-200 bg-amber-50 text-amber-700",
			label: "Pending",
		};
	}
	if (status === "failed") {
		return {
			icon: XCircle,
			className: "border-red-200 bg-red-50 text-red-700",
			label: "Failed",
		};
	}
	return {
		icon: Clock,
		className: "border-gray-200 bg-gray-50 text-gray-700",
		label: status,
	};
}

function StatCard({
	title,
	value,
	icon: Icon,
	iconBg,
	iconColor,
}: {
	title: string;
	value: string;
	icon: React.ComponentType<{ className?: string }>;
	iconBg: string;
	iconColor: string;
}) {
	return (
		<Card className="border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
			<CardContent className="flex items-center gap-4 p-5">
				<div
					className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
				>
					<Icon className={`h-6 w-6 ${iconColor}`} />
				</div>
				<div>
					<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
						{title}
					</p>
					<p className="font-bold text-2xl text-adam-tinted-black">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

export default function PaymentsPage() {
	const queryClient = useQueryClient();
	const [orderId, setOrderId] = useState("");
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [search, setSearch] = useState("");

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
	const filteredRefunds = refunds.filter(
		(refund: RefundHistory) =>
			refund.orderId.toLowerCase().includes(search.toLowerCase()) ||
			refund.reason.toLowerCase().includes(search.toLowerCase())
	);

	// Calculate stats
	const totalRefunded = refunds.reduce(
		(sum: number, r: RefundHistory) =>
			r.status === "completed" ? sum + r.amount : sum,
		0
	);
	const pendingCount = refunds.filter(
		(r: RefundHistory) => r.status === "pending"
	).length;
	const completedCount = refunds.filter(
		(r: RefundHistory) => r.status === "completed"
	).length;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Payments & Refunds
				</h1>
				<p className="text-adam-grey text-sm">
					Process refunds and view transaction history
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatCard
					icon={CreditCard}
					iconBg="bg-emerald-50"
					iconColor="text-emerald-600"
					title="Total Refunded"
					value={`₹${totalRefunded.toLocaleString("en-IN")}`}
				/>
				<StatCard
					icon={Clock}
					iconBg="bg-amber-50"
					iconColor="text-amber-600"
					title="Pending"
					value={pendingCount.toString()}
				/>
				<StatCard
					icon={CheckCircle2}
					iconBg="bg-blue-50"
					iconColor="text-blue-600"
					title="Completed"
					value={completedCount.toString()}
				/>
			</div>

			{/* Initiate Refund Card */}
			<Card className="overflow-hidden border-0 shadow-sm">
				<div className="border-adam-border/50 border-b bg-gradient-to-r from-adam-secondary to-adam-gradient-top p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
							<RefreshCw className="h-5 w-5 text-white" />
						</div>
						<div>
							<h2 className="font-semibold text-lg text-white">
								Initiate Refund
							</h2>
							<p className="text-sm text-white/70">
								Process a new refund request
							</p>
						</div>
					</div>
				</div>
				<CardContent className="p-6">
					<form className="space-y-5" onSubmit={handleSubmit}>
						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									className="font-medium text-adam-tinted-black text-sm"
									htmlFor="orderId"
								>
									Order ID
								</Label>
								<Input
									className="h-11 border-adam-border bg-white shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
									id="orderId"
									onChange={(e) => setOrderId(e.target.value)}
									placeholder="Enter order ID"
									required
									value={orderId}
								/>
							</div>
							<div className="space-y-2">
								<Label
									className="font-medium text-adam-tinted-black text-sm"
									htmlFor="amount"
								>
									Amount (₹)
								</Label>
								<Input
									className="h-11 border-adam-border bg-white shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
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
							<Label
								className="font-medium text-adam-tinted-black text-sm"
								htmlFor="reason"
							>
								Reason for Refund
							</Label>
							<Input
								className="h-11 border-adam-border bg-white shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
								id="reason"
								onChange={(e) => setReason(e.target.value)}
								placeholder="Enter the reason for this refund"
								required
								value={reason}
							/>
						</div>
						<Button
							className="h-11 bg-adam-secondary px-6 shadow-sm hover:bg-adam-gradient-top"
							disabled={refundMutation.isPending}
							type="submit"
						>
							{refundMutation.isPending ? (
								<>
									<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									Process Refund
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Recent Refunds */}
			<div>
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="font-semibold text-adam-tinted-black text-lg">
							Recent Refunds
						</h2>
						<p className="text-adam-grey text-sm">
							View and track all refund transactions
						</p>
					</div>
					<div className="relative max-w-xs">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-adam-trailing" />
						<Input
							className="h-10 border-adam-border bg-white pl-10 shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search refunds..."
							value={search}
						/>
					</div>
				</div>

				{refundsLoading && <RefundHistorySkeleton />}

				{refundsError && (
					<Card className="border-0 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
						<CardContent className="flex items-center gap-4 py-6">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
								<AlertCircle className="h-6 w-6 text-red-600" />
							</div>
							<div className="flex-1">
								<p className="font-medium text-red-800">
									Unable to load refunds
								</p>
								<p className="mt-0.5 text-red-600 text-sm">
									There was a problem fetching the refund history.
								</p>
							</div>
							<Button
								className="bg-red-600 text-white hover:bg-red-700"
								onClick={() =>
									queryClient.invalidateQueries({
										queryKey: ["admin-refunds"],
									})
								}
								size="sm"
							>
								Try Again
							</Button>
						</CardContent>
					</Card>
				)}

				{!(refundsLoading || refundsError) && filteredRefunds.length === 0 && (
					<EmptyRefunds />
				)}

				{!(refundsLoading || refundsError) && filteredRefunds.length > 0 && (
					<Card className="overflow-hidden border-0 shadow-sm">
						<Table>
							<TableHeader>
								<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Order ID
									</TableHead>
									<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Amount
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Reason
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Status
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Processed At
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredRefunds.map((refund: RefundHistory) => {
									const statusConfig = getStatusConfig(refund.status);
									const StatusIcon = statusConfig.icon;

									return (
										<TableRow
											className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
											key={refund.id}
										>
											<TableCell className="py-4">
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-adam-scaffold-background">
														<FileText className="h-4 w-4 text-adam-trailing" />
													</div>
													<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-sm">
														{refund.orderId}
													</code>
												</div>
											</TableCell>
											<TableCell className="text-right">
												<span className="font-semibold text-adam-tinted-black">
													₹{refund.amount.toLocaleString("en-IN")}
												</span>
											</TableCell>
											<TableCell>
												<p className="max-w-[200px] truncate text-adam-grey text-sm">
													{refund.reason}
												</p>
											</TableCell>
											<TableCell>
												<Badge
													className={`border font-medium text-xs ${statusConfig.className}`}
													variant="outline"
												>
													<StatusIcon className="mr-1 h-3 w-3" />
													{statusConfig.label}
												</Badge>
											</TableCell>
											<TableCell className="text-adam-grey text-sm">
												{refund.processedAt
													? new Date(refund.processedAt).toLocaleDateString(
															"en-IN",
															{
																day: "numeric",
																month: "short",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															}
														)
													: "-"}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</Card>
				)}
			</div>
		</div>
	);
}
