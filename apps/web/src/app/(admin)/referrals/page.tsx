"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminReferralsApi } from "@/lib/api/admin/referrals";
import type { ReferralConfig } from "@/lib/api/types";

function ConfigField({
	label,
	value,
	onChange,
	disabled,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}) {
	return (
		<div className="space-y-1.5">
			<Label className="text-gray-600 text-xs">{label}</Label>
			<Input
				className="text-sm"
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
				type="number"
				value={value}
			/>
		</div>
	);
}

function ReferralCard({
	metalType,
	config,
	onSave,
	isLoading,
}: {
	metalType: string;
	config?: ReferralConfig;
	onSave: (data: ReferralConfig) => void;
	isLoading: boolean;
}) {
	const [referrerBonus, setReferrerBonus] = useState(
		config?.referrerBonus?.toString() ?? ""
	);
	const [refereeBonus, setRefereeBonus] = useState(
		config?.refereeBonus?.toString() ?? ""
	);
	const [minInvestment, setMinInvestment] = useState(
		config?.minInvestment?.toString() ?? ""
	);

	function handleSubmit() {
		onSave({
			metalType: metalType as "gold" | "silver",
			referrerBonus: Number.parseFloat(referrerBonus) || 0,
			refereeBonus: Number.parseFloat(refereeBonus) || 0,
			minInvestment: Number.parseFloat(minInvestment) || 0,
		});
	}

	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-4">
				<div className="mb-4">
					<h3 className="font-medium text-gray-900 capitalize">
						{metalType} Referral
					</h3>
					<p className="mt-0.5 text-gray-500 text-xs">
						Configure referral bonuses for {metalType} investments
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<ConfigField
						label="Referrer Bonus (₹)"
						onChange={setReferrerBonus}
						value={referrerBonus}
					/>
					<ConfigField
						label="Referee Bonus (₹)"
						onChange={setRefereeBonus}
						value={refereeBonus}
					/>
					<ConfigField
						label="Min Investment (₹)"
						onChange={setMinInvestment}
						value={minInvestment}
					/>
				</div>
				<div className="mt-4 flex justify-end">
					<Button
						className="text-sm"
						disabled={isLoading}
						onClick={handleSubmit}
						size="sm"
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
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
		<div className="space-y-6">
			<div className="border-gray-200 border-b pb-4">
				<h1 className="font-semibold text-gray-900 text-xl">
					Referral Configuration
				</h1>
				<p className="mt-0.5 text-gray-500 text-sm">
					Manage referral bonus settings
				</p>
			</div>

			<Tabs className="w-full" defaultValue="gold">
				<TabsList className="h-9 w-fit gap-1 border border-gray-200 bg-gray-50 p-0.5">
					<TabsTrigger
						className="px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
						value="gold"
					>
						Gold
					</TabsTrigger>
					<TabsTrigger
						className="px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
						value="silver"
					>
						Silver
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-4" value="gold">
					{goldLoading ? (
						<Card className="border border-gray-200 bg-white">
							<CardContent className="p-4">
								<div className="grid gap-4 md:grid-cols-3">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</CardContent>
						</Card>
					) : (
						<ReferralCard
							config={goldConfig}
							isLoading={goldMutation.isPending}
							metalType="gold"
							onSave={(data) => goldMutation.mutate(data)}
						/>
					)}
				</TabsContent>

				<TabsContent className="mt-4" value="silver">
					{silverLoading ? (
						<Card className="border border-gray-200 bg-white">
							<CardContent className="p-4">
								<div className="grid gap-4 md:grid-cols-3">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</CardContent>
						</Card>
					) : (
						<ReferralCard
							config={silverConfig}
							isLoading={silverMutation.isPending}
							metalType="silver"
							onSave={(data) => silverMutation.mutate(data)}
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
