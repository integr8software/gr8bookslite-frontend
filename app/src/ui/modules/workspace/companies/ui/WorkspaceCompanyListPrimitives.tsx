import Link from "next/link";
import { Search } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export const WorkspaceCompaniesActionClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20";

export function WorkspaceCompaniesFilterBar({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={joinClasses(
				"grid gap-3 border-b border-darknavy/10 bg-white p-4",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function WorkspaceCompaniesSearchInput({
	onChange,
	placeholder,
	value,
}: {
	onChange: (value: string) => void;
	placeholder: string;
	value: string;
}) {
	return (
		<label className="flex h-11 items-center gap-3 rounded-lg border border-darknavy/10 px-4 text-sm text-darknavy shadow-sm shadow-darknavy/5">
			<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-darknavy/35"
				placeholder={placeholder}
			/>
		</label>
	);
}

export function WorkspaceCompaniesFilterSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly string[];
	value: string;
}) {
	return (
		<label className="flex min-w-0 items-center gap-2 text-sm font-semibold text-darknavy/55">
			<span className="shrink-0">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-11 min-w-0 flex-1 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/10"
			>
				<option value="All">All</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}

export function WorkspaceCompaniesResetButton({
	onClick,
}: {
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex h-11 items-center justify-center rounded-lg border border-darknavy/10 px-4 text-sm font-semibold text-darknavy/60 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
		>
			Reset
		</button>
	);
}

export function WorkspaceCompaniesTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={joinClasses(
				"px-4 py-4 align-middle text-sm text-darknavy first:pl-5 last:pr-5",
				align === "center" ? "text-center" : "text-left",
			)}
		>
			{children}
		</td>
	);
}

export function WorkspaceCompaniesIconLink({
	children,
	href,
	label,
}: {
	children: React.ReactNode;
	href: string;
	label: string;
}) {
	return (
		<Link
			href={href}
			aria-label={label}
			className="flex h-10 w-10 items-center justify-center rounded-lg text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
		>
			{children}
		</Link>
	);
}
