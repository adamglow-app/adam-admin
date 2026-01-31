"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function UsersTableSkeleton() {
	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							{["Email", "Name", "Phone", "Referral Code", "Created"].map(
								(header) => (
									<TableHead key={header}>
										<Skeleton className="h-4 w-20" />
									</TableHead>
								)
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								{Array.from({ length: 5 }).map((_, j) => (
									<TableCell key={j}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function EmptyTable() {
	return (
		<Card className="border border-gray-200 bg-white">
			<CardContent className="p-8 text-center">
				<p className="text-gray-500">No users found</p>
			</CardContent>
		</Card>
	);
}

export default function UsersPage() {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<"email" | "createdAt" | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [page, setPage] = useState(0);
	const pageSize = 10;

	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => adminUsersApi.list({ limit: 100 }),
		retry: false,
	});

	const filteredUsers = useMemo(() => {
		if (!data?.users) return [];
		return data.users.filter(
			(user) =>
				user.email.toLowerCase().includes(search.toLowerCase()) ||
				user.firstName.toLowerCase().includes(search.toLowerCase()) ||
				user.lastName.toLowerCase().includes(search.toLowerCase())
		);
	}, [data?.users, search]);

	const sortedUsers = useMemo(() => {
		if (!sortBy) return filteredUsers;
		return [...filteredUsers].sort((a, b) => {
			if (sortBy === "email") {
				return sortOrder === "asc"
					? a.email.localeCompare(b.email)
					: b.email.localeCompare(a.email);
			}
			if (sortBy === "createdAt") {
				return sortOrder === "asc"
					? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
			return 0;
		});
	}, [filteredUsers, sortBy, sortOrder]);

	const paginatedUsers = sortedUsers.slice(
		page * pageSize,
		(page + 1) * pageSize
	);
	const totalPages = Math.ceil(sortedUsers.length / pageSize);

	function handleSort(field: "email" | "createdAt") {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	}

	return (
		<div className="animate-fade-in space-y-6">
			<div className="border-gray-200 border-b pb-4">
				<h1 className="font-semibold text-gray-900 text-xl">Users</h1>
				<p className="mt-0.5 text-gray-500 text-sm">Manage user accounts</p>
			</div>

			<div className="flex items-center justify-between">
				<Input
					className="max-w-sm"
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0);
					}}
					placeholder="Search by email or name..."
					value={search}
				/>
				<p className="text-gray-500 text-sm">Total: {data?.total ?? 0} users</p>
			</div>

			{isLoading ? (
				<UsersTableSkeleton />
			) : filteredUsers.length === 0 ? (
				<EmptyTable />
			) : (
				<Card className="border border-gray-200 bg-white">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<Button
											className="p-0 hover:bg-transparent"
											onClick={() => handleSort("email")}
											variant="ghost"
										>
											Email
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Referral Code</TableHead>
									<TableHead>
										<Button
											className="p-0 hover:bg-transparent"
											onClick={() => handleSort("createdAt")}
											variant="ghost"
										>
											Created
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</Button>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.email}</TableCell>
										<TableCell>
											{user.firstName} {user.lastName}
										</TableCell>
										<TableCell>{user.phoneNumber || "-"}</TableCell>
										<TableCell>
											<Badge
												className="bg-gray-100 text-gray-700 hover:bg-gray-200"
												variant="secondary"
											>
												{user.referralCode}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-gray-500 text-sm">
						Showing {page * pageSize + 1} to{" "}
						{Math.min((page + 1) * pageSize, sortedUsers.length)} of{" "}
						{sortedUsers.length} results
					</p>
					<div className="flex gap-2">
						<Button
							disabled={page === 0}
							onClick={() => setPage(page - 1)}
							size="sm"
							variant="outline"
						>
							Previous
						</Button>
						<Button
							disabled={page >= totalPages - 1}
							onClick={() => setPage(page + 1)}
							size="sm"
							variant="outline"
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
