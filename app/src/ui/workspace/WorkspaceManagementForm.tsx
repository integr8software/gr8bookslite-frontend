import type { ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export const WorkspaceManagementFieldClassName =
	"h-12 w-full rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-offwhite/70 disabled:text-darknavy/45 read-only:bg-offwhite/70";

export function WorkspaceManagementField({
	children,
	error,
	label,
	required = false,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy/70">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="text-sm font-medium text-coralpink">{error}</span>
			) : null}
		</label>
	);
}

export function WorkspaceManagementSection({
	children,
	className,
	description,
	title,
}: {
	children: ReactNode;
	className?: string;
	description?: string;
	title: string;
}) {
	return (
		<section
			className={joinClasses(
				"rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:p-6",
				className,
			)}
		>
			<div className="mb-5">
				<h2 className="text-lg font-semibold text-darknavy">{title}</h2>
				{description ? (
					<p className="mt-2 text-sm leading-6 text-darknavy/55">
						{description}
					</p>
				) : null}
			</div>
			{children}
		</section>
	);
}
