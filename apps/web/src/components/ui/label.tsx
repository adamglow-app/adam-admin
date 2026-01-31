import type { LabelHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	children?: ReactNode;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
	({ className, children, ...props }, ref) => (
		// biome-ignore lint: This is a reusable label component that associates via htmlFor prop
		<label
			className={cn(
				"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className
			)}
			data-slot="label"
			ref={ref}
			{...props}
		>
			{children}
		</label>
	)
);
Label.displayName = "Label";

export { Label };
