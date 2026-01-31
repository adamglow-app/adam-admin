"use client";

import { useEffect, useState } from "react";
import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { useRouter } from "next/navigation";

export default function AuthPage() {
	const router = useRouter();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	if (!loaded) {
		return null;
	}

	if (canHandleRoute([EmailPasswordPreBuiltUI])) {
		return getRoutingComponent([EmailPasswordPreBuiltUI]);
	}

	router.replace("/dashboard");
	return null;
}
