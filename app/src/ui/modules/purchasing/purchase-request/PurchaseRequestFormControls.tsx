import type { ReactNode } from "react";

export const PurchaseRequestFieldClassName =
	"h-11 w-full min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";

export const PurchaseRequestTextareaClassName =
	"min-h-24 w-full min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";

export function PurchaseRequestFormField({
	children,
	className,
	error,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
			<span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-2 block text-xs font-semibold text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}
