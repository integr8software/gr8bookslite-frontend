import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function cellControlClassName(
	extraClassName?: string,
	validationMessage?: string,
) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy",
		validationMessage &&
			"bg-coralpink/5 pr-9 ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/5 focus:ring-coralpink/70",
		extraClassName,
	);
}

export function previewCellClassName(
	extraClassName?: string,
	validationMessage?: string,
) {
	return joinClasses(
		"app-data-entry-field h-10 w-full rounded-none border-0 bg-white px-2 text-xs font-medium text-darknavy outline-none transition focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
		validationMessage &&
			"bg-coralpink/5 pr-9 ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/5 focus:ring-coralpink/70",
		extraClassName,
	);
}
