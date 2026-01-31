import SuperTokens from "supertokens-web-js";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import Session from "supertokens-web-js/recipe/session";

export function initSuperTokens() {
	if (typeof window !== "undefined") {
		SuperTokens.init({
			appInfo: {
				appName: "adam-admin",
				apiDomain: process.env.NEXT_PUBLIC_API_URL ?? "",
				apiBasePath: "/auth",
			},
			recipeList: [EmailPassword.init(), Session.init()],
		});
	}
}
