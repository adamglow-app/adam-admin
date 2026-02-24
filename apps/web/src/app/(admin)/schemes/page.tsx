"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminSchemesApi } from "@/lib/api/admin/schemes";
import type { Scheme } from "@/lib/api/types";
import { SchemeDialog } from "./scheme-dialog";

function SchemesSkeleton() {
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{["Name", "Status", "Created", "Actions"].map((header) => (
							<TableHead
								className="font-semibold text-adam-grey text-xs uppercase tracking-wider"
								key={header}
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{["skel-1", "skel-2", "skel-3", "skel-4", "skel-5"].map((key) => (
						<TableRow className="border-adam-border/30" key={key}>
							<TableCell className="py-3">
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-8" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

export default function SchemesPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [limit] = useState(10);
	const [skip, setSkip] = useState(0);

	const {
		data: schemesData,
		isLoading: schemesLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin-schemes", skip, limit],
		queryFn: () => adminSchemesApi.getAll({ skip, limit }),
	});

	const schemes = schemesData?.schemes ?? [];
	const total = schemesData?.total ?? 0;

	const handleDeleteClick = (schemeId: string) => {
		setSelectedSchemeId(schemeId);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedSchemeId) {
			return;
		}

		setIsDeleting(true);
		try {
			await adminSchemesApi.delete(selectedSchemeId);
			toast({
				title: "Scheme deleted",
				description: "The scheme has been successfully deleted.",
			});
			setDeleteDialogOpen(false);
			setSelectedSchemeId(null);
			refetch();
		} catch {
			toast({
				title: "Error",
				description: "Failed to delete scheme",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	if (schemesLoading) {
		return <SchemesSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
						Schemes
					</h1>
					<p className="mt-1 text-adam-grey text-sm">
						Manage all investment schemes
					</p>
				</div>
				<Button
					className="flex items-center gap-2"
					onClick={() => setDialogOpen(true)}
				>
					<Plus className="h-4 w-4" />
					New Scheme
				</Button>
			</div>

			{/* Schemes Table */}
			<Card className="overflow-hidden border-0 shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
							<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
								Name
							</TableHead>
							<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
								Description
							</TableHead>
							<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
								Status
							</TableHead>
							<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
								Created
							</TableHead>
							<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{schemes.map((scheme: Scheme) => (
							<TableRow
								className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
								key={scheme.id}
							>
								<TableCell className="py-3 font-medium">
									<button
										className="text-adam-secondary hover:underline"
										onClick={() => router.push(`/schemes/${scheme.id}` as never)}
										type="button"
									>
										{scheme.name}
									</button>
								</TableCell>
								<TableCell className="max-w-xs truncate text-adam-grey text-sm">
									{scheme.description}
								</TableCell>
								<TableCell>
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
								</TableCell>
								<TableCell className="text-adam-grey text-sm">
									{new Date(scheme.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="flex items-center gap-2">
									<Button
										className="h-8 w-8"
										onClick={() => handleDeleteClick(scheme.id)}
										size="sm"
										variant="ghost"
									>
										<Trash2 className="h-4 w-4 text-adam-danger" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{/* Pagination Info */}
			<div className="flex items-center justify-between text-adam-grey text-sm">
				<p>
					Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}{" "}
					schemes
				</p>
				<div className="flex gap-2">
					<Button
						disabled={skip === 0}
						onClick={() => setSkip(Math.max(skip - limit, 0))}
						variant="outline"
					>
						Previous
					</Button>
					<Button
						disabled={skip + limit >= total}
						onClick={() => setSkip(skip + limit)}
						variant="outline"
					>
						Next
					</Button>
				</div>
			</div>

			{/* New Scheme Dialog */}
			<SchemeDialog
				onClose={() => setDialogOpen(false)}
				onSuccess={() => {
					setDialogOpen(false);
					refetch();
				}}
				open={dialogOpen}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				description="Are you sure you want to delete this scheme? This action cannot be undone."
				isLoading={isDeleting}
				onCancel={() => setDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
				open={deleteDialogOpen}
				title="Delete Scheme"
			/>
		</div>
	);
}
