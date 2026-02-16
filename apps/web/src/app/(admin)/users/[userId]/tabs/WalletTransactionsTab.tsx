"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
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

function getTransactionTypeBadgeStyles(type: string) {
	if (type === "credit") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (type === "debit") {
		return "bg-red-50 text-red-700 border-red-200";
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
							"Type",
							"Category",
							"Amount",
							"Balance Before",
							"Balance After",
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
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow className="border-adam-border/30" key={i}>
							<TableCell>
								<Skeleton className="h-6 w-16 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-48" />
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
					<Wallet className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No wallet transactions found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					This user hasn't made any wallet transactions yet
				</p>
			</CardContent>
		</Card>
	);
}

export default function WalletTransactionsTab({ userId }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-wallet-transactions", userId],
		queryFn: () =>
			adminOrdersApi.getWalletTransactions({ user_id: userId, limit: 100 }),
		retry: false,
	});

	if (isLoading) {
		return <TableSkeleton />;
	}

	if (!data?.transactions || data.transactions.length === 0) {
		return <EmptyState />;
	}

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Type
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Category
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Amount
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Balance Before
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Balance After
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
					{data.transactions.map((transaction) => (
						<TableRow
							className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
							key={transaction.id}
						>
							<TableCell>
								<div className="flex items-center gap-2">
									{transaction.transactionType === "credit" ? (
										<ArrowDownLeft className="h-4 w-4 text-emerald-600" />
									) : (
										<ArrowUpRight className="h-4 w-4 text-red-600" />
									)}
									<Badge
										className={`border font-medium text-xs ${getTransactionTypeBadgeStyles(transaction.transactionType)}`}
										variant="outline"
									>
										{transaction.transactionType.charAt(0).toUpperCase() +
											transaction.transactionType.slice(1)}
									</Badge>
								</div>
							</TableCell>
							<TableCell className="font-medium text-adam-tinted-black text-sm">
								{transaction.transactionCategory}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								₹{transaction.amount.toLocaleString("en-IN")}
							</TableCell>
							<TableCell className="text-right text-adam-grey text-sm">
								₹{transaction.balanceBefore.toLocaleString("en-IN")}
							</TableCell>
							<TableCell className="text-right font-semibold text-adam-tinted-black text-sm">
								₹{transaction.balanceAfter.toLocaleString("en-IN")}
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								{transaction.description}
							</TableCell>
							<TableCell className="text-adam-grey text-sm">
								{new Date(transaction.createdAt).toLocaleDateString("en-IN", {
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
