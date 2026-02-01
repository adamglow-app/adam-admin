import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

let isInitialized = false;

export function initSuperTokens() {
	if (typeof window !== "undefined" && !isInitialized) {
		SuperTokens.init({
			appInfo: {
				appName: "adam-admin",
				apiDomain: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
				websiteDomain:
					process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3001",
				apiBasePath: "/auth",
				websiteBasePath: "/auth",
			},
			recipeList: [
				EmailPassword.init({
					onHandleEvent: (context) => {
						if (context.action === "SUCCESS" && typeof window !== "undefined") {
							window.location.href = "/dashboard";
						}
					},
				}),
				Session.init({
					onHandleEvent: (context) => {
						if (
							context.action === "SIGN_OUT" &&
							typeof window !== "undefined"
						) {
							window.location.href = "/auth";
						}
					},
				}),
			],
		});
		isInitialized = true;
	}
}
