"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkSession } from "@/lib/auth";

export default function Home() {
	const router = useRouter();

	const { data: hasSession, isLoading } = useQuery({
		queryKey: ["session-check"],
		queryFn: async () => {
			const result = await checkSession();
			return result;
		},
		retry: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!isLoading && hasSession !== undefined) {
			if (hasSession === true) {
				router.replace("/dashboard");
			} else if (hasSession === false) {
				router.replace("/login");
			}
		}
	}, [hasSession, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-48 rounded bg-white" />
					<div className="text-gray-500 text-sm">
						Checking authentication...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-white">
			<div className="flex flex-col items-center gap-4">
				<div className="h-8 w-48 rounded bg-white" />
				<div className="text-gray-500 text-sm">Checking authentication...</div>
			</div>
		</div>
	);
}
