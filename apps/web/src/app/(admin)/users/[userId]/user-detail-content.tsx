"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminUsersApi } from "@/lib/api/admin/users";
import GoldPurchasesTab from "./tabs/GoldPurchasesTab";
import OrnamentOrdersTab from "./tabs/OrnamentOrdersTab";
import RedemptionsTab from "./tabs/RedemptionsTab";
import SilverPurchasesTab from "./tabs/SilverPurchasesTab";
import WalletTransactionsTab from "./tabs/WalletTransactionsTab";

function getKycBadgeStyles(status: string) {
	if (status === "verified") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (status === "rejected") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

export function UserDetailContent({ userId }: { userId: string }) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("gold-purchases");

	const { data: user, isLoading: userLoading } = useQuery({
		queryKey: ["admin-user", userId],
		queryFn: () => adminUsersApi.getById(userId),
		retry: false,
	});

	if (userLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-adam-secondary" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="space-y-6">
				<Button
					className="flex items-center gap-2"
					onClick={() => router.back()}
					variant="outline"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<Card className="border-0 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
					<CardContent className="py-4">
						<p className="font-medium text-red-800">User not found</p>
						<p className="mt-1 text-red-600 text-sm">
							The user you are looking for does not exist.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					className="flex items-center gap-2"
					onClick={() => router.back()}
					variant="outline"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<div className="flex-1">
					<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
						{user.firstName} {user.lastName}
					</h1>
					<p className="text-adam-grey text-sm">{user.email}</p>
				</div>
			</div>

			{/* User Info Card */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">User Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<div>
							<p className="text-adam-grey text-sm">Phone Number</p>
							<p className="mt-1 font-medium text-adam-tinted-black">
								{user.phoneNumber || "-"}
							</p>
						</div>
						<div>
							<p className="text-adam-grey text-sm">KYC Status</p>
							<div className="mt-1">
								<Badge
									className={`border font-medium text-xs ${getKycBadgeStyles(user.kycStatus ?? "pending")}`}
									variant="outline"
								>
									{user.kycStatus
										? user.kycStatus.charAt(0).toUpperCase() +
											user.kycStatus.slice(1)
										: "Pending"}
								</Badge>
							</div>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Gold Balance</p>
							<p className="mt-1 font-semibold text-adam-tinted-black">
								{(() => {
									const goldValue =
										user.balances?.goldGrams ??
										user.balances?.gold ??
										user.goldBalance ??
										null;
									return goldValue !== null
										? `${Number(goldValue).toFixed(3)} g`
										: "-";
								})()}
							</p>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Silver Balance</p>
							<p className="mt-1 font-semibold text-adam-tinted-black">
								{(() => {
									const silverValue =
										user.balances?.silverGrams ??
										user.balances?.silver ??
										user.silverBalance ??
										null;
									return silverValue !== null
										? `${Number(silverValue).toFixed(3)} g`
										: "-";
								})()}
							</p>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Referral Code</p>
							<p className="mt-1">
								{user.referralCode ? (
									<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-xs">
										{user.referralCode}
									</code>
								) : (
									<span className="text-adam-trailing text-sm">-</span>
								)}
							</p>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Joined</p>
							<p className="mt-1 font-medium text-adam-tinted-black">
								{new Date(user.createdAt).toLocaleDateString("en-IN", {
									day: "numeric",
									month: "short",
									year: "numeric",
								})}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="gold-purchases">Gold Purchases</TabsTrigger>
					<TabsTrigger value="silver-purchases">Silver Purchases</TabsTrigger>
					<TabsTrigger value="ornament-orders">Ornament Orders</TabsTrigger>
					<TabsTrigger value="wallet-transactions">
						Wallet Transactions
					</TabsTrigger>
					<TabsTrigger value="redemptions">Redemptions</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="gold-purchases">
					<GoldPurchasesTab userId={userId} />
				</TabsContent>

				<TabsContent className="mt-6" value="silver-purchases">
					<SilverPurchasesTab userId={userId} />
				</TabsContent>

				<TabsContent className="mt-6" value="ornament-orders">
					<OrnamentOrdersTab userId={userId} />
				</TabsContent>

				<TabsContent className="mt-6" value="wallet-transactions">
					<WalletTransactionsTab userId={userId} />
				</TabsContent>

				<TabsContent className="mt-6" value="redemptions">
					<RedemptionsTab userId={userId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
