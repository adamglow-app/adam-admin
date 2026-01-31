"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { checkSession } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		async function verifySession() {
			try {
				const hasSession = await checkSession();
				if (!hasSession) {
					router.replace("/login");
				}
			} catch {
				router.replace("/login");
			} finally {
				setIsChecking(false);
			}
		}
		verifySession();
	}, [router]);

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<Skeleton className="h-screen w-full" />
			</div>
		);
	}

	return <>{children}</>;
}
