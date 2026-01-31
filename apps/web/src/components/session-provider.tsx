"use client";

import { useEffect } from "react";
import { initSuperTokens } from "@/lib/supertokens";

export function SessionProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// Initialize SuperTokens once when app loads
		initSuperTokens();
	}, []);

	return <>{children}</>;
}
