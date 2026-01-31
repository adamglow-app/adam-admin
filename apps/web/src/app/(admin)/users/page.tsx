"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminUsersApi } from "@/lib/api/admin/users";
import type { AdminUserListItem } from "@/lib/api/types";

function UserSkeletonRow({ keyVal }: { keyVal: string }) {
	return (
		<TableRow key={keyVal}>
			<TableCell>
				<Skeleton className="h-4 w-40" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-32" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-28" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-24" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-32" />
			</TableCell>
		</TableRow>
	);
}

function UserRow({ user }: { user: AdminUserListItem }) {
	return (
		<TableRow key={user.id}>
			<TableCell className="font-medium">{user.email}</TableCell>
			<TableCell>
				{user.firstName} {user.lastName}
			</TableCell>
			<TableCell>{user.phoneNumber}</TableCell>
			<TableCell>
				<Badge variant="outline">{user.referralCode}</Badge>
			</TableCell>
			<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
		</TableRow>
	);
}

function EmptyRow() {
	return (
		<TableRow>
			<TableCell className="py-8 text-center" colSpan={5}>
				No users found
			</TableCell>
		</TableRow>
	);
}

function Pagination({
	page,
	totalPages,
	onPrev,
	onNext,
}: {
	page: number;
	totalPages: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	const canGoPrev = page > 0;
	const canGoNext = page < totalPages - 1;

	return (
		<div className="flex items-center justify-between">
			<div className="text-muted-foreground text-sm">
				Page {page + 1} of {totalPages}
			</div>
			<div className="flex gap-2">
				<Button disabled={!canGoPrev} onClick={onPrev} variant="outline">
					Previous
				</Button>
				<Button disabled={!canGoNext} onClick={onNext} variant="outline">
					Next
				</Button>
			</div>
		</div>
	);
}

export default function UsersPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const pageSize = 10;

	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => adminUsersApi.list({ limit: 100 }),
	});

	const filteredUsers =
		data?.users.filter(
			(user) =>
				user.email.toLowerCase().includes(search.toLowerCase()) ||
				user.firstName.toLowerCase().includes(search.toLowerCase()) ||
				user.lastName.toLowerCase().includes(search.toLowerCase())
		) ?? [];

	const paginatedUsers = filteredUsers.slice(
		page * pageSize,
		(page + 1) * pageSize
	);

	const totalPages = Math.ceil(filteredUsers.length / pageSize);
	const showPagination = totalPages > 1;
	const isEmpty = paginatedUsers.length === 0;

	if (error) {
		return (
			<div className="space-y-8">
				<h1 className="font-bold text-3xl">Users</h1>
				<div className="text-red-500">
					Error loading users. Please try again.
				</div>
			</div>
		);
	}

	let tableContent: React.ReactNode;

	if (isLoading) {
		tableContent = Array.from({ length: 5 }).map((_, i) => (
			<UserSkeletonRow key={`skeleton-${i}`} keyVal={`skeleton-${i}`} />
		));
	} else if (isEmpty) {
		tableContent = <EmptyRow />;
	} else {
		tableContent = paginatedUsers.map((user: AdminUserListItem) => (
			<UserRow key={user.id} user={user} />
		));
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Users</h1>
				<div className="text-muted-foreground text-sm">
					Total: {data?.total ?? 0} users
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Input
					className="max-w-sm"
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0);
					}}
					placeholder="Search by email or name..."
					value={search}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Email</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Referral Code</TableHead>
							<TableHead>Created At</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{tableContent}</TableBody>
				</Table>
			</div>

			{showPagination ? (
				<Pagination
					onNext={() => setPage(page + 1)}
					onPrev={() => setPage(page - 1)}
					page={page}
					totalPages={totalPages}
				/>
			) : null}
		</div>
	);
}
