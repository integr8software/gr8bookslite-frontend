import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Filter, Search } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTableFilterOption = {
	label: ReactNode;
	value: string;
};

type ModuleTableToolbarProps = ComponentPropsWithoutRef<"div"> & {
	children: ReactNode;
};

type ModuleTableSearchProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"onChange" | "type" | "value"
> & {
	label: string;
	onChange: (value: string) => void;
	value: string;
};

type ModuleTableFilterSelectProps = Omit<
	ComponentPropsWithoutRef<"select">,
	"children" | "onChange" | "value"
> & {
	label: string;
	onChange: (value: string) => void;
	options: readonly ModuleTableFilterOption[];
	value: string;
};

type ModuleTableFilterButtonProps = ComponentPropsWithoutRef<"button"> & {
	children?: ReactNode;
};

export function ModuleTableToolbar({
	children,
	className,
	...props
}: ModuleTableToolbarProps) {
	return (
		<div
			className={joinClasses(
				"grid gap-3 bg-white p-4 lg:grid-cols-[minmax(24rem,2.5fr)_repeat(auto-fit,minmax(11rem,1fr))]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function ModuleTableSearch({
	className,
	label,
	onChange,
	placeholder,
	value,
	...props
}: ModuleTableSearchProps) {
	return (
		<label className="relative block min-w-0">
			<span className="sr-only">{label}</span>
			<Search
				className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
				aria-hidden="true"
			/>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className={joinClasses(
					"h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-9 pr-4 text-sm text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15",
					className,
				)}
				{...props}
			/>
		</label>
	);
}

export function ModuleTableFilterSelect({
	className,
	label,
	onChange,
	options,
	value,
	...props
}: ModuleTableFilterSelectProps) {
	return (
		<label className="relative block min-w-0">
			<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-medium text-darknavy/70">
				{label}
			</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(
					"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15",
					className,
				)}
				{...props}
			>
				{options.map((option) => (
					<option key={String(option.value)} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

export function ModuleTableFilterButton({
	children = "Filter",
	className,
	type = "button",
	...props
}: ModuleTableFilterButtonProps) {
	return (
		<button
			type={type}
			className={joinClasses(
				"inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
				className,
			)}
			{...props}
		>
			<Filter className="h-4 w-4" aria-hidden="true" />
			{children}
		</button>
	);
}
