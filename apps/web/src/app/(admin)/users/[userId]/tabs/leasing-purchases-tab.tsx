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
	const skeletonIds = ["skel-leasing-1", "skel-leasing-2", "skel-leasing-3"];
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"Leasing Number",
							"Amount",
							"Currency",
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
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-12" />
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
					No leasing purchases found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					This user hasn't made any leasing purchases yet
				</p>
			</CardContent>
		</Card>
	);
}

export default function LeasingPurchasesTab({ userId }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-leasing-purchases", userId],
		queryFn: () =>
			adminOrdersApi.getLeasings({ user_id: userId, limit: 100 }),
		retry: false,
	});

	if (isLoading) {
		return <TableSkeleton />;
	}

	if (!data?.leasings || data.leasings.length === 0) {
		return <EmptyState />;
	}

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Leasing Number
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Amount
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Currency
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
					{data.leasings.map((leasing) => (
						<TableRow
							className="border-adam-border/30"
							key={leasing.id}
						>
							<TableCell className="font-medium text-adam-tinted-black">
								{leasing.leasingNumber}
							</TableCell>
							<TableCell className="text-right font-medium text-adam-tinted-black">
								{Number(leasing.amount).toFixed(2)}
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								{leasing.currency}
							</TableCell>
							<TableCell>
								<Badge
									className={`border font-medium text-xs ${getStatusBadgeStyles(leasing.status)}`}
									variant="outline"
								>
									{leasing.status
										.charAt(0)
										.toUpperCase() +
										leasing.status.slice(1)}
								</Badge>
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								{new Date(leasing.createdAt).toLocaleDateString(
									"en-IN",
									{
										day: "numeric",
										month: "short",
										year: "numeric",
									}
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
