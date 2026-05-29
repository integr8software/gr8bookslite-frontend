import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RotateCcw, Search } from "lucide-react";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

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

type ModuleTableResetButtonProps = ComponentPropsWithoutRef<"button"> & {
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
				"grid gap-4 bg-white p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(24rem,2.5fr)_repeat(auto-fit,minmax(11rem,1fr))]",
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
				className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
				aria-hidden="true"
			/>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className={joinClasses(
					"h-12 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:ring-4",
					moduleAccentClassNames.hoverBorder,
					"focus:border-[rgb(var(--skyblue-rgb)/0.45)]",
					moduleAccentClassNames.focusRing,
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
			<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
				{label}
			</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(
					"h-12 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:ring-4",
					moduleAccentClassNames.hoverBorder,
					"focus:border-[rgb(var(--skyblue-rgb)/0.45)]",
					moduleAccentClassNames.focusRing,
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

export function ModuleTableResetButton({
	children = "Reset",
	className,
	type = "button",
	...props
}: ModuleTableResetButtonProps) {
	return (
		<button
			type={type}
			className={joinClasses(
				"inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4",
				moduleAccentClassNames.hoverBorder,
				moduleAccentClassNames.hoverSoftBackground,
				moduleAccentClassNames.focusRing,
				className,
			)}
			{...props}
		>
			<RotateCcw className="h-4 w-4" aria-hidden="true" />
			{children}
		</button>
	);
}

