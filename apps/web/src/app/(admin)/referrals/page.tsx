"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Gift, Percent, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminReferralsApi } from "@/lib/api/admin/referrals";
import type { ReferralConfig } from "@/lib/api/types";

function ConfigCardSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<CardContent className="p-6">
				<div className="mb-6 flex items-center gap-3">
					<Skeleton className="h-12 w-12 rounded-xl" />
					<div className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-3 w-48" />
					</div>
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-11 w-full max-w-xs rounded-lg" />
				</div>
			</CardContent>
		</Card>
	);
}

function ReferralCard({
	metalType,
	config,
	onSave,
	isLoading,
	isSaving,
}: {
	metalType: "gold" | "silver";
	config?: ReferralConfig;
	onSave: (data: ReferralConfig) => void;
	isLoading: boolean;
	isSaving: boolean;
}) {
	const [rewardPercentage, setRewardPercentage] = useState("");
	const [welcomeBonus, setWelcomeBonus] = useState("");

	useEffect(() => {
		if (config) {
			const percentage =
				typeof config.rewardPercentage === "string"
					? config.rewardPercentage
					: (config.rewardPercentage?.toString() ?? "");
			setRewardPercentage(percentage);

			const bonus =
				typeof config.welcomeBonus === "string"
					? config.welcomeBonus
					: (config.welcomeBonus?.toString() ?? "");
			setWelcomeBonus(bonus);
		}
	}, [config]);

	function handleSubmit() {
		onSave({
			metalType,
			rewardPercentage: Number.parseFloat(rewardPercentage) || 0,
			welcomeBonus: Number.parseFloat(welcomeBonus) || 0,
		});
	}

	const isGold = metalType === "gold";

	if (isLoading) {
		return <ConfigCardSkeleton />;
	}

	return (
		<Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
			{/* Decorative gradient overlay */}
			<div
				className={`absolute inset-0 opacity-[0.02] ${
					isGold
						? "bg-gradient-to-br from-amber-400 to-yellow-600"
						: "bg-gradient-to-br from-slate-400 to-gray-600"
				}`}
			/>

			<CardContent className="relative p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
								isGold
									? "bg-gradient-to-br from-amber-100 to-yellow-50"
									: "bg-gradient-to-br from-slate-100 to-gray-50"
							}`}
						>
							{isGold ? (
								<Coins className="h-6 w-6 text-amber-600" />
							) : (
								<Sparkles className="h-6 w-6 text-slate-500" />
							)}
						</div>
						<div>
							<h3 className="font-semibold text-adam-tinted-black text-lg capitalize">
								{metalType} Referrals
							</h3>
							<p className="text-adam-grey text-sm">
								Configure reward percentage for {metalType} referrals
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{config?.isActive && (
							<Badge
								className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700 text-xs"
								variant="outline"
							>
								Active
							</Badge>
						)}
						<Badge
							className={`border font-medium text-xs ${
								isGold
									? "border-amber-200 bg-amber-50 text-amber-700"
									: "border-slate-200 bg-slate-50 text-slate-700"
							}`}
							variant="outline"
						>
							{isGold ? "24K Premium" : "999 Fine"}
						</Badge>
					</div>
				</div>

				{/* Reward Percentage Field */}
				<div className="max-w-xs space-y-2">
					<Label className="flex items-center gap-2 font-medium text-adam-tinted-black text-sm">
						<Percent className="h-4 w-4 text-adam-trailing" />
						Reward Percentage
					</Label>
					<div className="relative">
						<Input
							className="h-11 border-adam-border bg-white pr-10 shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
							onChange={(e) => setRewardPercentage(e.target.value)}
							placeholder="0.00"
							step="0.01"
							type="number"
							value={rewardPercentage}
						/>
						<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-medium text-adam-grey text-sm">
							%
						</span>
					</div>
					<p className="text-adam-trailing text-xs">
						Percentage of investment given as referral reward
					</p>
				</div>

				{/* Welcome Bonus Field */}
				<div className="mt-6 max-w-xs space-y-2">
					<Label className="flex items-center gap-2 font-medium text-adam-tinted-black text-sm">
						<Gift className="h-4 w-4 text-adam-trailing" />
						Welcome Bonus (₹)
					</Label>
					<div className="relative">
						<Input
							className="h-11 border-adam-border bg-white pr-10 shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
							onChange={(e) => setWelcomeBonus(e.target.value)}
							placeholder="0"
							step="1"
							type="number"
							value={welcomeBonus}
						/>
						<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-medium text-adam-grey text-sm">
							₹
						</span>
					</div>
					<p className="text-adam-trailing text-xs">
						One-time bonus for new users joining with a referrer code
					</p>
				</div>

				{/* Action Button */}
				<div className="mt-6 flex items-center justify-between border-adam-border/50 border-t pt-6">
					<p className="text-adam-trailing text-xs">
						Changes will take effect immediately after saving
					</p>
					<Button
						className="bg-adam-secondary px-6 shadow-sm hover:bg-adam-gradient-top"
						disabled={isSaving}
						onClick={handleSubmit}
					>
						{isSaving ? (
							<>
								<Save className="mr-2 h-4 w-4 animate-pulse" />
								Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function InfoCard() {
	return (
		<Card className="border-0 bg-gradient-to-br from-adam-secondary to-adam-gradient-top shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
						<Gift className="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-lg text-white">
							How Referrals Work
						</h3>
						<p className="mt-1 text-sm text-white/80">
							When a user refers someone and the referee makes an investment,
							both parties receive a percentage-based reward automatically based
							on the configured reward percentage.
						</p>
						<div className="mt-4 grid gap-3 sm:grid-cols-3">
							<div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
								<p className="font-semibold text-2xl text-white">1</p>
								<p className="text-sm text-white/70">User shares code</p>
							</div>
							<div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
								<p className="font-semibold text-2xl text-white">2</p>
								<p className="text-sm text-white/70">Referee invests</p>
							</div>
							<div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
								<p className="font-semibold text-2xl text-white">3</p>
								<p className="text-sm text-white/70">Both get rewards</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function ReferralsPage() {
	const queryClient = useQueryClient();

	const { data: goldConfig, isLoading: goldLoading } = useQuery({
		queryKey: ["admin-referrals-gold"],
		queryFn: () => adminReferralsApi.getConfig("gold"),
		retry: false,
	});

	const { data: silverConfig, isLoading: silverLoading } = useQuery({
		queryKey: ["admin-referrals-silver"],
		queryFn: () => adminReferralsApi.getConfig("silver"),
		retry: false,
	});

	const goldMutation = useMutation({
		mutationFn: (data: ReferralConfig) => adminReferralsApi.setConfig(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-referrals-gold"] });
			toast.success("Gold referral configuration saved");
		},
		onError: () => {
			toast.error("Failed to save gold referral configuration");
		},
	});

	const silverMutation = useMutation({
		mutationFn: (data: ReferralConfig) => adminReferralsApi.setConfig(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-referrals-silver"] });
			toast.success("Silver referral configuration saved");
		},
		onError: () => {
			toast.error("Failed to save silver referral configuration");
		},
	});

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Referral Configuration
				</h1>
				<p className="text-adam-grey text-sm">
					Manage referral reward percentages for gold and silver investments
				</p>
			</div>

			{/* Info Card */}
			<InfoCard />

			{/* Configuration Tabs */}
			<Tabs className="w-full" defaultValue="gold">
				<TabsList className="mb-6 h-12 w-fit gap-1 rounded-xl border border-adam-border bg-white p-1">
					<TabsTrigger
						className="rounded-lg px-6 py-2.5 font-medium text-sm data-[state=active]:bg-adam-secondary data-[state=active]:text-white data-[state=active]:shadow-sm"
						value="gold"
					>
						<Coins className="mr-2 h-4 w-4" />
						Gold Configuration
					</TabsTrigger>
					<TabsTrigger
						className="rounded-lg px-6 py-2.5 font-medium text-sm data-[state=active]:bg-adam-secondary data-[state=active]:text-white data-[state=active]:shadow-sm"
						value="silver"
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Silver Configuration
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-0" value="gold">
					<ReferralCard
						config={goldConfig}
						isLoading={goldLoading}
						isSaving={goldMutation.isPending}
						metalType="gold"
						onSave={(data) => goldMutation.mutate(data)}
					/>
				</TabsContent>

				<TabsContent className="mt-0" value="silver">
					<ReferralCard
						config={silverConfig}
						isLoading={silverLoading}
						isSaving={silverMutation.isPending}
						metalType="silver"
						onSave={(data) => silverMutation.mutate(data)}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
