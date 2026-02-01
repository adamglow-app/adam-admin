"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Search,
	UserCircle,
	Users,
} from "lucide-react";
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
		<Card className="overflow-hidden border-0 shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
						{[
							"User",
							"Phone",
							"KYC",
							"Gold Balance",
							"Silver Balance",
							"Referral",
							"Joined",
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
					{Array.from({ length: 5 }).map((_, i) => {
						const skeletonKey = `user-skeleton-${i}`;
						return (
							<TableRow className="border-adam-border/30" key={skeletonKey}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="space-y-1.5">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-40" />
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-28" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-20 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="ml-auto h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="ml-auto h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-24 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
}

function EmptyTable() {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adam-scaffold-background">
					<UserCircle className="h-8 w-8 text-adam-trailing" />
				</div>
				<h3 className="font-semibold text-adam-tinted-black">No users found</h3>
				<p className="mt-1 text-adam-grey text-sm">
					Try adjusting your search criteria
				</p>
			</CardContent>
		</Card>
	);
}

function getKycBadgeStyles(status: string) {
	if (status === "verified") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (status === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (status === "rejected") {
		return "bg-red-50 text-red-700 border-red-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
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
				user.phoneNumber?.includes(search)
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

	function formatBalance(value: number | undefined, unit: string) {
		if (value === undefined || value === 0) {
			return <span className="text-adam-trailing">-</span>;
		}
		return (
			<span className="font-semibold text-adam-tinted-black">
				{value.toFixed(3)} {unit}
			</span>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl text-adam-tinted-black tracking-tight">
						Users
					</h1>
					<p className="text-adam-grey text-sm">Manage customer accounts</p>
				</div>
				<Card className="border-0 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
					<CardContent className="py-4">
						<p className="font-medium text-red-800">Error loading users</p>
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
					Users
				</h1>
				<p className="text-adam-grey text-sm">
					Manage customer accounts and view their details
				</p>
			</div>

			{/* Stats & Search Bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative max-w-md flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-adam-trailing" />
					<Input
						className="h-11 border-adam-border bg-white pl-10 shadow-sm focus:border-adam-secondary focus:ring-adam-secondary/20"
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(0);
						}}
						placeholder="Search by name, email, or phone..."
						value={search}
					/>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-sm">
						<Users className="h-4 w-4 text-adam-secondary" />
						<span className="font-semibold text-adam-tinted-black text-sm">
							{data?.total?.toLocaleString() ?? 0}
						</span>
						<span className="text-adam-grey text-sm">total users</span>
					</div>
				</div>
			</div>

			{/* Table */}
			{isLoading && <UsersTableSkeleton />}
			{!isLoading && filteredUsers.length === 0 && <EmptyTable />}
			{!isLoading && filteredUsers.length > 0 && (
				<>
					<Card className="overflow-hidden border-0 shadow-sm">
						<Table>
							<TableHeader>
								<TableRow className="border-adam-border/30 bg-adam-scaffold-background/50">
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										<button
											className="flex items-center gap-1 hover:text-adam-tinted-black"
											onClick={() => handleSort("email")}
											type="button"
										>
											User
											<ArrowUpDown className="h-3.5 w-3.5" />
										</button>
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Phone
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										KYC Status
									</TableHead>
									<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Gold Balance
									</TableHead>
									<TableHead className="text-right font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Silver Balance
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										Referral Code
									</TableHead>
									<TableHead className="font-semibold text-adam-grey text-xs uppercase tracking-wider">
										<button
											className="flex items-center gap-1 hover:text-adam-tinted-black"
											onClick={() => handleSort("createdAt")}
											type="button"
										>
											Joined
											<ArrowUpDown className="h-3.5 w-3.5" />
										</button>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedUsers.map((user) => (
									<TableRow
										className="border-adam-border/30 transition-colors hover:bg-adam-scaffold-background/50"
										key={user.id}
									>
										<TableCell className="py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-adam-secondary to-adam-gradient-top font-semibold text-sm text-white">
													{user.firstName?.charAt(0)}
													{user.lastName?.charAt(0)}
												</div>
												<div>
													<p className="font-medium text-adam-tinted-black">
														{user.firstName} {user.lastName}
													</p>
													<p className="text-adam-grey text-xs">{user.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-adam-tinted-black text-sm">
											{user.phoneNumber || (
												<span className="text-adam-trailing">-</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												className={`border font-medium text-xs ${getKycBadgeStyles(user.kycStatus ?? "pending")}`}
												variant="outline"
											>
												{user.kycStatus
													? user.kycStatus.charAt(0).toUpperCase() +
														user.kycStatus.slice(1)
													: "Pending"}
											</Badge>
										</TableCell>
										<TableCell className="text-right text-sm">
											{formatBalance(user.balances?.gold, "g")}
										</TableCell>
										<TableCell className="text-right text-sm">
											{formatBalance(user.balances?.silver, "g")}
										</TableCell>
										<TableCell>
											{user.referralCode ? (
												<code className="rounded bg-adam-scaffold-background px-2 py-1 font-mono text-adam-tinted-black text-xs">
													{user.referralCode}
												</code>
											) : (
												<span className="text-adam-trailing text-sm">-</span>
											)}
										</TableCell>
										<TableCell className="text-adam-grey text-sm">
											{new Date(user.createdAt).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Card>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between">
							<p className="text-adam-grey text-sm">
								Showing{" "}
								<span className="font-medium text-adam-tinted-black">
									{page * pageSize + 1}
								</span>{" "}
								to{" "}
								<span className="font-medium text-adam-tinted-black">
									{Math.min((page + 1) * pageSize, sortedUsers.length)}
								</span>{" "}
								of{" "}
								<span className="font-medium text-adam-tinted-black">
									{sortedUsers.length}
								</span>{" "}
								results
							</p>
							<div className="flex items-center gap-1">
								<Button
									className="h-9 w-9 p-0"
									disabled={page === 0}
									onClick={() => setPage(page - 1)}
									variant="outline"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								{Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
									const pageNum = i;
									return (
										<Button
											className={`h-9 w-9 p-0 ${page === pageNum ? "bg-adam-secondary text-white hover:bg-adam-secondary" : ""}`}
											key={`page-${pageNum}`}
											onClick={() => setPage(pageNum)}
											variant={page === pageNum ? "default" : "outline"}
										>
											{pageNum + 1}
										</Button>
									);
								})}
								<Button
									className="h-9 w-9 p-0"
									disabled={page >= totalPages - 1}
									onClick={() => setPage(page + 1)}
									variant="outline"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
