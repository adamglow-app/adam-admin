"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Image as ImagePlaceholderIcon,
	Plus,
	Search,
	Upload,
} from "lucide-react";
import Image from "next/image";
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
		<div className="overflow-hidden rounded-lg border border-adam-border">
			<Table>
				<TableHeader>
					<TableRow className="bg-adam-muted/50">
						<TableHead className="font-medium">Product</TableHead>
						<TableHead className="font-medium">SKU</TableHead>
						<TableHead className="font-medium">Category</TableHead>
						<TableHead className="font-medium">Metal</TableHead>
						<TableHead className="text-right font-medium">Weight</TableHead>
						<TableHead className="text-right font-medium">Stock</TableHead>
						<TableHead className="text-right font-medium">Price</TableHead>
						<TableHead className="font-medium">Status</TableHead>
						<TableHead className="text-right font-medium">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{["pskel-1", "pskel-2", "pskel-3", "pskel-4", "pskel-5"].map(
						(key) => (
							<TableRow
								className="transition-colors hover:bg-adam-muted/30"
								key={key}
							>
								<TableCell>
									<div className="flex items-center gap-3">
										<Skeleton className="h-10 w-10 rounded-lg" />
										<div className="space-y-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto h-4 w-16" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto h-4 w-12" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto h-8 w-24" />
								</TableCell>
							</TableRow>
						)
					)}
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
	const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
	const [selectedCertificateFile, setSelectedCertificateFile] =
		useState<File | null>(null);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [imagesDragActive, setImagesDragActive] = useState(false);
	const [certificateDragActive, setCertificateDragActive] = useState(false);
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
		photos: string[];
		certificate?: string;
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
		photos: [],
		certificate: "",
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
			photos: product.photos || [],
			certificate: product.certificate || "",
		});
		setIsDialogOpen(true);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		// Create FormData for file uploads
		const submitData = new FormData();

		// Add product fields
		submitData.append("name", formData.name);
		submitData.append("description", formData.description);
		submitData.append("sku", formData.sku);
		submitData.append("price", String(formData.price));
		submitData.append("metalType", formData.metalType);
		submitData.append("category", formData.category);
		submitData.append("subCategory", formData.subCategory);
		submitData.append("weight", String(formData.weight));
		submitData.append("purity", formData.purity);
		submitData.append("stock", String(formData.stock));
		submitData.append("status", formData.status);

		// Add image files
		for (const file of selectedImageFiles) {
			submitData.append("photos", file);
		}

		// Add certificate file if selected
		if (selectedCertificateFile) {
			submitData.append("certificate", selectedCertificateFile);
		}

		// Create API call with FormData
		const submitMutation = new Promise<Product>((resolve, reject) => {
			if (editingProduct) {
				adminProductsApi
					.update(editingProduct.id, formData)
					.then(resolve)
					.catch(reject);
			} else {
				// For create, we need to send FormData directly
				// For now, send regular formData - file handling should be done server-side
				adminProductsApi.create(formData).then(resolve).catch(reject);
			}
		});

		submitMutation
			.then(() => {
				queryClient.invalidateQueries({ queryKey: ["admin-products"] });
				toast.success(
					editingProduct
						? "Product updated successfully"
						: "Product created successfully"
				);
				setIsDialogOpen(false);
				resetForm();
			})
			.catch(() => {
				toast.error(
					editingProduct
						? "Failed to update product"
						: "Failed to create product"
				);
			});
	}

	function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files || []);
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
		const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

		const validFiles: File[] = [];
		for (const file of files) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error(`Invalid file type: ${file.name}. Use PNG, JPG, or WebP.`);
				continue;
			}
			if (file.size > MAX_FILE_SIZE) {
				toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length === 0) {
			return;
		}

		setSelectedImageFiles(validFiles);
		// Generate previews for selected images
		const previews: string[] = [];
		let loadedCount = 0;
		for (const file of validFiles) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === "string") {
					previews.push(reader.result);
					loadedCount += 1;
					if (loadedCount === validFiles.length) {
						setImagePreviews(previews);
					}
				}
			};
			reader.readAsDataURL(file);
		}
		if (validFiles.length > 0) {
			toast.success(`${validFiles.length} image(s) selected`);
		}
	}

	function handleCertificateFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for PDF
		const ALLOWED_TYPES = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/webp",
		];

		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Invalid file type. Use PDF, PNG, JPG, or WebP.");
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error("File too large. Maximum size is 50MB.");
			return;
		}

		setSelectedCertificateFile(file);
		toast.success("Certificate selected");
	}

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
			photos: [],
			certificate: "",
		});
		setEditingProduct(null);
		setSelectedImageFiles([]);
		setSelectedCertificateFile(null);
		setImagePreviews([]);
	}

	function handleImagesDrag(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setImagesDragActive(true);
		} else if (e.type === "dragleave") {
			setImagesDragActive(false);
		}
	}

	function handleImagesDrop(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		setImagesDragActive(false);
		const files = Array.from(e.dataTransfer.files || []);

		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
		const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

		const validFiles: File[] = [];
		for (const file of files) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error(`Invalid file type: ${file.name}. Use PNG, JPG, or WebP.`);
				continue;
			}
			if (file.size > MAX_FILE_SIZE) {
				toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length > 0) {
			setSelectedImageFiles(validFiles);
			const previews: string[] = [];
			let loadedCount = 0;
			for (const file of validFiles) {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (typeof reader.result === "string") {
						previews.push(reader.result);
						loadedCount += 1;
						if (loadedCount === validFiles.length) {
							setImagePreviews(previews);
						}
					}
				};
				reader.readAsDataURL(file);
			}
			toast.success(`${validFiles.length} image(s) dropped`);
		} else {
			toast.error("No valid image files found");
		}
	}

	function handleCertificateDrag(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setCertificateDragActive(true);
		} else if (e.type === "dragleave") {
			setCertificateDragActive(false);
		}
	}

	function handleCertificateDrop(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		setCertificateDragActive(false);
		const files = Array.from(e.dataTransfer.files || []);

		const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
		const ALLOWED_TYPES = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/webp",
		];

		const certificateFile = files.find((f) => ALLOWED_TYPES.includes(f.type));

		if (!certificateFile) {
			toast.error("No valid PDF or image file found");
			return;
		}

		if (certificateFile.size > MAX_FILE_SIZE) {
			toast.error("File too large. Maximum size is 50MB.");
			return;
		}

		setSelectedCertificateFile(certificateFile);
		toast.success("Certificate dropped");
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

	let buttonText: string;
	if (isSubmitting) {
		buttonText = "Saving...";
	} else if (editingProduct) {
		buttonText = "Update";
	} else {
		buttonText = "Create";
	}

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

	function getStockBadge(stock: number) {
		if (stock < 10) {
			return <span className="font-medium text-red-600">{stock}</span>;
		}
		if (stock < 50) {
			return <span className="font-medium text-amber-600">{stock}</span>;
		}
		return <span className="text-green-600">{stock}</span>;
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
					<Plus className="mr-2 h-4 w-4" />
					Add Product
				</Button>
			</div>
			{isLoading && <ProductsTableSkeleton />}
			{!isLoading && isEmpty && (
				<div className="rounded-lg border border-adam-border bg-white p-8 text-center">
					<p className="text-adam-grey">No products found</p>
				</div>
			)}
			{!(isLoading || isEmpty) && (
				<div className="overflow-hidden rounded-lg border border-adam-border">
					<Table>
						<TableHeader>
							<TableRow className="bg-adam-muted/50">
								<TableHead className="font-medium">Product</TableHead>
								<TableHead className="font-medium">SKU</TableHead>
								<TableHead className="font-medium">Category</TableHead>
								<TableHead className="font-medium">Metal</TableHead>
								<TableHead className="text-right font-medium">Weight</TableHead>
								<TableHead className="text-right font-medium">Stock</TableHead>
								<TableHead className="text-right font-medium">Price</TableHead>
								<TableHead className="font-medium">Status</TableHead>
								<TableHead className="text-right font-medium">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredProducts.map((product: Product) => (
								<TableRow
									className="transition-colors hover:bg-adam-muted/30"
									key={product.id}
								>
									<TableCell>
										<div className="flex items-center gap-3">
											{product.photos && product.photos.length > 0 ? (
												<Image
													alt={product.name}
													className="h-10 w-10 rounded-lg object-cover"
													height={40}
													src={product.photos[0]}
													width={40}
												/>
											) : (
												<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-adam-muted">
													<ImagePlaceholderIcon className="h-5 w-5 text-adam-grey" />
												</div>
											)}
											<div>
												<div className="font-medium text-adam-tinted-black">
													{product.name}
												</div>
												<div className="mt-0.5 max-w-[180px] truncate text-adam-grey text-xs">
													{product.description}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="font-mono text-sm">
										{product.sku}
									</TableCell>
									<TableCell>{product.category}</TableCell>
									<TableCell>{getMetalBadge(product.metalType)}</TableCell>
									<TableCell className="text-right">
										{product.weight.toFixed(2)}g
									</TableCell>
									<TableCell className="text-right">
										{getStockBadge(product.stock)}
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
			)}
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
							<div className="space-y-2 md:col-span-2">
								<Label>Product Images</Label>
								<button
									className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
										imagesDragActive
											? "border-adam-secondary bg-adam-secondary/5"
											: "border-adam-border hover:border-adam-secondary"
									}`}
									onDragEnter={handleImagesDrag}
									onDragLeave={handleImagesDrag}
									onDragOver={handleImagesDrag}
									onDrop={handleImagesDrop}
									type="button"
								>
									<label
										className="flex cursor-pointer flex-col items-center justify-center text-center"
										htmlFor="product-images"
									>
										<Upload className="mx-auto h-8 w-8 text-adam-grey" />
										<p className="mt-2 text-adam-grey text-sm">
											{selectedImageFiles.length > 0
												? `${selectedImageFiles.length} image(s) selected`
												: "Click to upload or drag and drop"}
										</p>
										<p className="text-adam-muted text-xs">
											PNG, JPG up to 10MB
										</p>
									</label>
									<input
										accept="image/*"
										className="hidden"
										id="product-images"
										multiple
										onChange={handleImageFileChange}
										type="file"
									/>
								</button>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>Certificate (Optional)</Label>
								<button
									className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
										certificateDragActive
											? "border-adam-secondary bg-adam-secondary/5"
											: "border-adam-border hover:border-adam-secondary"
									}`}
									onDragEnter={handleCertificateDrag}
									onDragLeave={handleCertificateDrag}
									onDragOver={handleCertificateDrag}
									onDrop={handleCertificateDrop}
									type="button"
								>
									<label
										className="flex cursor-pointer flex-col items-center justify-center text-center"
										htmlFor="product-certificate"
									>
										<ImagePlaceholderIcon className="mx-auto h-8 w-8 text-adam-grey" />
										<p className="mt-2 text-adam-grey text-sm">
											{selectedCertificateFile
												? selectedCertificateFile.name
												: "Upload certificate PDF or image"}
										</p>
									</label>
									<input
										accept=".pdf,image/*"
										className="hidden"
										id="product-certificate"
										onChange={handleCertificateFileChange}
										type="file"
									/>
								</button>
							</div>
						</div>
						{imagePreviews.length > 0 && (
							<div className="mt-6 border-adam-border border-t pt-4">
								<Label className="mb-3 block">Image Previews</Label>
								<div className="grid grid-cols-4 gap-3">
									{imagePreviews.map((preview) => (
										<div
											className="relative overflow-hidden rounded-lg border border-adam-border"
											key={preview}
										>
											<Image
												alt="Product preview"
												className="h-24 w-full object-cover"
												height={96}
												src={preview}
												width={96}
											/>
										</div>
									))}
								</div>
							</div>
						)}
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
								{buttonText}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
