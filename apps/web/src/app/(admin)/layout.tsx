"use client";

import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionAuth>
			<div className="flex min-h-screen bg-white">
				<Sidebar />
				<main className="flex-1 p-8">{children}</main>
			</div>
		</SessionAuth>
	);
}
