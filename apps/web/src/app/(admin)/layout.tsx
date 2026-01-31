import { Sidebar } from "@/components/admin/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<div className="flex min-h-screen bg-white">
				<Sidebar />
				<main className="flex-1 p-8">{children}</main>
			</div>
		</ProtectedRoute>
	);
}
