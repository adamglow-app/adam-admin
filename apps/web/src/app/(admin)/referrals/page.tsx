"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminReferralsApi } from "@/lib/api/admin/referrals";
import type { ReferralConfig } from "@/lib/api/types";

function ReferralConfigForm({
	metalType,
	initialData,
	onSubmit,
	isLoading,
}: {
	metalType: string;
	initialData?: ReferralConfig;
	onSubmit: (data: ReferralConfig) => void;
	isLoading: boolean;
}) {
	const [referrerBonus, setReferrerBonus] = useState(
		initialData?.referrerBonus?.toString() ?? ""
	);
	const [refereeBonus, setRefereeBonus] = useState(
		initialData?.refereeBonus?.toString() ?? ""
	);
	const [minInvestment, setMinInvestment] = useState(
		initialData?.minInvestment?.toString() ?? ""
	);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onSubmit({
			metalType: metalType as "gold" | "silver",
			referrerBonus: Number.parseFloat(referrerBonus) || 0,
			refereeBonus: Number.parseFloat(refereeBonus) || 0,
			minInvestment: Number.parseFloat(minInvestment) || 0,
		});
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor={`${metalType}-referrer`}>Referrer Bonus (₹)</Label>
					<Input
						id={`${metalType}-referrer`}
						onChange={(e) => setReferrerBonus(e.target.value)}
						required
						type="number"
						value={referrerBonus}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`${metalType}-referee`}>Referee Bonus (₹)</Label>
					<Input
						id={`${metalType}-referee`}
						onChange={(e) => setRefereeBonus(e.target.value)}
						required
						type="number"
						value={refereeBonus}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`${metalType}-min`}>Min Investment (₹)</Label>
					<Input
						id={`${metalType}-min`}
						onChange={(e) => setMinInvestment(e.target.value)}
						required
						type="number"
						value={minInvestment}
					/>
				</div>
			</div>
			<Button disabled={isLoading} type="submit">
				{isLoading ? "Saving..." : "Save Configuration"}
			</Button>
		</form>
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
			<h1 className="font-bold text-3xl">Referral Configuration</h1>

			<Tabs className="w-full" defaultValue="gold">
				<TabsList>
					<TabsTrigger value="gold">Gold</TabsTrigger>
					<TabsTrigger value="silver">Silver</TabsTrigger>
				</TabsList>

				<TabsContent value="gold">
					<Card>
						<CardHeader>
							<CardTitle>Gold Referral Program</CardTitle>
						</CardHeader>
						<CardContent>
							{goldLoading ? (
								<div className="space-y-4">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							) : (
								<ReferralConfigForm
									initialData={goldConfig}
									isLoading={goldMutation.isPending}
									metalType="gold"
									onSubmit={(data) => goldMutation.mutate(data)}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="silver">
					<Card>
						<CardHeader>
							<CardTitle>Silver Referral Program</CardTitle>
						</CardHeader>
						<CardContent>
							{silverLoading ? (
								<div className="space-y-4">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							) : (
								<ReferralConfigForm
									initialData={silverConfig}
									isLoading={silverMutation.isPending}
									metalType="silver"
									onSubmit={(data) => silverMutation.mutate(data)}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
