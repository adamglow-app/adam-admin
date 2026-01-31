import { signIn } from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

export interface AuthError {
	fieldErrors?: Record<string, string>;
	message?: string;
}

export async function login(email: string, password: string) {
	const response = await signIn({
		formFields: [
			{ id: "email", value: email },
			{ id: "password", value: password },
		],
	});

	if (response.status === "FIELD_ERROR") {
		const fieldErrors: Record<string, string> = {};
		for (const field of response.formFields) {
			fieldErrors[field.id] = field.error;
		}
		throw new Error(JSON.stringify({ fieldErrors }));
	}

	if (response.status === "WRONG_CREDENTIALS_ERROR") {
		throw new Error("Invalid email or password");
	}

	if (response.status === "SIGN_IN_NOT_ALLOWED") {
		throw new Error(response.reason);
	}

	return response;
}

export async function logout() {
	await Session.signOut();
	if (typeof window !== "undefined") {
		window.location.href = "/auth";
	}
}

export async function checkSession() {
	return await Session.doesSessionExist();
}
