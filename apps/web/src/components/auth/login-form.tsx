"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);

		try {
			await login(email, password);
			toast.success("Login successful");
			router.push("/");
			router.refresh();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Login failed";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-center font-bold text-2xl">
					Admin Login
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							disabled={isLoading}
							id="email"
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@adam.com"
							required
							type="email"
							value={email}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							disabled={isLoading}
							id="password"
							onChange={(e) => setPassword(e.target.value)}
							required
							type="password"
							value={password}
						/>
					</div>
					<Button className="w-full" disabled={isLoading} type="submit">
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
