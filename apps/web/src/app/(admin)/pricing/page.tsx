"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPricesApi } from "@/lib/api/admin/prices";
import type { MetalPrice } from "@/lib/api/types";

function PriceCardSkeleton() {
	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-7 w-24" />
					</div>
					<Skeleton className="h-10 w-10 rounded-lg" />
				</div>
			</CardContent>
		</Card>
	);
}

function PriceCard({ metal, price }: { metal: string; price?: MetalPrice }) {
	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-gray-500 text-sm">{metal}</p>
						<p className="mt-1 font-semibold text-2xl text-gray-900">
							{price?.pricePerGram
								? `₹${price.pricePerGram.toLocaleString()}`
								: "₹0"}
						</p>
						{price && (
							<p className="mt-0.5 text-gray-400 text-xs">
								ID: {price.id.slice(0, 8)}...
							</p>
						)}
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
						<span className="font-semibold text-gray-700 text-lg">
							{metal.charAt(0).toUpperCase()}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function AddPriceForm() {
	const queryClient = useQueryClient();
	const [metalType, setMetalType] = useState<"gold" | "silver">("gold");
	const [buyPrice, setBuyPrice] = useState("");
	const [sellPrice, setSellPrice] = useState("");

	const createMutation = useMutation({
		mutationFn: (data: {
			metalType: "gold" | "silver";
			buyPrice: number;
			sellPrice: number;
		}) => adminPricesApi.update(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-price-gold"] });
			queryClient.invalidateQueries({ queryKey: ["admin-price-silver"] });
			toast.success("Price updated successfully");
			setBuyPrice("");
			setSellPrice("");
		},
		onError: (error: unknown) => {
			toast.error("Failed to update price");
			console.error("Price update error:", error);
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		createMutation.mutate({
			metalType,
			buyPrice: Number.parseFloat(buyPrice) || 0,
			sellPrice: Number.parseFloat(sellPrice) || 0,
		});
	}

	return (
		<Card className="border border-gray-200 bg-white">
			<CardHeader className="pb-3">
				<CardTitle className="font-medium text-base">Update Price</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label className="text-xs" htmlFor="metal-type">
								Metal
							</Label>
							<select
								className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
								id="metal-type"
								onChange={(e) =>
									setMetalType(e.target.value as "gold" | "silver")
								}
								value={metalType}
							>
								<option value="gold">Gold</option>
								<option value="silver">Silver</option>
							</select>
						</div>
						<div className="space-y-2">
							<Label className="text-xs" htmlFor="buy-price">
								Buy Price (₹)
							</Label>
							<Input
								id="buy-price"
								onChange={(e) => setBuyPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={buyPrice}
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-xs" htmlFor="sell-price">
								Sell Price (₹)
							</Label>
							<Input
								id="sell-price"
								onChange={(e) => setSellPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={sellPrice}
							/>
						</div>
					</div>
					<Button
						className="w-full sm:w-auto"
						disabled={createMutation.isPending}
						type="submit"
					>
						<Plus className="mr-1.5 h-4 w-4" />
						{createMutation.isPending ? "Updating..." : "Update Price"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default function PricingPage() {
	const { data: goldPrice, isLoading: goldLoading } = useQuery({
		queryKey: ["admin-price-gold"],
		queryFn: () => adminPricesApi.getGoldPrice(),
		retry: false,
	});

	const { data: silverPrice, isLoading: silverLoading } = useQuery({
		queryKey: ["admin-price-silver"],
		queryFn: () => adminPricesApi.getSilverPrice(),
		retry: false,
	});

	const isLoading = goldLoading || silverLoading;

	return (
		<div className="space-y-6">
			<div className="border-gray-200 border-b pb-4">
				<h1 className="font-semibold text-gray-900 text-xl">Pricing</h1>
				<p className="mt-0.5 text-gray-500 text-sm">Manage metal prices</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					<>
						<PriceCardSkeleton />
						<PriceCardSkeleton />
					</>
				) : (
					<>
						<PriceCard metal="Gold" price={goldPrice} />
						<PriceCard metal="Silver" price={silverPrice} />
					</>
				)}
				<AddPriceForm />
			</div>

			<Card className="border border-gray-200 bg-white">
				<CardHeader className="pb-3">
					<CardTitle className="font-medium text-base">Price History</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-500 text-sm">
						Price history chart will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
