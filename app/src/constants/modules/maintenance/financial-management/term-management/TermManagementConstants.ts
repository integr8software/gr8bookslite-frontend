import type { TermManagementDatemode } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export const TermManagementHref =
	"/maintenance/financial-management/term-management";

export const TermManagementTablePaginationStorageKey =
	"maintenance:financial-management:term-management";

export const TermManagementTableColumns = [
	{
		key: "description",
		label: "Description",
		className: "w-[38%]",
	},
	{
		key: "datemode",
		label: "Datemode",
		className: "w-[22%]",
	},
	{
		key: "period",
		label: "Period",
		className: "w-[20%]",
	},
	{
		label: "Actions",
		className: "w-[20%] text-right",
	},
] as const;

export const TermManagementDatemodeOptions: TermManagementDatemode[] = [
	"Day",
	"Month",
	"Year",
];

export const TermManagementActionCopy = {
	add: {
		title: "Add Term Management",
		description:
			"Create a new term schedule for period reporting and financial tracking.",
	},
	edit: {
		title: "Edit Term Management",
		description:
			"Update the term settings used for payment and reporting cycles.",
	},
	view: {
		title: "View Term Management",
		description:
			"Review the configured term details before making changes.",
	},
} as const;
