"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPricesApi } from "@/lib/api/admin/prices";
import { adminProductsApi } from "@/lib/api/admin/products";
import { adminUsersApi } from "@/lib/api/admin/users";

function StatCard({
	title,
	value,
	icon: Icon,
}: {
	title: string;
	value: string | number;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
			</CardContent>
		</Card>
	);
}

function StatCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-16" />
			</CardContent>
		</Card>
	);
}

function UserStat({
	data,
	isLoading,
	error,
}: {
	data?: { total?: number };
	isLoading: boolean;
	error: unknown;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}
	if (error) {
		return <StatCard icon={Users} title="Total Users" value="Error" />;
	}
	return <StatCard icon={Users} title="Total Users" value={data?.total ?? 0} />;
}

function ProductStat({
	data,
	isLoading,
	error,
}: {
	data?: { total?: number };
	isLoading: boolean;
	error: unknown;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}
	if (error) {
		return <StatCard icon={Package} title="Total Products" value="Error" />;
	}
	return (
		<StatCard icon={Package} title="Total Products" value={data?.total ?? 0} />
	);
}

function GoldPriceStat({
	data,
	isLoading,
	error,
}: {
	data?: Array<{ metalType?: string; sellPrice?: number }>;
	isLoading: boolean;
	error: unknown;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}
	if (error) {
		return (
			<StatCard icon={DollarSign} title="Gold Price (per gram)" value="---" />
		);
	}
	const goldPrice = data?.find((p) => p?.metalType === "gold")?.sellPrice;
	if (goldPrice === undefined) {
		return (
			<StatCard icon={DollarSign} title="Gold Price (per gram)" value="---" />
		);
	}
	return (
		<StatCard
			icon={DollarSign}
			title="Gold Price (per gram)"
			value={`₹${goldPrice}`}
		/>
	);
}

function SilverPriceStat({
	data,
	isLoading,
	error,
}: {
	data?: Array<{ metalType?: string; sellPrice?: number }>;
	isLoading: boolean;
	error: unknown;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}
	if (error) {
		return (
			<StatCard icon={TrendingUp} title="Silver Price (per gram)" value="---" />
		);
	}
	const silverPrice = data?.find((p) => p?.metalType === "silver")?.sellPrice;
	if (silverPrice === undefined) {
		return (
			<StatCard icon={TrendingUp} title="Silver Price (per gram)" value="---" />
		);
	}
	return (
		<StatCard
			icon={TrendingUp}
			title="Silver Price (per gram)"
			value={`₹${silverPrice}`}
		/>
	);
}

export default function DashboardPage() {
	const {
		data: usersData,
		isLoading: usersLoading,
		error: usersError,
	} = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => adminUsersApi.list({ limit: 1 }),
		retry: false,
	});

	const {
		data: productsData,
		isLoading: productsLoading,
		error: productsError,
	} = useQuery({
		queryKey: ["admin-products"],
		queryFn: () => adminProductsApi.list({ limit: 1 }),
		retry: false,
	});

	const {
		data: pricesData,
		isLoading: pricesLoading,
		error: pricesError,
	} = useQuery({
		queryKey: ["admin-prices-latest"],
		queryFn: () => adminPricesApi.getLatest(),
		retry: false,
	});

	return (
		<div className="space-y-8">
			<h1 className="font-bold text-3xl">Dashboard</h1>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<UserStat
					data={usersData}
					error={usersError}
					isLoading={usersLoading}
				/>
				<ProductStat
					data={productsData}
					error={productsError}
					isLoading={productsLoading}
				/>
				<GoldPriceStat
					data={pricesData}
					error={pricesError}
					isLoading={pricesLoading}
				/>
				<SilverPriceStat
					data={pricesData}
					error={pricesError}
					isLoading={pricesLoading}
				/>
			</div>
		</div>
	);
}
