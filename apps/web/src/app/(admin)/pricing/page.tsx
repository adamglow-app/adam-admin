"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, BarChart3, Minus, Plus } from "lucide-react";
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
		<Card className="border border-adam-border bg-gradient-to-br from-white to-adam-muted/20">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-8 w-32" />
					</div>
					<Skeleton className="h-10 w-10 rounded-lg" />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<Skeleton className="h-12 w-full rounded-lg" />
					<Skeleton className="h-12 w-full rounded-lg" />
				</div>
				<Skeleton className="h-6 w-32" />
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

	let priceChangeClass: string;
	if (isUp) {
		priceChangeClass = "text-green-600";
	} else if (isDown) {
		priceChangeClass = "text-red-600";
	} else {
		priceChangeClass = "text-adam-grey";
	}

	let priceChangeIcon: React.ReactNode;
	if (isUp) {
		priceChangeIcon = <ArrowUp className="h-4 w-4" />;
	} else if (isDown) {
		priceChangeIcon = <ArrowDown className="h-4 w-4" />;
	} else {
		priceChangeIcon = <Minus className="h-4 w-4" />;
	}

	return (
		<Card className="border border-adam-border bg-gradient-to-br from-white to-adam-muted/20 shadow-sm transition-all duration-200 hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-adam-grey text-sm uppercase tracking-wide">
							{metal}
						</p>
						<p className="font-bold text-2xl text-adam-tinted-black">
							{price?.pricePerGram
								? `₹${price.pricePerGram.toLocaleString()}`
								: "---"}
						</p>
					</div>
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-lg ${
							isGold
								? "bg-gradient-to-br from-amber-100 to-amber-200"
								: "bg-gradient-to-br from-slate-100 to-slate-200"
						}`}
					>
						<span
							className={`font-bold ${
								isGold ? "text-amber-700" : "text-slate-700"
							}`}
						>
							{metal.charAt(0)}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg bg-green-50 p-3 ring-1 ring-green-200">
						<p className="font-semibold text-green-700 text-xs uppercase tracking-wide">
							Buy Price
						</p>
						<p className="mt-1 font-bold text-green-900 text-lg">
							{price?.buyPrice ? `₹${price.buyPrice.toLocaleString()}` : "---"}
						</p>
					</div>
					<div className="rounded-lg bg-red-50 p-3 ring-1 ring-red-200">
						<p className="font-semibold text-red-700 text-xs uppercase tracking-wide">
							Sell Price
						</p>
						<p className="mt-1 font-bold text-lg text-red-900">
							{price?.sellPrice
								? `₹${price.sellPrice.toLocaleString()}`
								: "---"}
						</p>
					</div>
				</div>
				{price && previousPrice && (
					<div
						className={`flex items-center gap-2 rounded-lg bg-adam-muted/50 px-3 py-2 ${priceChangeClass}`}
					>
						{priceChangeIcon}
						<span className="font-medium text-sm">
							₹{Math.abs(priceChange).toFixed(2)}
						</span>
						<span className="text-xs">
							({priceChangePercent}%) vs yesterday
						</span>
					</div>
				)}
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
		<Card className="border border-adam-border bg-gradient-to-br from-white to-adam-muted/20 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="font-semibold text-adam-tinted-black text-base">
					Update Price
				</CardTitle>
				<p className="mt-1 text-adam-grey text-xs">
					Set the current buy and sell prices
				</p>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label
								className="font-semibold text-adam-tinted-black text-xs"
								htmlFor="metal-type"
							>
								Metal
							</Label>
							<select
								className="w-full rounded-lg border border-adam-border bg-white px-3 py-2 font-medium text-sm transition-all focus:border-adam-secondary focus:outline-none focus:ring-2 focus:ring-adam-secondary/30"
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
							<Label
								className="font-semibold text-adam-tinted-black text-xs"
								htmlFor="buy-price"
							>
								Buy Price (₹)
							</Label>
							<Input
								className="border-adam-border font-medium focus:border-adam-secondary focus:ring-2 focus:ring-adam-secondary/30"
								id="buy-price"
								onChange={(e) => setBuyPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={buyPrice}
							/>
						</div>
						<div className="space-y-2">
							<Label
								className="font-semibold text-adam-tinted-black text-xs"
								htmlFor="sell-price"
							>
								Sell Price (₹)
							</Label>
							<Input
								className="border-adam-border font-medium focus:border-adam-secondary focus:ring-2 focus:ring-adam-secondary/30"
								id="sell-price"
								onChange={(e) => setSellPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={sellPrice}
							/>
						</div>
					</div>
					<Button
						className="w-full bg-adam-secondary font-semibold text-white shadow-sm transition-all hover:bg-adam-secondary/90 sm:w-auto"
						disabled={createMutation.isPending}
						type="submit"
					>
						<Plus className="mr-2 h-4 w-4" />
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
							<TableRow className="border-adam-border border-b bg-adam-muted/50">
								<TableHead className="font-semibold">Date</TableHead>
								<TableHead className="font-semibold">Metal</TableHead>
								<TableHead className="font-semibold">Price / Gram</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{["skel-1", "skel-2", "skel-3", "skel-4", "skel-5"].map((key) => (
								<TableRow
									className="border-adam-border/50 border-b hover:bg-adam-muted/20"
									key={key}
								>
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
				<CardContent className="p-12 text-center">
					<BarChart3 className="mx-auto h-12 w-12 text-adam-muted" />
					<p className="mt-3 font-medium text-adam-grey">
						No price history available
					</p>
					<p className="mt-1 text-adam-muted text-sm">
						Price history will appear here as prices are updated
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border border-adam-border bg-white">
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow className="border-adam-border border-b bg-adam-muted/50">
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="font-semibold">Metal</TableHead>
							<TableHead className="text-right font-semibold">
								Price / Gram
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{history.map((entry) => (
							<TableRow
								className="border-adam-border/50 border-b transition-colors hover:bg-adam-muted/30"
								key={`${entry.date}-${entry.metalType}`}
							>
								<TableCell className="text-adam-tinted-black">
									{new Date(entry.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${
											(entry.metalType ?? "unknown") === "gold"
												? "bg-amber-100 text-amber-800"
												: "bg-slate-100 text-slate-800"
										}`}
									>
										{(entry.metalType ?? "unknown").charAt(0).toUpperCase() +
											(entry.metalType ?? "unknown").slice(1)}
									</span>
								</TableCell>
								<TableCell className="text-right font-bold text-adam-tinted-black">
									₹
									{entry.price?.toLocaleString("en-IN", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
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
