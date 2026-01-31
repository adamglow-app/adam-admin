import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
	emptyStringAsUndefined: true,
	runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
});
