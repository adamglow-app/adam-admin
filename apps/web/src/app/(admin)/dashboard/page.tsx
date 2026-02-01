"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowDownRight,
	ArrowRight,
	ArrowUpRight,
	BarChart3,
	Coins,
	CreditCard,
	Package,
	TrendingUp,
	Users,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPricesApi } from "@/lib/api/admin/prices";
import { adminProductsApi } from "@/lib/api/admin/products";
import { adminUsersApi } from "@/lib/api/admin/users";

function getTrendStyles(trend: "up" | "down" | "neutral") {
	if (trend === "up") {
		return "bg-emerald-50 text-emerald-600";
	}
	if (trend === "down") {
		return "bg-red-50 text-red-600";
	}
	return "bg-gray-50 text-gray-600";
}

function getTrendIcon(trend: "up" | "down" | "neutral") {
	if (trend === "up") {
		return <ArrowUpRight className="h-3 w-3" />;
	}
	if (trend === "down") {
		return <ArrowDownRight className="h-3 w-3" />;
	}
	return null;
}

function StatCardSkeleton() {
	return (
		<Card className="overflow-hidden border-0 bg-white shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-3">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-3 w-32" />
					</div>
					<Skeleton className="h-12 w-12 rounded-xl" />
				</div>
			</CardContent>
		</Card>
	);
}

function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	iconBg,
	iconColor,
	trend,
	trendValue,
	isLoading,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ComponentType<{ className?: string }>;
	iconBg: string;
	iconColor: string;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
	isLoading: boolean;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}

	return (
		<Card className="group overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<p className="font-medium text-adam-grey text-sm">{title}</p>
						<p className="font-bold text-3xl text-adam-tinted-black tracking-tight">
							{value}
						</p>
						{(subtitle || trendValue) && (
							<div className="flex items-center gap-2 pt-1">
								{trend && trendValue && (
									<span
										className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium text-xs ${getTrendStyles(trend)}`}
									>
										{getTrendIcon(trend)}
										{trendValue}
									</span>
								)}
								{subtitle && (
									<span className="text-adam-trailing text-xs">{subtitle}</span>
								)}
							</div>
						)}
					</div>
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}
					>
						<Icon className={`h-6 w-6 ${iconColor}`} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function QuickActionCard({
	title,
	description,
	icon: Icon,
	href,
	gradient,
}: {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	gradient: string;
}) {
	return (
		<Link
			className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			href={href}
			style={{
				background: gradient,
			}}
		>
			<div className="relative z-10">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
					<Icon className="h-6 w-6 text-white" />
				</div>
				<h3 className="font-semibold text-lg">{title}</h3>
				<p className="mt-1 text-sm text-white/80">{description}</p>
				<div className="mt-4 flex items-center gap-2 font-medium text-sm">
					<span>View details</span>
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</div>
			</div>
			<div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-white/10" />
			<div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-white/10" />
		</Link>
	);
}

function MetricCard({
	title,
	value,
	icon: Icon,
	iconBg,
	iconColor,
	isLoading,
}: {
	title: string;
	value: string;
	icon: React.ComponentType<{ className?: string }>;
	iconBg: string;
	iconColor: string;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<Card className="border-0 bg-white shadow-sm">
				<CardContent className="flex items-center gap-4 p-5">
					<Skeleton className="h-11 w-11 rounded-xl" />
					<div className="space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-6 w-20" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
			<CardContent className="flex items-center gap-4 p-5">
				<div
					className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
				>
					<Icon className={`h-5 w-5 ${iconColor}`} />
				</div>
				<div>
					<p className="font-medium text-adam-grey text-xs uppercase tracking-wide">
						{title}
					</p>
					<p className="font-bold text-adam-tinted-black text-xl">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

export default function DashboardPage() {
	const { data: usersData, isLoading: usersLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => adminUsersApi.list({ limit: 1 }),
		retry: false,
	});

	const { data: productsData, isLoading: productsLoading } = useQuery({
		queryKey: ["admin-products"],
		queryFn: () => adminProductsApi.list({ limit: 1 }),
		retry: false,
	});

	const { data: goldPriceData, isLoading: goldLoading } = useQuery({
		queryKey: ["admin-price-gold"],
		queryFn: () => adminPricesApi.getGoldPrice(),
		retry: false,
	});

	const { data: silverPriceData, isLoading: silverLoading } = useQuery({
		queryKey: ["admin-price-silver"],
		queryFn: () => adminPricesApi.getSilverPrice(),
		retry: false,
	});

	const isLoading =
		usersLoading || productsLoading || goldLoading || silverLoading;

	const goldPrice = goldPriceData?.pricePerGram;
	const silverPrice = silverPriceData?.pricePerGram;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Dashboard
				</h1>
				<p className="text-adam-grey text-sm">
					Welcome back! Here&apos;s what&apos;s happening with your business.
				</p>
			</div>

			{/* Main Stats Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={Users}
					iconBg="bg-blue-50"
					iconColor="text-blue-600"
					isLoading={usersLoading}
					subtitle="Total registered"
					title="Total Users"
					trend="up"
					trendValue="+12%"
					value={usersData?.total?.toLocaleString() ?? "0"}
				/>
				<StatCard
					icon={Package}
					iconBg="bg-amber-50"
					iconColor="text-amber-600"
					isLoading={productsLoading}
					subtitle="Active listings"
					title="Products"
					trend="neutral"
					trendValue="0%"
					value={productsData?.total?.toLocaleString() ?? "0"}
				/>
				<StatCard
					icon={Coins}
					iconBg="bg-yellow-50"
					iconColor="text-yellow-600"
					isLoading={goldLoading}
					subtitle="per gram (24K)"
					title="Gold Price"
					trend="up"
					trendValue="+0.8%"
					value={goldPrice ? `₹${goldPrice.toLocaleString()}` : "---"}
				/>
				<StatCard
					icon={TrendingUp}
					iconBg="bg-slate-100"
					iconColor="text-slate-600"
					isLoading={silverLoading}
					subtitle="per gram"
					title="Silver Price"
					trend="down"
					trendValue="-0.3%"
					value={silverPrice ? `₹${silverPrice.toLocaleString()}` : "---"}
				/>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="mb-4 font-semibold text-adam-tinted-black text-lg">
					Quick Actions
				</h2>
				<div className="grid gap-6 md:grid-cols-3">
					<QuickActionCard
						description="View and manage customer accounts, KYC status, and balances"
						gradient="linear-gradient(135deg, #0f766e 0%, #0d9488 100%)"
						href="/users"
						icon={Users}
						title="Manage Users"
					/>
					<QuickActionCard
						description="Add, edit, or remove products from your catalog"
						gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
						href="/products"
						icon={Package}
						title="Product Catalog"
					/>
					<QuickActionCard
						description="Process refunds and view transaction history"
						gradient="linear-gradient(135deg, #475569 0%, #64748b 100%)"
						href="/payments"
						icon={CreditCard}
						title="Payments"
					/>
				</div>
			</div>

			{/* Bottom Metrics */}
			<div>
				<h2 className="mb-4 font-semibold text-adam-tinted-black text-lg">
					Key Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						icon={Wallet}
						iconBg="bg-emerald-50"
						iconColor="text-emerald-600"
						isLoading={isLoading}
						title="Revenue"
						value="₹1.24L"
					/>
					<MetricCard
						icon={Package}
						iconBg="bg-orange-50"
						iconColor="text-orange-600"
						isLoading={isLoading}
						title="Orders"
						value="23"
					/>
					<MetricCard
						icon={Users}
						iconBg="bg-teal-50"
						iconColor="text-teal-600"
						isLoading={isLoading}
						title="Referrals"
						value="156"
					/>
					<MetricCard
						icon={BarChart3}
						iconBg="bg-yellow-50"
						iconColor="text-yellow-600"
						isLoading={isLoading}
						title="Gold Sold"
						value="2.4 kg"
					/>
				</div>
			</div>
		</div>
	);
}
