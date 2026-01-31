"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { checkSession } from "@/lib/auth";
import { initSuperTokens } from "@/lib/supertokens";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		initSuperTokens();
	}, []);

	useEffect(() => {
		async function verifySession() {
			try {
				const hasSession = await checkSession();
				if (!hasSession) {
					router.push("/login");
				}
			} catch {
				router.push("/login");
			} finally {
				setIsChecking(false);
			}
		}
		verifySession();
	}, [router]);

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<Skeleton className="h-screen w-full" />
			</div>
		);
	}

	return <>{children}</>;
}
