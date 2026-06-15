import type { ReactNode } from "react";

export function TransactionNumberSetupField({
	children,
	error,
	label,
}: {
	children: ReactNode;
	error?: string;
	label: string;
}) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

export const transactionNumberFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";

export const transactionNumberPrimaryButtonClassName =
	"inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 disabled:cursor-not-allowed disabled:opacity-60";
