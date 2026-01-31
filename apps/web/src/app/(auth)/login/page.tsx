"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { checkSession } from "@/lib/auth";

export default function LoginPage() {
	const router = useRouter();
	const { data: hasSession, isLoading } = useQuery({
		queryKey: ["session"],
		queryFn: checkSession,
		retry: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!isLoading && hasSession) {
			router.replace("/dashboard");
		}
	}, [hasSession, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="w-full max-w-md">
					<div className="mb-6 text-center">
						<div className="mx-auto mb-4 h-8 w-48 rounded bg-white" />
					</div>
					<div className="space-y-4">
						<div className="h-10 rounded bg-white" />
						<div className="h-10 rounded bg-white" />
						<div className="h-10 rounded bg-white" />
					</div>
				</div>
			</div>
		);
	}

	if (hasSession) {
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-white">
			<LoginForm />
		</div>
	);
}
