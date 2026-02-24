"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminSchemesApi } from "@/lib/api/admin/schemes";
import { SchemeDialog } from "../scheme-dialog";

export function SchemeDetailContent({ schemeId }: { schemeId: string }) {
	const router = useRouter();
	const [dialogOpen, setDialogOpen] = useState(false);

	const {
		data: scheme,
		isLoading: schemeLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin-scheme", schemeId],
		queryFn: () => adminSchemesApi.getById(schemeId),
		retry: false,
	});

	if (schemeLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-adam-secondary" />
			</div>
		);
	}

	if (!scheme) {
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
						<p className="font-medium text-red-800">Scheme not found</p>
						<p className="mt-1 text-red-600 text-sm">
							The scheme you are looking for does not exist.
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
						{scheme.name}
					</h1>
					<p className="text-adam-grey text-sm">{scheme.description}</p>
				</div>
				<Button
					className="flex items-center gap-2"
					onClick={() => setDialogOpen(true)}
				>
					<Edit className="h-4 w-4" />
					Edit Scheme
				</Button>
			</div>

			{/* Scheme Info Card */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">Scheme Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<p className="text-adam-grey text-sm">Status</p>
							<div className="mt-2">
								<Badge
									className={`font-medium text-xs ${
										scheme.isActive
											? "border border-emerald-200 bg-emerald-50 text-emerald-700"
											: "border border-gray-200 bg-gray-50 text-gray-700"
									}`}
									variant="outline"
								>
									{scheme.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Created</p>
							<p className="mt-2 font-medium text-adam-tinted-black">
								{new Date(scheme.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div>
							<p className="text-adam-grey text-sm">Last Updated</p>
							<p className="mt-2 font-medium text-adam-tinted-black">
								{new Date(scheme.updatedAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Details Tabs */}
			<Tabs className="space-y-6" defaultValue="description">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="description">Description</TabsTrigger>
					<TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-6" value="description">
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">Description</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-adam-tinted-black text-sm">
								{scheme.description || "No description provided"}
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-6" value="terms">
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">Terms & Conditions</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-adam-tinted-black text-sm">
								{scheme.termsAndConditions ||
									"No terms and conditions provided"}
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Dialog */}
			<SchemeDialog
				onClose={() => setDialogOpen(false)}
				onSuccess={() => {
					setDialogOpen(false);
					refetch();
				}}
				open={dialogOpen}
				scheme={scheme}
			/>
		</div>
	);
}
