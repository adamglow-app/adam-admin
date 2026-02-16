"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
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
import { OrnamentOrdersTable } from "@/components/ornament-orders-table";
import { adminOrdersApi } from "@/lib/api/admin/orders";

interface Props {
	userId: string;
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
	const { data, isLoading } = useQuery({
		queryKey: ["admin-ornament-orders", userId],
		queryFn: () =>
			adminOrdersApi.getOrnamentOrders({ user_id: userId, limit: 100 }),
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
			<OrnamentOrdersTable
				orders={data.orders}
				queryKey={["admin-ornament-orders", userId]}
			/>
		</Card>
	);
}
