"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
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
	if (status === "success") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (status === "failed") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

function getMetalTypeBadgeStyles(metalType: string) {
	if (metalType === "gold") {
		return "bg-yellow-50 text-yellow-700 border-yellow-200";
	}
	if (metalType === "silver") {
		return "bg-gray-100 text-gray-700 border-gray-300";
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
							"Metal Type",
							"Grams",
							"Price/Gram",
							"Total Amount",
							"Bank Details",
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
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow className="border-adam-border/30" key={i}>
							<TableCell>
								<Skeleton className="h-6 w-16 rounded-full" />
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
								<Skeleton className="h-4 w-32" />
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
					<Coins className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No redemptions found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					This user hasn't made any redemptions yet
				</p>
			</CardContent>
		</Card>
	);
}

export default function RedemptionsTab({ userId }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-redemptions", userId],
		queryFn: () => adminOrdersApi.getRedemptions({ user_id: userId, limit: 100 }),
		retry: false,
	});

	if (isLoading) {
		return <TableSkeleton />;
	}

	if (!data?.redemptions || data.redemptions.length === 0) {
		return <EmptyState />;
	}

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Metal Type
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
							Bank Details
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
					{data.redemptions.map((redemption) => (
						<TableRow
							className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
							key={redemption.id}
						>
							<TableCell>
								<Badge
									className={`border font-medium text-xs ${getMetalTypeBadgeStyles(redemption.metalType)}`}
									variant="outline"
								>
									{redemption.metalType.charAt(0).toUpperCase() +
										redemption.metalType.slice(1)}
								</Badge>
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								{redemption.grams.toFixed(3)} g
							</TableCell>
							<TableCell className="text-right font-medium text-adam-tinted-black text-sm">
								₹{redemption.pricePerGram.toLocaleString("en-IN")}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								₹{redemption.totalAmount.toLocaleString("en-IN")}
							</TableCell>
							<TableCell>
								<div className="space-y-1">
									<p className="font-medium text-adam-tinted-black text-sm">
										{redemption.bankName}
									</p>
									<p className="text-adam-grey text-xs">
										{redemption.accountNumber} • {redemption.ifscCode}
									</p>
									<p className="text-adam-grey text-xs">
										{redemption.accountHolderName}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge
									className={`border font-medium text-xs ${getStatusBadgeStyles(redemption.status)}`}
									variant="outline"
								>
									{redemption.status.charAt(0).toUpperCase() +
										redemption.status.slice(1)}
								</Badge>
								{redemption.failureReason && (
									<p className="mt-1 text-red-600 text-xs">
										{redemption.failureReason}
									</p>
								)}
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								<div className="space-y-1">
									<p>
										Created:{" "}
										{new Date(redemption.createdAt).toLocaleDateString("en-IN", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</p>
									{redemption.processedAt && (
										<p className="text-xs">
											Processed:{" "}
											{new Date(redemption.processedAt).toLocaleDateString(
												"en-IN",
												{
													day: "numeric",
													month: "short",
													year: "numeric",
												}
											)}
										</p>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
