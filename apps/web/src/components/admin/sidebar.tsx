"use client";

import {
	ChevronRight,
	CreditCard,
	Gift,
	LayoutDashboard,
	LogOut,
	Package,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation: Array<{
	name: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
}> = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
		description: "Overview & analytics",
	},
	{
		name: "Users",
		href: "/users",
		icon: Users,
		description: "Manage customers",
	},
	{
		name: "Products",
		href: "/products",
		icon: Package,
		description: "Product catalog",
	},
	{
		name: "Pricing",
		href: "/pricing",
		icon: TrendingUp,
		description: "Metal prices",
	},
	{
		name: "Payments",
		href: "/payments",
		icon: CreditCard,
		description: "Transactions",
	},
	{
		name: "Referrals",
		href: "/referrals",
		icon: Gift,
		description: "Bonus settings",
	},
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-[280px] flex-col border-adam-border/50 border-r bg-white">
			{/* Logo Section */}
			<div className="flex h-16 items-center gap-3 border-adam-border/50 border-b px-6">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-adam-secondary to-adam-gradient-bottom shadow-sm">
					<span className="font-bold text-sm text-white">A</span>
				</div>
				<div className="flex flex-col">
					<span className="font-semibold text-adam-tinted-black text-sm tracking-tight">
						Adam Admin
					</span>
					<span className="text-[10px] text-adam-trailing">
						Enterprise Dashboard
					</span>
				</div>
			</div>

			{/* Navigation */}
			<nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
				<div className="mb-2 px-3">
					<span className="font-semibold text-[10px] text-adam-trailing uppercase tracking-wider">
						Main Menu
					</span>
				</div>
				<ul className="space-y-1">
					{navigation.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/dashboard" && pathname.startsWith(item.href));

						return (
							<li key={item.name}>
								<Link
									className={cn(
										"group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
										isActive
											? "bg-adam-secondary text-white shadow-sm"
											: "text-adam-grey hover:bg-adam-scaffold-background hover:text-adam-tinted-black"
									)}
									// @ts-expect-error Next.js 16 href type is complex
									href={item.href}
								>
									<div
										className={cn(
											"flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
											isActive
												? "bg-white/20"
												: "bg-adam-scaffold-background group-hover:bg-adam-secondary/10"
										)}
									>
										<item.icon
											className={cn(
												"h-[18px] w-[18px]",
												isActive
													? "text-white"
													: "text-adam-muted group-hover:text-adam-secondary"
											)}
										/>
									</div>
									<div className="flex flex-1 flex-col">
										<span
											className={cn(
												"font-medium text-sm",
												isActive ? "text-white" : ""
											)}
										>
											{item.name}
										</span>
										{item.description && (
											<span
												className={cn(
													"text-[10px]",
													isActive ? "text-white/70" : "text-adam-trailing"
												)}
											>
												{item.description}
											</span>
										)}
									</div>
									{isActive && (
										<ChevronRight className="h-4 w-4 text-white/70" />
									)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Bottom Section */}
			<div className="border-adam-border/50 border-t p-3">
				{/* User Profile & Logout */}
				<div className="flex items-center justify-between rounded-xl bg-adam-scaffold-background p-3">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-adam-secondary to-adam-gradient-bottom">
							<span className="font-semibold text-white text-xs">AD</span>
						</div>
						<div className="flex flex-col">
							<span className="font-medium text-adam-tinted-black text-sm">
								Admin
							</span>
							<span className="text-[10px] text-adam-trailing">
								Super Admin
							</span>
						</div>
					</div>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-lg text-adam-muted transition-colors hover:bg-white hover:text-adam-danger"
						onClick={() => logout()}
						title="Sign out"
						type="button"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}
