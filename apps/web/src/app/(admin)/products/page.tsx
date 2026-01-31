"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminProductsApi } from "@/lib/api/admin/products";
import type { Product } from "@/lib/api/types";

function ProductsTableSkeleton() {
	return (
		<div className="rounded-md border border-adam-border">
			<Table>
				<TableHeader>
					<TableRow className="bg-adam-muted/30">
						<TableHead className="font-medium">Product</TableHead>
						<TableHead className="font-medium">SKU</TableHead>
						<TableHead className="font-medium">Category</TableHead>
						<TableHead className="font-medium">Metal</TableHead>
						<TableHead className="text-right font-medium">Weight</TableHead>
						<TableHead className="text-right font-medium">Purity</TableHead>
						<TableHead className="text-right font-medium">Stock</TableHead>
						<TableHead className="text-right font-medium">Price</TableHead>
						<TableHead className="font-medium">Status</TableHead>
						<TableHead className="text-right font-medium">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow className="hover:bg-adam-muted/20" key={`skeleton-${i}`}>
							<TableCell>
								<Skeleton className="h-4 w-40" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-16" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-12" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-16" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-12" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-16" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-8 w-20" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default function ProductsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		sku: string;
		price: number;
		metalType: "gold" | "silver";
		category: string;
		subCategory: string;
		weight: number;
		purity: string;
		stock: number;
		status: "active" | "inactive" | "out_of_stock";
	}>({
		name: "",
		description: "",
		sku: "",
		price: 0,
		metalType: "gold",
		category: "",
		subCategory: "",
		weight: 0,
		purity: "999",
		stock: 0,
		status: "active",
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-products"],
		queryFn: () => adminProductsApi.list({ limit: 100 }),
	});

	const createMutation = useMutation({
		mutationFn: (data: Partial<Product>) => adminProductsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			toast.success("Product created successfully");
			setIsDialogOpen(false);
			resetForm();
		},
		onError: () => {
			toast.error("Failed to create product");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (productId: string) => adminProductsApi.delete(productId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			toast.success("Product deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete product");
		},
	});

	function resetForm() {
		setFormData({
			name: "",
			description: "",
			sku: "",
			price: 0,
			metalType: "gold",
			category: "",
			subCategory: "",
			weight: 0,
			purity: "999",
			stock: 0,
			status: "active",
		});
		setEditingProduct(null);
	}

	function handleOpenCreate() {
		resetForm();
		setIsDialogOpen(true);
	}

	function handleEdit(product: Product) {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description,
			sku: product.sku,
			price: product.price,
			metalType: product.metalType,
			category: product.category,
			subCategory: product.subCategory || "",
			weight: product.weight,
			purity: product.purity || "999",
			stock: product.stock,
			status: product.status,
		});
		setIsDialogOpen(true);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		createMutation.mutate(formData);
	}

	const filteredProducts =
		data?.products.filter(
			(product) =>
				product.name.toLowerCase().includes(search.toLowerCase()) ||
				product.sku.toLowerCase().includes(search.toLowerCase()) ||
				product.category.toLowerCase().includes(search.toLowerCase())
		) ?? [];

	const isEmpty = filteredProducts.length === 0;
	const isSubmitting = createMutation.isPending;

	function getStatusBadge(status: string) {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			active: "default",
			inactive: "secondary",
			out_of_stock: "destructive",
		};
		return (
			<Badge className="text-xs" variant={variants[status] || "outline"}>
				{status.replace("_", " ")}
			</Badge>
		);
	}

	function getMetalBadge(metal: string) {
		return (
			<Badge
				className={
					metal === "gold"
						? "border-amber-200 bg-amber-50 text-amber-700"
						: "border-slate-200 bg-slate-50 text-slate-700"
				}
				variant="outline"
			>
				{metal}
			</Badge>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="border-adam-border border-b pb-4">
					<h1 className="font-semibold text-adam-tinted-black text-xl">
						Products
					</h1>
					<p className="mt-0.5 text-adam-grey text-sm">
						Manage your product catalog
					</p>
				</div>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
					Error loading products. Please try again.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="border-adam-border border-b pb-4">
				<h1 className="font-semibold text-adam-tinted-black text-xl">
					Products
				</h1>
				<p className="mt-0.5 text-adam-grey text-sm">
					Manage your product catalog
				</p>
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-md flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-adam-grey" />
					<Input
						className="border-adam-border pl-9 focus:border-adam-secondary focus:ring-adam-secondary/20"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, SKU, or category..."
						value={search}
					/>
				</div>
				<Button
					className="bg-adam-secondary hover:bg-adam-gradient-top"
					onClick={handleOpenCreate}
				>
					Add Product
				</Button>
			</div>

			{(() => {
				if (isLoading) {
					return <ProductsTableSkeleton />;
				}
				if (isEmpty) {
					return (
						<div className="rounded-lg border border-adam-border bg-white p-8 text-center">
							<p className="text-adam-grey">No products found</p>
						</div>
					);
				}
				return (
					<div className="rounded-md border border-adam-border">
						<Table>
							<TableHeader>
								<TableRow className="bg-adam-muted/30 hover:bg-adam-muted/30">
									<TableHead className="font-medium">Product</TableHead>
									<TableHead className="font-medium">SKU</TableHead>
									<TableHead className="font-medium">Category</TableHead>
									<TableHead className="font-medium">Metal</TableHead>
									<TableHead className="text-right font-medium">
										Weight (g)
									</TableHead>
									<TableHead className="text-right font-medium">
										Purity
									</TableHead>
									<TableHead className="text-right font-medium">
										Stock
									</TableHead>
									<TableHead className="text-right font-medium">
										Price (₹)
									</TableHead>
									<TableHead className="font-medium">Status</TableHead>
									<TableHead className="text-right font-medium">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts.map((product: Product) => (
									<TableRow
										className="transition-colors hover:bg-adam-muted/20"
										key={product.id}
									>
										<TableCell>
											<div className="font-medium text-adam-tinted-black">
												{product.name}
											</div>
											<div className="max-w-[200px] truncate text-adam-grey text-xs">
												{product.description}
											</div>
										</TableCell>
										<TableCell className="font-mono text-sm">
											{product.sku}
										</TableCell>
										<TableCell>{product.category}</TableCell>
										<TableCell>{getMetalBadge(product.metalType)}</TableCell>
										<TableCell className="text-right">
											{product.weight.toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											{product.purity}
										</TableCell>
										<TableCell className="text-right">
											{(() => {
												if (product.stock < 10) {
													return (
														<span className="text-red-600">
															{product.stock}
														</span>
													);
												}
												if (product.stock < 50) {
													return (
														<span className="text-amber-600">
															{product.stock}
														</span>
													);
												}
												return (
													<span className="text-green-600">
														{product.stock}
													</span>
												);
											})()}
										</TableCell>
										<TableCell className="text-right font-medium">
											₹{product.price.toLocaleString()}
										</TableCell>
										<TableCell>{getStatusBadge(product.status)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													className="h-8 px-3 text-xs"
													onClick={() => handleEdit(product)}
													variant="outline"
												>
													Edit
												</Button>
												<Button
													className="h-8 px-3 text-red-600 text-xs hover:bg-red-50"
													onClick={() => deleteMutation.mutate(product.id)}
													variant="ghost"
												>
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				);
			})()}

			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingProduct ? "Edit Product" : "Add New Product"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="name">Product Name</Label>
								<Input
									id="name"
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									required
									value={formData.name}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sku">SKU</Label>
								<Input
									id="sku"
									onChange={(e) =>
										setFormData({ ...formData, sku: e.target.value })
									}
									required
									value={formData.sku}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input
									id="category"
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									required
									value={formData.category}
								/>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									value={formData.description}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="price">Price (₹)</Label>
								<Input
									id="price"
									onChange={(e) =>
										setFormData({
											...formData,
											price: Number.parseFloat(e.target.value) || 0,
										})
									}
									required
									type="number"
									value={formData.price}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="stock">Stock Quantity</Label>
								<Input
									id="stock"
									onChange={(e) =>
										setFormData({
											...formData,
											stock: Number.parseInt(e.target.value, 10) || 0,
										})
									}
									required
									type="number"
									value={formData.stock}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="weight">Weight (grams)</Label>
								<Input
									id="weight"
									onChange={(e) =>
										setFormData({
											...formData,
											weight: Number.parseFloat(e.target.value) || 0,
										})
									}
									required
									step="0.01"
									type="number"
									value={formData.weight}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="purity">Purity</Label>
								<Select
									onValueChange={(value) =>
										setFormData({ ...formData, purity: value || "999" })
									}
									value={formData.purity || "999"}
								>
									<SelectTrigger id="purity">
										<SelectValue placeholder="Select purity" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="999">999 (24K)</SelectItem>
										<SelectItem value="995">995 (23K)</SelectItem>
										<SelectItem value="916">916 (22K)</SelectItem>
										<SelectItem value="875">875 (21K)</SelectItem>
										<SelectItem value="585">585 (14K)</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="metalType">Metal Type</Label>
								<Select
									onValueChange={(value) =>
										setFormData({
											...formData,
											metalType: value as "gold" | "silver",
										})
									}
									value={formData.metalType}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="gold">Gold</SelectItem>
										<SelectItem value="silver">Silver</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									onValueChange={(value) =>
										setFormData({
											...formData,
											status: value as "active" | "inactive" | "out_of_stock",
										})
									}
									value={formData.status}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="out_of_stock">Out of Stock</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter className="mt-6">
							<Button
								onClick={() => setIsDialogOpen(false)}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								className="bg-adam-secondary hover:bg-adam-gradient-top"
								disabled={isSubmitting}
								type="submit"
							>
								{isSubmitting
									? "Saving..."
									: (() => {
											if (editingProduct) {
												return "Update";
											}
											return "Create";
										})()}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
