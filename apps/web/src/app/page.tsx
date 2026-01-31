"use client";

import { useEffect, useState } from "react";
import Session from "supertokens-auth-react/recipe/session";

export default function Home() {
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		async function checkAuth() {
			try {
				const sessionExists = await Session.doesSessionExist();
				if (sessionExists) {
					window.location.href = "/dashboard";
				} else {
					window.location.href = "/auth";
				}
			} catch {
				window.location.href = "/auth";
			} finally {
				setChecking(false);
			}
		}
		checkAuth();
	}, []);

	if (checking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-gray-500 text-sm">Loading...</div>
			</div>
		);
	}

	return null;
}
