"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Image as ImagePlaceholderIcon,
	Package,
	Pencil,
	Plus,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"Product",
							"SKU",
							"Category",
							"Metal",
							"Weight",
							"Stock",
							"Price",
							"Status",
							"Actions",
						].map((header) => (
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
					{["pskel-1", "pskel-2", "pskel-3", "pskel-4", "pskel-5"].map(
						(key) => (
							<TableRow className="border-adam-border/30" key={key}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Skeleton className="h-12 w-12 rounded-xl" />
										<div className="space-y-1.5">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-24 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-16 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-12" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-20 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-8 w-20" />
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyProducts() {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<Package className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">
					No products found
				</h3>
				<p className="mt-1 text-adam-grey text-sm">
					Try adjusting your search or add a new product
				</p>
			</CardContent>
		</Card>
	);
}

function getStatusStyles(status: string) {
	if (status === "active") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "inactive") {
		return "bg-gray-50 text-gray-700 border-gray-200";
	}
	if (status === "out_of_stock") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
}

function getMetalStyles(metal: string) {
	if (metal === "gold") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	return "bg-slate-50 text-slate-700 border-slate-200";
}

function getStockColor(stock: number) {
	if (stock === 0) {
		return "text-red-600 font-semibold";
	}
	if (stock < 10) {
		return "text-amber-600 font-medium";
	}
	return "text-adam-tinted-black";
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
		metalType: "gold" | "silver";
		category: string;
		subCategory: string;
		weight: number;
		purity: string;
		stock: number;
		status: "active" | "inactive" | "out_of_stock";
		photos: string[];
		certificate?: string;
		grossWeight: number;
		netWeight: number;
		stoneWeight: number;
		makingCharge: number;
		wastagePercentage: number;
		gst: number;
		discountPercentage: number;
		discountType: string;
	}>({
		name: "",
		description: "",
		sku: "",
		metalType: "gold",
		category: "",
		subCategory: "",
		weight: 0,
		purity: "999",
		stock: 0,
		status: "active",
		photos: [],
		certificate: "",
		grossWeight: 0,
		netWeight: 0,
		stoneWeight: 0,
		makingCharge: 0,
		wastagePercentage: 0,
		gst: 0,
		discountPercentage: 0,
		discountType: "overall",
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

	function parseNumber(
		value: string | number | null | undefined,
		defaultVal = 0
	): number {
		if (value === undefined || value === null) {
			return defaultVal;
		}
		if (typeof value === "number") {
			return value;
		}
		return Number.parseFloat(value) || defaultVal;
	}

	function handleEdit(product: Product) {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description ?? "",
			sku: product.sku ?? "",
			metalType: product.metalType ?? "gold",
			category: product.category,
			subCategory: product.subCategory ?? "",
			weight: parseNumber(product.weight, 0),
			purity: product.purity ?? "999",
			stock: product.stock ?? 0,
			status: product.status ?? "active",
			photos: product.photos ?? [],
			certificate: product.certificate ?? "",
			grossWeight: parseNumber(product.grossWeight, 0),
			netWeight: parseNumber(product.netWeight, 0),
			stoneWeight: parseNumber(product.stoneWeight, 0),
			makingCharge: parseNumber(product.makingCharge, 0),
			wastagePercentage: parseNumber(product.wastagePercentage, 0),
			gst: parseNumber(product.gst, 0),
			discountPercentage: parseNumber(product.discountPercentage, 0),
			discountType: product.discountType ?? "overall",
		});
		setIsDialogOpen(true);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Cast formData to Partial<Product> to match API expectations
		const productData: Partial<Product> = {
			name: formData.name,
			description: formData.description,
			sku: formData.sku,
			metalType: formData.metalType,
			category: formData.category,
			subCategory: formData.subCategory,
			weight: formData.weight,
			purity: formData.purity,
			stock: formData.stock,
			status: formData.status,
			grossWeight: String(formData.grossWeight),
			netWeight: String(formData.netWeight),
			stoneWeight: String(formData.stoneWeight),
			makingCharge: String(formData.makingCharge),
			wastagePercentage: String(formData.wastagePercentage),
			gst: String(formData.gst),
			discountPercentage: String(formData.discountPercentage),
			discountType: formData.discountType,
		};

		// Create API call with FormData - pass files to API
		const submitMutation = new Promise<Product>((resolve, reject) => {
			if (editingProduct) {
				adminProductsApi
					.update(
						editingProduct.id,
						productData,
						selectedImageFiles.length > 0 ? selectedImageFiles : undefined,
						selectedCertificateFile ?? undefined
					)
					.then(resolve)
					.catch(reject);
			} else {
				adminProductsApi
					.create(
						formData,
						selectedImageFiles.length > 0 ? selectedImageFiles : undefined,
						selectedCertificateFile ?? undefined
					)
					.then(resolve)
					.catch(reject);
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
			metalType: "gold",
			category: "",
			subCategory: "",
			weight: 0,
			purity: "999",
			stock: 0,
			status: "active",
			photos: [],
			certificate: "",
			grossWeight: 0,
			netWeight: 0,
			stoneWeight: 0,
			makingCharge: 0,
			wastagePercentage: 0,
			gst: 0,
			discountPercentage: 0,
			discountType: "overall",
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
				(product.sku ?? "").toLowerCase().includes(search.toLowerCase()) ||
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

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
						Products
					</h1>
					<p className="text-adam-grey text-sm">Manage your product catalog</p>
				</div>
				<Card className="border-0 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
					<CardContent className="py-4">
						<p className="font-medium text-red-800">Error loading products</p>
						<p className="mt-1 text-red-600 text-sm">
							Please try refreshing the page.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
					Products
				</h1>
				<p className="text-adam-grey text-sm">
					Manage your product catalog and inventory
				</p>
			</div>

			{/* Stats & Search Bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative max-w-md flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-adam-trailing" />
					<Input
						className="h-11 border-adam-border bg-white pl-10 shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, SKU, or category..."
						value={search}
					/>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-sm">
						<Package className="h-4 w-4 text-adam-secondary" />
						<span className="font-semibold text-adam-tinted-black text-sm">
							{data?.total?.toLocaleString() ?? 0}
						</span>
						<span className="text-adam-grey text-sm">products</span>
					</div>
					<Button
						className="h-11 bg-adam-secondary px-5 shadow-sm hover:bg-adam-gradient-top"
						onClick={handleOpenCreate}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Product
					</Button>
				</div>
			</div>

			{/* Table */}
			{isLoading && <ProductsTableSkeleton />}
			{!isLoading && isEmpty && <EmptyProducts />}
			{!(isLoading || isEmpty) && (
				<Card className="overflow-hidden border-0 shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
								<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Product
								</TableHead>
								<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
									SKU
								</TableHead>
								<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Category
								</TableHead>
								<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Metal
								</TableHead>
								<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Weight
								</TableHead>
								<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Stock
								</TableHead>
								<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Price
								</TableHead>
								<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Status
								</TableHead>
								<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredProducts.map((product: Product) => (
								<TableRow
									className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
									key={product.id}
								>
									<TableCell className="py-4">
										<div className="flex items-center gap-3">
											{product.photos && product.photos.length > 0 ? (
												<Image
													alt={product.name}
													className="h-12 w-12 rounded-xl object-cover shadow-sm"
													height={48}
													src={product.photos[0]}
													width={48}
												/>
											) : (
												<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-adam-scaffold-background">
													<ImagePlaceholderIcon className="h-5 w-5 text-adam-trailing" />
												</div>
											)}
											<div>
												<p className="font-medium text-adam-tinted-black">
													{product.name}
												</p>
												<p className="mt-0.5 max-w-[200px] truncate text-adam-grey text-xs">
													{product.description}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-xs">
											{product.sku}
										</code>
									</TableCell>
									<TableCell>
										<Badge
											className="border bg-white font-medium text-adam-tinted-black text-xs"
											variant="outline"
										>
											{product.category}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											className={`border font-medium text-xs ${getMetalStyles(product.metalType ?? "gold")}`}
											variant="outline"
										>
											{product.metalType
												? product.metalType.charAt(0).toUpperCase() +
													product.metalType.slice(1)
												: "Gold"}
										</Badge>
									</TableCell>
									<TableCell className="text-right text-sm">
										<span className="font-medium text-adam-tinted-black">
											{typeof product.weight === "string"
												? Number.parseFloat(product.weight).toFixed(2)
												: (product.weight?.toFixed(2) ?? "0.00")}
										</span>
										<span className="text-adam-grey"> g</span>
									</TableCell>
									<TableCell className="text-right text-sm">
										<span className={getStockColor(product.stock ?? 0)}>
											{product.stock ?? 0}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<span className="font-semibold text-adam-tinted-black">
											₹
											{product.price
												? Number.parseFloat(
														String(product.price)
													).toLocaleString()
												: "0"}
										</span>
									</TableCell>
									<TableCell>
										<Badge
											className={`border font-medium text-xs ${getStatusStyles(product.status ?? "active")}`}
											variant="outline"
										>
											{product.status === "out_of_stock"
												? "Out of Stock"
												: (product.status ?? "active").charAt(0).toUpperCase() +
													(product.status ?? "active").slice(1)}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">
											<Button
												className="h-8 w-8 p-0 text-adam-grey hover:bg-adam-scaffold-background hover:text-adam-secondary"
												onClick={() => handleEdit(product)}
												variant="ghost"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												className="h-8 w-8 p-0 text-adam-grey hover:bg-red-50 hover:text-red-600"
												onClick={() => deleteMutation.mutate(product.id)}
												variant="ghost"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent className="max-h-[90vh] w-full max-w-6xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingProduct ? "Edit Product" : "Add New Product"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
								<Select
									onValueChange={(value) =>
										setFormData({ ...formData, category: value || "" })
									}
									value={formData.category}
								>
									<SelectTrigger className="w-full" id="category">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="rings">Rings</SelectItem>
										<SelectItem value="earrings">Earrings</SelectItem>
										<SelectItem value="necklace">Necklace</SelectItem>
										<SelectItem value="bangles">Bangles</SelectItem>
										<SelectItem value="chains">Chains</SelectItem>
									</SelectContent>
								</Select>
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
										{formData.stock > 0 && (
											<SelectItem value="active">Active</SelectItem>
										)}
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="out_of_stock">Out of Stock</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="grossWeight">Gross Weight (g)</Label>
								<Input
									id="grossWeight"
									onChange={(e) =>
										setFormData({
											...formData,
											grossWeight: Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.01"
									type="number"
									value={formData.grossWeight}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="netWeight">Net Weight (g)</Label>
								<Input
									id="netWeight"
									onChange={(e) =>
										setFormData({
											...formData,
											netWeight: Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.01"
									type="number"
									value={formData.netWeight}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="stoneWeight">Stone Weight (g)</Label>
								<Input
									id="stoneWeight"
									onChange={(e) =>
										setFormData({
											...formData,
											stoneWeight: Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.01"
									type="number"
									value={formData.stoneWeight}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="makingCharge">Making Charge (₹)</Label>
								<Input
									id="makingCharge"
									onChange={(e) =>
										setFormData({
											...formData,
											makingCharge: Number.parseFloat(e.target.value) || 0,
										})
									}
									type="number"
									value={formData.makingCharge}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="wastagePercentage">Wastage (%)</Label>
								<Input
									id="wastagePercentage"
									onChange={(e) =>
										setFormData({
											...formData,
											wastagePercentage: Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.1"
									type="number"
									value={formData.wastagePercentage}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="gst">GST (%)</Label>
								<Input
									id="gst"
									onChange={(e) =>
										setFormData({
											...formData,
											gst: Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.1"
									type="number"
									value={formData.gst}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="discountPercentage">Discount (%)</Label>
								<Input
									id="discountPercentage"
									onChange={(e) =>
										setFormData({
											...formData,
											discountPercentage:
												Number.parseFloat(e.target.value) || 0,
										})
									}
									step="0.1"
									type="number"
									value={formData.discountPercentage}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="discountType">Discount Type</Label>
								<Select
									onValueChange={(value) =>
										setFormData({
											...formData,
											discountType: value || "overall",
										})
									}
									value={formData.discountType}
								>
									<SelectTrigger id="discountType">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="overall">Overall</SelectItem>
										<SelectItem value="metal">Metal Only</SelectItem>
										<SelectItem value="making">Making Only</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2 md:col-span-3">
								<Label>Product Images</Label>
								<button
									className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 ${
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
							<div className="space-y-2 md:col-span-3">
								<Label>Certificate (Optional)</Label>
								<button
									className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 ${
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
