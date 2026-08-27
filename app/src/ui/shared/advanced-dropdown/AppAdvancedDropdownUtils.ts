import type { CSSProperties } from "react";
import {
	AppAdvancedDropdownOptionViewGrid,
	AppAdvancedDropdownOptionViewList,
} from "@/app/src/constants/shared/advanced-dropdown/AppAdvancedDropdownConstants";
import type {
	AppAdvancedDropdownOption,
	AppAdvancedDropdownOptionView,
} from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

const DropdownMenuGap = 4;
const DropdownMenuMaxHeight = 320;
const DropdownMenuMinHeight = 96;
const DropdownPointerBoundaryPadding = 24;
const DropdownMenuViewportPadding = 8;

export function getPortalStyle(
	root: HTMLDivElement | null,
	menuMinWidth = 0,
): CSSProperties | undefined {
	if (!root || typeof window === "undefined") {
		return undefined;
	}

	const rect = root.getBoundingClientRect();
	const viewportHeight = window.innerHeight;
	const viewportWidth = window.innerWidth;
	const availableWidth = Math.max(0, viewportWidth - DropdownMenuViewportPadding * 2);
	const width = Math.min(Math.max(rect.width, menuMinWidth), availableWidth);
	const maxLeft = Math.max(
		DropdownMenuViewportPadding,
		viewportWidth - DropdownMenuViewportPadding - width,
	);
	const left = Math.min(Math.max(rect.left, DropdownMenuViewportPadding), maxLeft);
	const spaceBelow = viewportHeight - rect.bottom - DropdownMenuGap - DropdownMenuViewportPadding;
	const spaceAbove = rect.top - DropdownMenuGap - DropdownMenuViewportPadding;
	const shouldOpenAbove = spaceBelow < DropdownMenuMaxHeight && spaceAbove > spaceBelow;
	const availableHeight = Math.max(0, shouldOpenAbove ? spaceAbove : spaceBelow);
	const maxHeight = Math.max(
		DropdownMenuMinHeight,
		Math.min(DropdownMenuMaxHeight, availableHeight),
	);

	if (shouldOpenAbove) {
		return {
			bottom: viewportHeight - rect.top + DropdownMenuGap,
			left,
			maxHeight,
			width,
		};
	}

	return {
		left,
		maxHeight,
		top: rect.bottom + DropdownMenuGap,
		width,
	};
}

export function isEventInsideDropdown(
	event: MouseEvent | PointerEvent,
	root: HTMLDivElement | null,
	menu: HTMLDivElement | null,
) {
	const target = event.target as Node | null;

	if ((target && root?.contains(target)) || (target && menu?.contains(target))) {
		return true;
	}

	return (
		isPointInsideElement(event, root) ||
		isPointInsideElement(event, menu, DropdownPointerBoundaryPadding)
	);
}

export function flattenOptions(
	options: AppAdvancedDropdownOption[] | null | undefined,
): AppAdvancedDropdownOption[] {
	if (!Array.isArray(options)) {
		return [];
	}

	return options.flatMap((option) => [
		option,
		...(option.children ? flattenOptions(option.children) : []),
	]);
}

export function deduplicateOptions(
	options: AppAdvancedDropdownOption[],
): AppAdvancedDropdownOption[] {
	const seenValues = new Set<string>();

	function visit(currentOptions: AppAdvancedDropdownOption[]): AppAdvancedDropdownOption[] {
		return currentOptions.reduce<AppAdvancedDropdownOption[]>((uniqueOptions, option) => {
			if (seenValues.has(option.value)) {
				return uniqueOptions;
			}

			seenValues.add(option.value);
			uniqueOptions.push(
				option.children
					? {
							...option,
							children: visit(option.children),
						}
					: option,
			);

			return uniqueOptions;
		}, []);
	}

	return visit(options);
}

export function filterOptions(
	options: AppAdvancedDropdownOption[] | null | undefined,
	query: string,
): AppAdvancedDropdownOption[] {
	if (!Array.isArray(options)) {
		return [];
	}

	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return options;
	}

	return options.reduce<AppAdvancedDropdownOption[]>((matches, option) => {
		const children = option.children ? filterOptions(option.children, normalizedQuery) : undefined;
		const isMatch = getSearchText(option).includes(normalizedQuery);

		if (!isMatch && !children?.length) {
			return matches;
		}

		matches.push({
			...option,
			children,
		});

		return matches;
	}, []);
}

export function getInitialActiveOptionValue(
	options: AppAdvancedDropdownOption[],
	selectedValues: Set<string>,
) {
	return (options.find((option) => selectedValues.has(option.value)) ?? options[0])?.value ?? "";
}

export function getOptionClassName({
	hasChildren,
	isActive,
	isDisabled,
	isSelected,
	level = 0,
	view,
}: {
	hasChildren?: boolean;
	isActive?: boolean;
	isDisabled?: boolean;
	isSelected: boolean;
	level?: number;
	view: AppAdvancedDropdownOptionView;
}) {
	if (view === AppAdvancedDropdownOptionViewGrid) {
		return joinClasses(
			"app-advanced-dropdown-option flex min-h-20 w-full items-start gap-2 rounded-md border p-2 text-left transition",
			isSelected
				? "border-skyblue/35 bg-skyblue/10 text-darknavy"
				: "border-darknavy/10 text-darknavy hover:border-skyblue/25 hover:bg-skyblue/10",
			isActive && !isDisabled && "ring-2 ring-inset ring-skyblue/25",
			isDisabled && "cursor-not-allowed opacity-45",
		);
	}

	return joinClasses(
		"app-advanced-dropdown-option flex min-h-9 w-full items-center gap-2.5 rounded-md border border-transparent py-1.5 pr-3 text-left transition",
		hasChildren && !isSelected && level === 0 && "bg-darknavy/[0.025]",
		isSelected && "text-darknavy",
		!isSelected && "text-darknavy hover:border-skyblue/15 hover:bg-skyblue/[0.06]",
		isActive && !isDisabled && "border-skyblue/25 bg-skyblue/[0.07]",
		isDisabled && "cursor-not-allowed opacity-45",
	);
}

export function getOptionIndentStyle(view: AppAdvancedDropdownOptionView, level: number) {
	return view === AppAdvancedDropdownOptionViewList
		? { paddingLeft: `${0.75 + level * 0.9}rem` }
		: undefined;
}

export function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}

function isPointInsideElement(
	event: MouseEvent | PointerEvent,
	element: HTMLElement | null,
	padding = 0,
) {
	if (!element) {
		return false;
	}

	const rect = element.getBoundingClientRect();

	return (
		event.clientX >= rect.left - padding &&
		event.clientX <= rect.right + padding &&
		event.clientY >= rect.top - padding &&
		event.clientY <= rect.bottom + padding
	);
}

function getSearchText(option: AppAdvancedDropdownOption) {
	return [option.name, option.label, option.description, option.value]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}
