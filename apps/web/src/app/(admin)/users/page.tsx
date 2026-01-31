"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
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

function UsersTableSkeleton() {
	return (
		<div className="rounded-md border border-adam-border">
			<Table>
				<TableHeader>
					<TableRow className="bg-adam-muted/30">
						{[
							"User",
							"Phone",
							"KYC",
							"Gold Balance",
							"Silver Balance",
							"Referral",
							"Joined",
						].map((header) => (
							<TableHead className="font-medium" key={header}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow className="hover:bg-adam-muted/20" key={`skeleton-${i}`}>
							<TableCell>
								<div className="space-y-1">
									<Skeleton className="h-4 w-40" />
									<Skeleton className="h-3 w-24" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-28" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function EmptyTable() {
	return (
		<div className="rounded-lg border border-adam-border bg-white p-8 text-center">
			<p className="text-adam-grey">No users found</p>
		</div>
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
		if (!data?.users) {
			return [];
		}
		return data.users.filter((user) => {
			const searchLower = search.toLowerCase();
			return (
				user.email.toLowerCase().includes(searchLower) ||
				user.firstName.toLowerCase().includes(searchLower) ||
				user.lastName.toLowerCase().includes(searchLower) ||
				(user.phoneNumber && user.phoneNumber.includes(search))
			);
		});
	}, [data?.users, search]);

	const sortedUsers = useMemo(() => {
		if (!sortBy) {
			return filteredUsers;
		}
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

	function getKycBadge(status: string) {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			verified: "default",
			pending: "secondary",
			rejected: "destructive",
		};
		return (
			<Badge className="text-xs" variant={variants[status] || "outline"}>
				{status}
			</Badge>
		);
	}

	function formatBalance(value: number | undefined, unit: string) {
		if (value === undefined || value === 0) {
			return "-";
		}
		return `${value.toFixed(3)} ${unit}`;
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="border-adam-border border-b pb-4">
					<h1 className="font-semibold text-adam-tinted-black text-xl">
						Users
					</h1>
					<p className="mt-0.5 text-adam-grey text-sm">Manage user accounts</p>
				</div>
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
					Error loading users. Please try again.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="border-adam-border border-b pb-4">
				<h1 className="font-semibold text-adam-tinted-black text-xl">Users</h1>
				<p className="mt-0.5 text-adam-grey text-sm">Manage user accounts</p>
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-md flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-adam-grey" />
					<Input
						className="border-adam-border pl-9 focus:border-adam-secondary focus:ring-adam-secondary/20"
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(0);
						}}
						placeholder="Search by email or name..."
						value={search}
					/>
				</div>
				<p className="text-adam-grey text-sm">
					Total: {data?.total?.toLocaleString() ?? 0} users
				</p>
			</div>

			{isLoading ? (
				<UsersTableSkeleton />
			) : filteredUsers.length === 0 ? (
				<EmptyTable />
			) : (
				<>
					<div className="overflow-hidden rounded-lg border border-adam-border bg-white">
						<Table>
							<TableHeader>
								<TableRow className="bg-adam-muted/50 hover:bg-adam-muted/50">
									<TableHead className="font-medium">
										<Button
											className="p-0 hover:bg-transparent"
											onClick={() => handleSort("email")}
											variant="ghost"
										>
											User
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</Button>
									</TableHead>
									<TableHead className="font-medium">Phone</TableHead>
									<TableHead className="font-medium">KYC Status</TableHead>
									<TableHead className="text-right font-medium">
										Gold Balance
									</TableHead>
									<TableHead className="text-right font-medium">
										Silver Balance
									</TableHead>
									<TableHead className="font-medium">Referral Code</TableHead>
									<TableHead className="font-medium">
										<Button
											className="p-0 hover:bg-transparent"
											onClick={() => handleSort("createdAt")}
											variant="ghost"
										>
											Joined
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</Button>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedUsers.map((user) => (
									<TableRow
										className="border-adam-border/50 transition-colors hover:bg-adam-muted/20"
										key={user.id}
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-full bg-adam-muted font-medium text-sm">
													{user.firstName?.charAt(0)}
													{user.lastName?.charAt(0)}
												</div>
												<div>
													<div className="font-medium text-adam-tinted-black">
														{user.firstName} {user.lastName}
													</div>
													<div className="text-adam-grey text-xs">
														{user.email}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-sm">
											{user.phoneNumber || "-"}
										</TableCell>
										<TableCell>{getKycBadge(user.kycStatus)}</TableCell>
										<TableCell className="text-right font-medium">
											{formatBalance(user.balances?.gold, "g")}
										</TableCell>
										<TableCell className="text-right font-medium">
											{formatBalance(user.balances?.silver, "g")}
										</TableCell>
										<TableCell>
											<Badge
												className="bg-adam-muted/50 text-adam-grey hover:bg-adam-muted"
												variant="secondary"
											>
												{user.referralCode || "-"}
											</Badge>
										</TableCell>
										<TableCell className="text-adam-grey text-sm">
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between">
							<p className="text-adam-grey text-sm">
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
				</>
			)}
		</div>
	);
}
