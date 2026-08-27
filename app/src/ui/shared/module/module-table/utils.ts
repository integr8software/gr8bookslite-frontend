import type { Header } from "@tanstack/react-table";

type ModuleTableColumnMeta = {
	className?: string;
};

export function getColumnClassName<TData>(header: Header<TData, unknown>) {
	return getColumnMetaClassName(header.column.columnDef.meta);
}

export function isColumnHeaderCentered<TData>(header: Header<TData, unknown>) {
	return hasClassName(
		getColumnMetaClassName(header.column.columnDef.meta),
		"text-center",
	);
}

export function getColumnMetaClassName(meta: unknown) {
	return getModuleTableColumnMeta(meta).className;
}

function getModuleTableColumnMeta(meta: unknown): ModuleTableColumnMeta {
	return (meta ?? {}) as ModuleTableColumnMeta;
}

function hasClassName(className: string | undefined, targetClassName: string) {
	return className?.split(/\s+/).includes(targetClassName) ?? false;
}

export function getVisiblePaginationPages(
	page: number,
	totalPages: number,
	pageLimit: number,
) {
	const pageCount = Math.min(totalPages, Math.max(1, pageLimit));
	const firstPage = Math.min(
		Math.max(1, page - Math.floor(pageCount / 2)),
		Math.max(1, totalPages - pageCount + 1),
	);

	return Array.from({ length: pageCount }, (_, index) => firstPage + index);
}

export { joinClasses } from "@/app/src/utils/string.util";

export const moduleAccentClassNames = {
	button:
		"theme-accent-contrast-text border-[var(--skyblue)] bg-[var(--skyblue)] !text-[var(--skyblue-contrast)] shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.2)] hover:opacity-90 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
	focusRing: "focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
	hoverBorder: "hover:border-[rgb(var(--skyblue-rgb)/0.35)]",
	hoverSoftBackground: "hover:bg-[rgb(var(--skyblue-rgb)/0.1)]",
	hoverText: "hover:text-[var(--skyblue)]",
	iconText: "text-[var(--skyblue)]",
	rowHover: "[&_tr:hover]:bg-[rgb(var(--skyblue-rgb)/0.035)]",
	softBackground: "bg-[rgb(var(--skyblue-rgb)/0.12)]",
	softBorder: "border-[rgb(var(--skyblue-rgb)/0.35)]",
	solidBackground: "bg-[var(--skyblue)]",
	solidContrastText: "theme-accent-contrast-text !text-[var(--skyblue-contrast)]",
	surfaceGradient:
		"bg-[linear-gradient(180deg,rgb(var(--skyblue-rgb)/0.08),rgba(255,255,255,0.9))]",
};
