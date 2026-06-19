import type {
	TermManagementDatemode,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export const TermManagementHref =
	"/maintenance/term-management";

export const TermManagementParentLabel = "Accounting master data";

export const TermManagementTitle = "Term Management";

export const TermManagementDescription =
	"Manage datemode and period definitions used for term reporting and payment cycles.";

export const TermManagementTablePaginationStorageKey =
	"maintenance:financial-management:term-management";

export const TermManagementTableColumns = [
	{
		key: "name",
		label: "Name",
		className: "w-[20%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[28%]",
	},
	{
		key: "datemode",
		label: "Datemode",
		className: "w-[13%]",
	},
	{
		key: "period",
		label: "Period",
		className: "w-[11%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[12%]",
	},
	{
		label: "Actions",
		className: "w-[16%] text-center",
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
