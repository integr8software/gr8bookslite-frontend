import type {
	TermManagementDatemode,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export const TermManagementHref =
	"/maintenance/term-management";

export const TermManagementTablePaginationStorageKey =
	"maintenance:financial-management:term-management";

export const TermManagementTableColumns = [
	{
		key: "name",
		label: "Name",
		className: "w-[32%]",
	},
	{
		key: "datemode",
		label: "Datemode",
		className: "w-[18%]",
	},
	{
		key: "period",
		label: "Period",
		className: "w-[16%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[16%]",
	},
	{
		label: "Actions",
		className: "w-[18%] text-center",
	},
] as const;

export const TermManagementDatemodeOptions = [
	"Day",
	"Month",
	"Year",
] as const satisfies readonly TermManagementDatemode[];

export const TermManagementStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly TermManagementStatus[];

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
