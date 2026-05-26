import Link from "next/link";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

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
		<ModuleTableToolbar
			className={joinClasses(
				"rounded-none border-x-0 border-t-0 shadow-none",
				className,
			)}
		>
			{children}
		</ModuleTableToolbar>
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
		<ModuleTableSearch
			label={placeholder}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
		/>
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
		<ModuleTableFilterSelect
			label={label}
			value={value}
			options={[
				{ label: "All", value: "All" },
				...options.map((option) => ({
					label: option,
					value: option,
				})),
			]}
			onChange={onChange}
		/>
	);
}

export function WorkspaceCompaniesResetButton({
	onClick,
}: {
	onClick: () => void;
}) {
	return (
		<ModuleTableResetButton onClick={onClick}>
			Reset
		</ModuleTableResetButton>
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

