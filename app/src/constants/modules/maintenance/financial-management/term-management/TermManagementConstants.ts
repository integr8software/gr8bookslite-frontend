import type {
	TermImportColumnId,
	TermManagementDatemode,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";

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
		label: "Term Name",
		className: "w-[20%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[28%]",
	},
	{
		key: "datemode",
		label: "Date Mode",
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
		key: "createdBy",
		label: "Created By",
		className: "w-[14%]",
	},
	{
		key: "createdAt",
		label: "Date Created",
		className: "w-[16%]",
	},
	{
		key: "updatedBy",
		label: "Modified By",
		className: "w-[14%]",
	},
	{
		key: "updatedAt",
		label: "Date Modified",
		className: "w-[16%]",
	},
	{
		label: "Action",
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

export const TermImportTemplateHeaders = ["Name", "Datemode", "Period"];

export const TermImportDefaultColumnIndexes: Record<TermImportColumnId, number> = {
	name: 0,
	datemode: 1,
	period: 2,
};

export const TermImportFieldOrder: TermImportColumnId[] = [
	"name",
	"datemode",
	"period",
];

export const TermImportPreviewPageSize = 10;
export const TermImportBatchSize = 25;
export const TermImportMinFileSizeBytes = 1;
export const TermImportMaxFileSizeBytes = 2 * 1024 * 1024;

export const TemplateHeaders = TermImportTemplateHeaders;
export const DefaultColumnIndexes = TermImportDefaultColumnIndexes;
export const ImportFieldOrder = TermImportFieldOrder;
export const PreviewPageSize = TermImportPreviewPageSize;
export const ImportBatchSize = TermImportBatchSize;
export const MinImportFileSizeBytes = TermImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = TermImportMaxFileSizeBytes;
