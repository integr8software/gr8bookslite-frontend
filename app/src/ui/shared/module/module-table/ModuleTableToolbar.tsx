"use client";

import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { RefreshCw, Search } from "lucide-react";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { ModuleTableColumnVisibilityButton } from "@/app/src/ui/shared/module/module-table/ModuleTableColumnVisibilityButton";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleTableFilterPopover } from "@/app/src/ui/shared/module/module-table/ModuleTableFilterPopover";
export { ModuleTableColumnVisibilityButton };
export {
	ModuleTableExportButton,
	type ModuleTableExportColumn,
} from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

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
	isRefreshing?: boolean;
};

export function ModuleTableToolbar({
	children,
	className,
	...props
}: ModuleTableToolbarProps) {
	return (
		<div
			className={joinClasses(
				"grid items-stretch gap-4 bg-white p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(18rem,2fr)_repeat(auto-fit,minmax(12rem,1fr))] [&>*]:min-w-0",
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
		<label className="relative block w-full min-w-0">
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
	disabled,
}: ModuleTableFilterSelectProps) {
	return (
		<ModuleTableFilterPopover
			className={joinClasses("w-full min-w-0", className)}
			disabled={disabled}
			label={label}
			value={value}
			options={options}
			onChange={onChange}
		/>
	);
}

export function ModuleTableResetButton({
	children = "Refresh",
	className,
	isRefreshing = false,
	type = "button",
	...props
}: ModuleTableResetButtonProps) {
	const tooltipTitle = typeof children === "string" ? children : "Refresh";
	const [isAnimating, setIsAnimating] = useState(false);
	const { onClick, ...buttonProps } = props;
	const shouldAnimate = isRefreshing || isAnimating;

	useEffect(() => {
		if (!isAnimating) return;

		const timeoutId = window.setTimeout(() => setIsAnimating(false), 600);

		return () => window.clearTimeout(timeoutId);
	}, [isAnimating]);

	return (
		<ModuleTooltip className="w-full" title={tooltipTitle} position="top">
			<button
				type={type}
				aria-busy={shouldAnimate}
				aria-label={buttonProps["aria-label"] ?? tooltipTitle}
				className={joinClasses(
					"inline-flex h-12 w-full items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4",
					moduleAccentClassNames.hoverBorder,
					moduleAccentClassNames.hoverSoftBackground,
					moduleAccentClassNames.focusRing,
					className,
				)}
				{...buttonProps}
				onClick={(event) => {
					setIsAnimating(true);
					onClick?.(event);
				}}
			>
				<RefreshCw
					className={joinClasses("h-4 w-4", shouldAnimate && "animate-spin")}
					aria-hidden="true"
				/>
				<span className="sr-only">{tooltipTitle}</span>
			</button>
		</ModuleTooltip>
	);
}

