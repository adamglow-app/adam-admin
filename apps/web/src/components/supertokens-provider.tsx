"use client";

import { useEffect, useState } from "react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { initSuperTokens } from "@/lib/supertokens";

export function SuperTokensProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		initSuperTokens();
		setInitialized(true);
	}, []);

	if (!initialized) {
		return <>{children}</>;
	}

	return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
}
