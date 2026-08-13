import type { ReactNode } from "react";

export const approvalManagementFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

export const approvalManagementPrimaryButtonClassName =
	"theme-accent-contrast-text inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold !text-[var(--skyblue-contrast)] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)] disabled:cursor-not-allowed disabled:opacity-60";

type ApprovalManagementFieldProps = {
	children: ReactNode;
	error?: string;
	label: string;
};

export function ApprovalManagementField({
	children,
	error,
	label,
}: ApprovalManagementFieldProps) {
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

type ApprovalReadOnlyFieldProps = {
	label: string;
	value: string;
};

export function ApprovalReadOnlyField({
	label,
	value,
}: ApprovalReadOnlyFieldProps) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
			</span>
			<input
				value={value}
				readOnly
				className={`${approvalManagementFieldClassName} bg-offwhite/65`}
			/>
		</label>
	);
}
