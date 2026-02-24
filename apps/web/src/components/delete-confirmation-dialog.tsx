"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	description?: string;
	isLoading?: boolean;
}

export function DeleteConfirmationDialog({
	open,
	onConfirm,
	onCancel,
	title = "Delete",
	description = "Are you sure you want to delete this item? This action cannot be undone.",
	isLoading = false,
}: DeleteConfirmationDialogProps) {
	return (
		<Dialog onOpenChange={(isOpen) => !isOpen && onCancel()} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button disabled={isLoading} onClick={onCancel} variant="outline">
						Cancel
					</Button>
					<Button
						className="bg-adam-danger hover:bg-adam-danger/90"
						disabled={isLoading}
						onClick={onConfirm}
					>
						{isLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
