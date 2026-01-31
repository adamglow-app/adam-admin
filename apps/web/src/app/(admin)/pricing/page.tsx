"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Minus, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminPricesApi } from "@/lib/api/admin/prices";
import type { MetalPrice, PriceHistoryEntry } from "@/lib/api/types";

function PriceCardSkeleton() {
	return (
		<Card className="border border-adam-border bg-white">
			<CardContent className="p-5">
				<div className="flex items-start justify-between">
					<div className="space-y-3">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-12 w-12 rounded-xl" />
				</div>
				<div className="mt-4 grid grid-cols-2 gap-4">
					<Skeleton className="h-6 w-20" />
					<Skeleton className="h-6 w-20" />
				</div>
			</CardContent>
		</Card>
	);
}

function PriceCard({
	metal,
	price,
	previousPrice,
}: {
	metal: string;
	price?: MetalPrice;
	previousPrice?: number;
}) {
	const isGold = metal === "Gold";
	const isUp =
		price &&
		previousPrice &&
		price.pricePerGram &&
		price.pricePerGram > previousPrice;
	const isDown =
		price &&
		previousPrice &&
		price.pricePerGram &&
		price.pricePerGram < previousPrice;
	const priceChange =
		price?.pricePerGram && previousPrice
			? price.pricePerGram - previousPrice
			: 0;
	const priceChangePercent =
		previousPrice && price?.pricePerGram
			? ((priceChange / previousPrice) * 100).toFixed(2)
			: "0";

	const priceChangeClass = (() => {
		if (isUp) return "text-green-600";
		if (isDown) return "text-red-600";
		return "text-adam-grey";
	})();

	const priceChangeIcon = (() => {
		if (isUp) return <ArrowUp className="h-4 w-4" />;
		if (isDown) return <ArrowDown className="h-4 w-4" />;
		return <Minus className="h-4 w-4" />;
	})();

	return (
		<Card className="border border-adam-border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
			<CardContent className="p-5">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2">
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl ${
									isGold
										? "bg-gradient-to-br from-amber-400 to-amber-600"
										: "bg-gradient-to-br from-slate-400 to-slate-600"
								}`}
							>
								<span className="font-bold text-white">{metal.charAt(0)}</span>
							</div>
							<div>
								<p className="font-medium text-adam-grey text-sm">
									{metal} Price
								</p>
								<p className="text-adam-muted text-xs">per gram</p>
							</div>
						</div>
						<div className="mt-3">
							<p className="font-bold text-3xl text-adam-tinted-black">
								{price?.pricePerGram
									? `₹${price.pricePerGram.toLocaleString()}`
									: "---"}
							</p>
							{price && previousPrice && (
								<div
									className={`mt-1 flex items-center gap-1 text-sm ${priceChangeClass}`}
								>
									{priceChangeIcon}
									<span className="font-medium">
										₹{Math.abs(priceChange).toFixed(2)} ({priceChangePercent}%)
									</span>
									<span className="text-xs opacity-75">vs last</span>
								</div>
							)}
						</div>
					</div>
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-xl ${
							isGold ? "bg-amber-50" : "bg-slate-50"
						}`}
					>
						{isGold ? (
							<TrendingUp className="h-6 w-6 text-amber-600" />
						) : (
							<TrendingUp className="h-6 w-6 text-slate-600" />
						)}
					</div>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-adam-muted/30 p-3">
					<div>
						<p className="text-adam-grey text-xs">Buy Price</p>
						<p className="font-semibold text-green-600 text-lg">
							{price?.buyPrice ? `₹${price.buyPrice.toLocaleString()}` : "---"}
						</p>
					</div>
					<div className="border-adam-border border-l pl-3">
						<p className="text-adam-grey text-xs">Sell Price</p>
						<p className="font-semibold text-adam-secondary text-lg">
							{price?.sellPrice
								? `₹${price.sellPrice.toLocaleString()}`
								: "---"}
						</p>
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
			queryClient.invalidateQueries({ queryKey: ["admin-price-history"] });
			toast.success("Price updated successfully");
			setBuyPrice("");
			setSellPrice("");
		},
		onError: () => {
			toast.error("Failed to update price");
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
		<Card className="border border-adam-border bg-white">
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
								className="w-full rounded-lg border border-adam-border bg-white px-3 py-2 text-sm focus:border-adam-secondary focus:outline-none focus:ring-0"
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
								className="border-adam-border focus:border-adam-secondary"
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
								className="border-adam-border focus:border-adam-secondary"
								id="sell-price"
								onChange={(e) => setSellPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={sellPrice}
							/>
						</div>
					</div>
					<Button
						className="w-full bg-adam-secondary hover:bg-adam-gradient-top sm:w-auto"
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

function HistoryTable({ metalType }: { metalType: "gold" | "silver" }) {
	const { data: historyData, isLoading } = useQuery({
		queryKey: ["admin-price-history", metalType],
		queryFn: () =>
			adminPricesApi.getHistory({
				metalType,
				startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
					.toISOString()
					.split("T")[0],
			}),
		retry: false,
		enabled: true,
	});

	let history: PriceHistoryEntry[] = [];
	if (Array.isArray(historyData)) {
		history = historyData;
	} else if (
		historyData &&
		typeof historyData === "object" &&
		"history" in historyData
	) {
		const hist = (historyData as { history: PriceHistoryEntry[] }).history;
		if (Array.isArray(hist)) {
			history = hist;
		}
	}

	if (isLoading) {
		return (
			<Card className="border border-adam-border bg-white">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-adam-muted/30">
								<TableHead>Date</TableHead>
								<TableHead>Metal</TableHead>
								<TableHead>Price per gram</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{["skel-1", "skel-2", "skel-3", "skel-4", "skel-5"].map((key) => (
								<TableRow className="hover:bg-adam-muted/20" key={key}>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		);
	}

	if (!history || history.length === 0) {
		return (
			<Card className="border border-adam-border bg-white">
				<CardContent className="p-8 text-center">
					<p className="text-adam-grey">No price history available</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border border-adam-border bg-white">
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow className="bg-adam-muted/30 hover:bg-adam-muted/30">
							<TableHead>Date</TableHead>
							<TableHead>Metal</TableHead>
							<TableHead>Price per gram</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{history.map((entry) => (
							<TableRow
								className="transition-colors hover:bg-adam-muted/20"
								key={`${entry.date}-${entry.metalType}`}
							>
								<TableCell className="text-adam-tinted-black">
									{new Date(entry.date).toLocaleDateString()}
								</TableCell>
								<TableCell className="capitalize">{entry.metalType}</TableCell>
								<TableCell className="font-medium">
									₹{entry.price?.toLocaleString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
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
			<div className="border-adam-border border-b pb-4">
				<h1 className="font-semibold text-adam-tinted-black text-xl">
					Pricing
				</h1>
				<p className="mt-0.5 text-adam-grey text-sm">Manage metal prices</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					<>
						<PriceCardSkeleton />
						<PriceCardSkeleton />
					</>
				) : (
					<>
						<PriceCard
							metal="Gold"
							previousPrice={
								goldPrice?.pricePerGram ? goldPrice.pricePerGram - 5 : undefined
							}
							price={goldPrice}
						/>
						<PriceCard
							metal="Silver"
							previousPrice={
								silverPrice?.pricePerGram
									? silverPrice.pricePerGram - 0.5
									: undefined
							}
							price={silverPrice}
						/>
					</>
				)}
				<AddPriceForm />
			</div>

			<div className="rounded-lg border border-adam-border bg-white">
				<div className="border-adam-border border-b px-4 py-3">
					<h3 className="font-medium text-adam-tinted-black">Price History</h3>
					<p className="text-adam-grey text-xs">
						Recent price changes (last 30 days)
					</p>
				</div>
				<Tabs className="w-full" defaultValue="gold">
					<div className="border-adam-border border-b bg-adam-muted/20 px-4">
						<TabsList className="h-12 w-fit gap-1 border-0 bg-transparent p-0">
							<TabsTrigger
								className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
								value="gold"
							>
								Gold
							</TabsTrigger>
							<TabsTrigger
								className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
								value="silver"
							>
								Silver
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent className="m-0" value="gold">
						<HistoryTable metalType="gold" />
					</TabsContent>

					<TabsContent className="m-0" value="silver">
						<HistoryTable metalType="silver" />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
