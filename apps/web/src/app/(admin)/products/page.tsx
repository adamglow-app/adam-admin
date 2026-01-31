"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function ProductSkeletonRow({ index }: { index: number }) {
	return (
		<TableRow key={`skeleton-${index}`}>
			<TableCell>
				<Skeleton className="h-4 w-40" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-24" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-16" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-20" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-24" />
			</TableCell>
		</TableRow>
	);
}

export default function ProductsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: 0,
		metalType: "gold" as "gold" | "silver",
		category: "",
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
			price: 0,
			metalType: "gold",
			category: "",
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
			price: product.price,
			metalType: product.metalType,
			category: product.category,
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
				product.category.toLowerCase().includes(search.toLowerCase())
		) ?? [];

	const isEmpty = filteredProducts.length === 0;
	const isSubmitting = createMutation.isPending;

	if (error) {
		return (
			<div className="space-y-8">
				<h1 className="font-bold text-3xl">Products</h1>
				<div className="text-red-500">
					Error loading products. Please try again.
				</div>
			</div>
		);
	}

	let tableContent: React.ReactNode;

	if (isLoading) {
		tableContent = Array.from({ length: 5 }).map((_, i) => (
			<ProductSkeletonRow index={i} key={i} />
		));
	} else if (isEmpty) {
		tableContent = (
			<TableRow>
				<TableCell className="py-8 text-center" colSpan={5}>
					No products found
				</TableCell>
			</TableRow>
		);
	} else {
		tableContent = filteredProducts.map((product: Product) => (
			<TableRow key={product.id}>
				<TableCell className="font-medium">{product.name}</TableCell>
				<TableCell>{product.category}</TableCell>
				<TableCell>
					<Badge
						variant={product.metalType === "gold" ? "default" : "secondary"}
					>
						{product.metalType}
					</Badge>
				</TableCell>
				<TableCell>₹{product.price}</TableCell>
				<TableCell>
					<div className="flex gap-2">
						<Button
							onClick={() => handleEdit(product)}
							size="sm"
							variant="outline"
						>
							Edit
						</Button>
						<Button
							onClick={() => deleteMutation.mutate(product.id)}
							size="sm"
							variant="destructive"
						>
							Delete
						</Button>
					</div>
				</TableCell>
			</TableRow>
		));
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Products</h1>
				<Button onClick={handleOpenCreate}>Add Product</Button>
			</div>

			<div className="flex items-center gap-4">
				<Input
					className="max-w-sm"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name or category..."
					value={search}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Metal Type</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{tableContent}</TableBody>
				</Table>
			</div>

			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingProduct ? "Edit Product" : "Add New Product"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
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
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									value={formData.description}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="price">Price</Label>
									<Input
										id="price"
										onChange={(e) =>
											setFormData({
												...formData,
												price: Number.parseFloat(e.target.value),
											})
										}
										required
										type="number"
										value={formData.price}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Input
										id="category"
										onChange={(e) =>
											setFormData({
												...formData,
												category: e.target.value,
											})
										}
										required
										value={formData.category}
									/>
								</div>
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
						</div>
						<DialogFooter className="mt-6">
							<Button
								onClick={() => setIsDialogOpen(false)}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button disabled={isSubmitting} type="submit">
								{isSubmitting ? "Saving..." : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
