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
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{ name: "Users", href: "/users", icon: Users },
	{ name: "Products", href: "/products", icon: Package },
	{ name: "Pricing", href: "/pricing", icon: DollarSign },
	{ name: "Payments", href: "/payments", icon: CreditCard },
	{ name: "Referrals", href: "/referrals", icon: Gift },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="flex min-h-screen w-64 flex-col bg-gray-900 text-white">
			<div className="border-gray-800 border-b p-6">
				<h1 className="font-bold text-xl">Adam Admin</h1>
			</div>
			<nav className="flex-1 space-y-1 px-4 py-6">
				{navigation.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/" && pathname.startsWith(item.href));
					return (
						<Link
							className={cn(
								"flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
								isActive
									? "bg-gray-800 text-white"
									: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
							)}
							// @ts-expect-error Next.js 16 href type is complex
							href={item.href}
							key={item.name}
						>
							<item.icon className="h-5 w-5" />
							{item.name}
						</Link>
					);
				})}
			</nav>
			<div className="border-gray-800 border-t p-4">
				<button
					className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-red-900/20"
					onClick={() => logout()}
					type="button"
				>
					<LogOut className="h-5 w-5" />
					Sign Out
				</button>
			</div>
		</div>
	);
}
