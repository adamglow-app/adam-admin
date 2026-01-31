"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPricesApi } from "@/lib/api/admin/prices";

function PriceCard({
	title,
	price,
	buyPrice,
}: {
	title: string;
	price: number;
	buyPrice: number;
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title} (per gram)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="font-bold text-3xl">₹{price}</div>
				<p className="mt-1 text-muted-foreground text-xs">Buy at ₹{buyPrice}</p>
			</CardContent>
		</Card>
	);
}

function PriceCardSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<Skeleton className="h-4 w-24" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-20" />
			</CardContent>
		</Card>
	);
}

export default function PricingPage() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-prices-latest"],
		queryFn: () => adminPricesApi.getLatest(),
	});

	const goldPrice = data?.find((p) => p.metalType === "gold");
	const silverPrice = data?.find((p) => p.metalType === "silver");

	if (error) {
		return (
			<div className="space-y-8">
				<h1 className="font-bold text-3xl">Pricing</h1>
				<div className="text-red-500">
					Error loading prices. Please try again.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<h1 className="font-bold text-3xl">Pricing</h1>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{isLoading ? (
					<>
						<PriceCardSkeleton />
						<PriceCardSkeleton />
					</>
				) : (
					<>
						{goldPrice ? (
							<PriceCard
								buyPrice={goldPrice.buyPrice}
								price={goldPrice.sellPrice}
								title="Gold"
							/>
						) : (
							<PriceCard buyPrice={0} price={0} title="Gold" />
						)}
						{silverPrice ? (
							<PriceCard
								buyPrice={silverPrice.buyPrice}
								price={silverPrice.sellPrice}
								title="Silver"
							/>
						) : (
							<PriceCard buyPrice={0} price={0} title="Silver" />
						)}
					</>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Price History</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Price history chart will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
