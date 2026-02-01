"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BarChart3,
	Coins,
	History,
	RefreshCw,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
		<Card className="group relative overflow-hidden border-0 bg-white shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-3">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-36" />
						<Skeleton className="h-6 w-28 rounded-full" />
					</div>
					<Skeleton className="h-14 w-14 rounded-2xl" />
				</div>
			</CardContent>
		</Card>
	);
}

function PriceCard({
	metal,
	price,
}: {
	metal: string;
	price?: MetalPrice;
}) {
	const isGold = metal === "Gold";

	return (
		<Card className="group relative overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
			{/* Decorative gradient overlay */}
			<div
				className={`absolute inset-0 opacity-[0.03] ${
					isGold
						? "bg-gradient-to-br from-amber-400 to-yellow-600"
						: "bg-gradient-to-br from-slate-400 to-gray-600"
				}`}
			/>

			<CardContent className="relative p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<p className="font-medium text-adam-grey text-sm">
								{metal} Price
							</p>
							<Badge
								className="border-0 bg-adam-scaffold-background px-2 py-0.5 font-normal text-[10px] text-adam-trailing"
								variant="outline"
							>
								per gram
							</Badge>
						</div>
						<p className="font-bold text-4xl text-adam-tinted-black tracking-tight">
							{price?.pricePerGram
								? `₹${price.pricePerGram.toLocaleString("en-IN")}`
								: "---"}
						</p>
					</div>
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
							isGold
								? "bg-gradient-to-br from-amber-100 to-yellow-50"
								: "bg-gradient-to-br from-slate-100 to-gray-50"
						}`}
					>
						{isGold ? (
							<Coins className="h-7 w-7 text-amber-600" />
						) : (
							<Sparkles className="h-7 w-7 text-slate-500" />
						)}
					</div>
				</div>

				{/* Last updated */}
				{price?.timestamp && (
					<div className="mt-4 flex items-center gap-1.5 border-adam-border/50 border-t pt-4 text-adam-trailing text-xs">
						<RefreshCw className="h-3 w-3" />
						<span>
							Updated{" "}
							{new Date(price.timestamp).toLocaleTimeString("en-IN", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function UpdatePriceCard() {
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
		<Card className="overflow-hidden border-0 bg-gradient-to-br from-adam-secondary to-adam-gradient-top shadow-sm">
			<CardContent className="p-6">
				<div className="mb-5 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
						<TrendingUp className="h-5 w-5 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-white">Update Price</h3>
						<p className="text-white/70 text-xs">Set current market rates</p>
					</div>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label className="font-medium text-white/90 text-xs">
							Metal Type
						</Label>
						<div className="flex gap-2">
							<button
								className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-sm transition-all ${
									metalType === "gold"
										? "bg-white text-adam-secondary shadow-sm"
										: "bg-white/10 text-white hover:bg-white/20"
								}`}
								onClick={() => setMetalType("gold")}
								type="button"
							>
								Gold
							</button>
							<button
								className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-sm transition-all ${
									metalType === "silver"
										? "bg-white text-adam-secondary shadow-sm"
										: "bg-white/10 text-white hover:bg-white/20"
								}`}
								onClick={() => setMetalType("silver")}
								type="button"
							>
								Silver
							</button>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-2">
							<Label className="font-medium text-white/90 text-xs">
								Buy Price (₹)
							</Label>
							<Input
								className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
								onChange={(e) => setBuyPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={buyPrice}
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-medium text-white/90 text-xs">
								Sell Price (₹)
							</Label>
							<Input
								className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
								onChange={(e) => setSellPrice(e.target.value)}
								placeholder="0.00"
								type="number"
								value={sellPrice}
							/>
						</div>
					</div>

					<Button
						className="w-full bg-white font-semibold text-adam-secondary shadow-sm hover:bg-white/90"
						disabled={createMutation.isPending}
						type="submit"
					>
						{createMutation.isPending ? "Updating..." : "Update Price"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function HistoryTableSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Date
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Metal
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Price / Gram
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{["hskel-1", "hskel-2", "hskel-3", "hskel-4", "hskel-5"].map(
						(key) => (
							<TableRow className="border-adam-border/30" key={key}>
								<TableCell>
									<Skeleton className="h-4 w-28" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16 rounded-full" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto h-4 w-24" />
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyHistory() {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<BarChart3 className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No price history
				</h3>
				<p className="mt-1 text-center text-adam-grey text-sm">
					Price history will appear here as prices are updated
				</p>
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
		return <HistoryTableSkeleton />;
	}

	if (!history || history.length === 0) {
		return <EmptyHistory />;
	}

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Date
						</TableHead>
						<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Metal
						</TableHead>
						<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
							Price / Gram
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{history.map((entry, index) => (
						<TableRow
							className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
							key={`${entry.date}-${entry.metalType}-${index}`}
						>
							<TableCell className="py-4">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-adam-scaffold-background">
										<History className="h-4 w-4 text-adam-trailing" />
									</div>
									<div className="flex flex-col">
										<span className="font-medium text-adam-tinted-black text-sm">
											{new Date(
												entry.updated_at ?? entry.created_at ?? entry.date
											).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</span>
										<span className="text-adam-trailing text-xs">
											{new Date(
												entry.updated_at ?? entry.created_at ?? entry.date
											).toLocaleTimeString("en-IN", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<Badge
									className={`border font-medium text-xs ${
										(entry.metalType ?? "unknown") === "gold"
											? "border-amber-200 bg-amber-50 text-amber-700"
											: "border-slate-200 bg-slate-50 text-slate-700"
									}`}
									variant="outline"
								>
									{(entry.metalType ?? "unknown").charAt(0).toUpperCase() +
										(entry.metalType ?? "unknown").slice(1)}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<span className="font-semibold text-adam-tinted-black">
									₹
									{entry.price?.toLocaleString("en-IN", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
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
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Pricing
				</h1>
				<p className="text-adam-grey text-sm">
					Manage metal prices and view historical data
				</p>
			</div>

			{/* Price Cards Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
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
				<UpdatePriceCard />
			</div>

			{/* Price History Section */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-adam-tinted-black text-lg">
							Price History
						</h2>
						<p className="text-adam-grey text-sm">
							Recent price changes over the last 30 days
						</p>
					</div>
				</div>

				<Tabs className="w-full" defaultValue="gold">
					<TabsList className="mb-4 h-11 w-fit gap-1 rounded-xl border border-adam-border bg-white p-1">
						<TabsTrigger
							className="rounded-lg px-6 py-2 font-medium text-sm data-[state=active]:bg-adam-secondary data-[state=active]:text-white data-[state=active]:shadow-sm"
							value="gold"
						>
							<Coins className="mr-2 h-4 w-4" />
							Gold
						</TabsTrigger>
						<TabsTrigger
							className="rounded-lg px-6 py-2 font-medium text-sm data-[state=active]:bg-adam-secondary data-[state=active]:text-white data-[state=active]:shadow-sm"
							value="silver"
						>
							<Sparkles className="mr-2 h-4 w-4" />
							Silver
						</TabsTrigger>
					</TabsList>

					<TabsContent className="mt-0" value="gold">
						<HistoryTable metalType="gold" />
					</TabsContent>

					<TabsContent className="mt-0" value="silver">
						<HistoryTable metalType="silver" />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
