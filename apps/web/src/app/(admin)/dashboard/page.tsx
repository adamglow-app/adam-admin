"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	ArrowUpRight,
	CreditCard,
	DollarSign,
	Package,
	TrendingUp,
	Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPricesApi } from "@/lib/api/admin/prices";
import { adminProductsApi } from "@/lib/api/admin/products";
import { adminUsersApi } from "@/lib/api/admin/users";

function AnimatedCard({
	children,
	delay,
}: {
	children: React.ReactNode;
	delay: number;
}) {
	return (
		<div
			className="animate-fade-in-up"
			style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
		>
			{children}
		</div>
	);
}

function StatCardSkeleton() {
	return (
		<Card className="border border-adam-border bg-white">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-7 w-16" />
					</div>
					<Skeleton className="h-10 w-10 rounded-lg" />
				</div>
			</CardContent>
		</Card>
	);
}

function StatCard({
	title,
	value,
	icon: Icon,
	iconColor,
	delay,
	isLoading,
}: {
	title: string;
	value: string | number;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	delay: number;
	isLoading: boolean;
}) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}

	return (
		<AnimatedCard delay={delay}>
			<Card className="border border-adam-border bg-white transition-all duration-200 hover:shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-adam-grey text-sm">{title}</p>
							<p className="mt-1 font-semibold text-2xl text-adam-tinted-black">
								{value}
							</p>
						</div>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor}`}
						>
							<Icon className="h-5 w-5" />
						</div>
					</div>
				</CardContent>
			</Card>
		</AnimatedCard>
	);
}

function QuickActionCard({
	title,
	description,
	icon: Icon,
	iconBg,
	iconColor,
	delay,
	href,
}: {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	iconBg: string;
	iconColor: string;
	delay: number;
	href: string;
}) {
	return (
		<AnimatedCard delay={delay}>
			<a
				className="flex items-center gap-3 rounded-lg border border-adam-border bg-white p-4 transition-all duration-200 hover:border-adam-secondary hover:shadow-sm"
				href={href}
			>
				<div
					className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
				>
					<Icon className="h-4 w-4" />
				</div>
				<div className="flex-1">
					<p className="font-medium text-adam-tinted-black text-sm">{title}</p>
					<p className="mt-0.5 text-adam-grey text-xs">{description}</p>
				</div>
				<ArrowUpRight className="h-4 w-4 text-adam-trailing" />
			</a>
		</AnimatedCard>
	);
}

function MetricCard({
	title,
	value,
	icon: Icon,
	iconBg,
	iconColor,
	delay,
	isLoading,
}: {
	title: string;
	value: string;
	icon: React.ComponentType<{ className?: string }>;
	iconBg: string;
	iconColor: string;
	delay: number;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<AnimatedCard delay={delay}>
				<Card className="border border-adam-border bg-white">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-8 rounded-lg" />
							<div className="space-y-1">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-5 w-20" />
							</div>
						</div>
					</CardContent>
				</Card>
			</AnimatedCard>
		);
	}

	return (
		<AnimatedCard delay={delay}>
			<Card className="border border-adam-border bg-white transition-all duration-200 hover:shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
						>
							<Icon className="h-4 w-4" />
						</div>
						<div>
							<p className="text-adam-grey text-xs">{title}</p>
							<p className="font-semibold text-adam-tinted-black text-lg">
								{value}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</AnimatedCard>
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
		<div className="space-y-6">
			<div className="border-adam-border border-b pb-4">
				<h1 className="font-semibold text-adam-tinted-black text-xl">
					Dashboard
				</h1>
				<p className="mt-0.5 text-adam-grey text-sm">
					Overview of your platform
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					delay={100}
					icon={Users}
					iconColor="bg-adam-secondary/10 text-adam-secondary"
					isLoading={usersLoading}
					title="Users"
					value={usersData?.total?.toLocaleString() ?? "0"}
				/>
				<StatCard
					delay={200}
					icon={Package}
					iconColor="bg-amber-100 text-amber-700"
					isLoading={productsLoading}
					title="Products"
					value={productsData?.total?.toLocaleString() ?? "0"}
				/>
				<StatCard
					delay={300}
					icon={DollarSign}
					iconColor="bg-yellow-100 text-yellow-700"
					isLoading={goldLoading}
					title="Gold"
					value={goldPrice ? `₹${goldPrice.toLocaleString()}` : "---"}
				/>
				<StatCard
					delay={400}
					icon={TrendingUp}
					iconColor="bg-slate-100 text-slate-700"
					isLoading={silverLoading}
					title="Silver"
					value={silverPrice ? `₹${silverPrice.toLocaleString()}` : "---"}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<QuickActionCard
					delay={500}
					description="Manage user accounts"
					href="/users"
					icon={Users}
					iconBg="bg-adam-secondary/10"
					iconColor="text-adam-secondary"
					title="Users"
				/>
				<QuickActionCard
					delay={600}
					description="Product catalog"
					href="/products"
					icon={Package}
					iconBg="bg-amber-100"
					iconColor="text-amber-700"
					title="Products"
				/>
				<QuickActionCard
					delay={700}
					description="Process refunds"
					href="/payments"
					icon={CreditCard}
					iconBg="bg-slate-100"
					iconColor="text-slate-700"
					title="Payments"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					delay={800}
					icon={DollarSign}
					iconBg="bg-green-100"
					iconColor="text-green-700"
					isLoading={isLoading}
					title="Revenue"
					value="₹1.24L"
				/>
				<MetricCard
					delay={900}
					icon={Package}
					iconBg="bg-amber-100"
					iconColor="text-amber-700"
					isLoading={isLoading}
					title="Orders"
					value="23"
				/>
				<MetricCard
					delay={1000}
					icon={TrendingUp}
					iconBg="bg-adam-secondary/10"
					iconColor="text-adam-secondary"
					isLoading={isLoading}
					title="Referrals"
					value="156"
				/>
				<MetricCard
					delay={1100}
					icon={Activity}
					iconBg="bg-yellow-100"
					iconColor="text-yellow-700"
					isLoading={isLoading}
					title="Gold Sold"
					value="2.4 kg"
				/>
			</div>
		</div>
	);
}
