"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
	adminSchemesApi,
	type CreateSchemeData,
	type UpdateSchemeData,
} from "@/lib/api/admin/schemes";
import type { Scheme } from "@/lib/api/types";

interface SchemeDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	scheme?: Scheme;
}

export function SchemeDialog({
	open,
	onClose,
	onSuccess,
	scheme,
}: SchemeDialogProps) {
	const { toast } = useToast();
	const [formData, setFormData] = useState({
		name: scheme?.name ?? "",
		description: scheme?.description ?? "",
		termsAndConditions: scheme?.termsAndConditions ?? "",
		isActive: scheme?.isActive ?? true,
	});

	const createMutation = useMutation<Scheme, Error, CreateSchemeData>({
		mutationFn: (data) => adminSchemesApi.create(data),
		onSuccess: () => {
			onSuccess();
			setFormData({
				name: "",
				description: "",
				termsAndConditions: "",
				isActive: true,
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to create scheme",
				variant: "destructive",
			});
		},
	});

	const updateMutation = useMutation<Scheme, Error, UpdateSchemeData>({
		mutationFn: (data) =>
			scheme ? adminSchemesApi.update(scheme.id, data) : Promise.reject(),
		onSuccess: () => {
			onSuccess();
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update scheme",
				variant: "destructive",
			});
		},
	});

	const isLoading = createMutation.isPending || updateMutation.isPending;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast({
				title: "Error",
				description: "Scheme name is required",
				variant: "destructive",
			});
			return;
		}

		if (scheme) {
			updateMutation.mutate(formData);
		} else {
			createMutation.mutate(formData);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setFormData({
				name: "",
				description: "",
				termsAndConditions: "",
				isActive: true,
			});
			onClose();
		}
	};

	const getButtonLabel = () => {
		if (isLoading) {
			return "Saving...";
		}
		return scheme ? "Update" : "Create";
	};

	return (
		<Dialog onOpenChange={handleClose} open={open}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{scheme ? "Update Scheme" : "Create New Scheme"}
					</DialogTitle>
					<DialogDescription>
						{scheme
							? "Update the scheme details"
							: "Add a new investment scheme to the system"}
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="name">Scheme Name *</Label>
						<Input
							disabled={isLoading}
							id="name"
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="e.g., Gold Savings Plan"
							value={formData.name}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<textarea
							className="w-full rounded-md border border-adam-border/50 bg-white px-3 py-2 text-sm disabled:opacity-50"
							disabled={isLoading}
							id="description"
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Describe the scheme..."
							rows={3}
							value={formData.description}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="terms">Terms and Conditions</Label>
						<textarea
							className="w-full rounded-md border border-adam-border/50 bg-white px-3 py-2 text-sm disabled:opacity-50"
							disabled={isLoading}
							id="terms"
							onChange={(e) =>
								setFormData({
									...formData,
									termsAndConditions: e.target.value,
								})
							}
							placeholder="Enter terms and conditions..."
							rows={4}
							value={formData.termsAndConditions}
						/>
					</div>

					{scheme && (
						<div className="flex items-center gap-3 rounded-lg border border-adam-border/30 bg-adam-scaffold-background/50 p-3">
							<Label
								className="m-0 flex flex-1 cursor-pointer items-center gap-2"
								htmlFor="isActive"
							>
								<input
									checked={formData.isActive}
									disabled={isLoading}
									id="isActive"
									onChange={(e) =>
										setFormData({ ...formData, isActive: e.target.checked })
									}
									type="checkbox"
								/>
								<span className="text-sm">Active</span>
							</Label>
							<Badge
								className={`text-xs ${
									formData.isActive
										? "border border-emerald-200 bg-emerald-50 text-emerald-700"
										: "border border-gray-200 bg-gray-50 text-gray-700"
								}`}
								variant="outline"
							>
								{formData.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
					)}

					<div className="flex justify-end gap-3 pt-4">
						<Button
							disabled={isLoading}
							onClick={handleClose}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
						<Button disabled={isLoading} type="submit">
							{getButtonLabel()}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
