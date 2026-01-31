"use client";

import {
	CreditCard,
	DollarSign,
	Gift,
	LayoutDashboard,
	LogOut,
	Package,
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
}> = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Users", href: "/users", icon: Users },
	{ name: "Products", href: "/products", icon: Package },
	{ name: "Pricing", href: "/pricing", icon: DollarSign },
	{ name: "Payments", href: "/payments", icon: CreditCard },
	{ name: "Referrals", href: "/referrals", icon: Gift },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="flex min-h-screen w-64 flex-col border-gray-200 border-r bg-white">
			<div className="p-6">
				<h1 className="font-semibold text-gray-900 text-xl tracking-tight">
					Adam Admin
				</h1>
			</div>

			<nav className="flex-1 px-3 py-4">
				<ul className="space-y-1">
					{navigation.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/dashboard" && pathname.startsWith(item.href));

						return (
							<li key={item.name}>
								<Link
									className={cn(
										"flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-sm",
										isActive
											? "bg-white text-gray-900"
											: "text-gray-600 hover:bg-white hover:text-gray-900"
									)}
									// @ts-expect-error Next.js 16 href type is complex
									href={item.href}
								>
									<item.icon
										className={cn(
											"h-5 w-5",
											isActive ? "text-gray-900" : "text-gray-400"
										)}
									/>
									{item.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="border-gray-100 border-t p-4">
				<button
					className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-600 text-sm hover:bg-white hover:text-gray-900"
					onClick={() => logout()}
					type="button"
				>
					<LogOut className="h-5 w-5 text-gray-400" />
					Sign Out
				</button>
			</div>
		</aside>
	);
}
