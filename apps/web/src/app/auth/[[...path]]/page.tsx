"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";

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
