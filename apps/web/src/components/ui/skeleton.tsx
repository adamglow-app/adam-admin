import { cn } from "@/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("rounded-none bg-white", className)}
			data-slot="skeleton"
			{...props}
		/>
	);
}

export { Skeleton };
