import type {
	TermImportColumnId,
	TermImportColumnHeader,
	TermImportColumnWidths,
	TermManagement,
	TermManagementDatemode,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const TermManagementHref =
	"/maintenance/term-management";

export const TermManagementApiPath = "/maintenance/term-maintenance";

export const TermManagementParentLabel = "Accounting master data";

export const TermManagementTitle = "Term Management";

export const TermManagementDescription =
	"Manage datemode and period definitions used for term reporting and payment cycles.";

export const TermManagementDrawerFormId = "term-management-drawer-form";

export const TermManagementFieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";

export const TermManagementSelectClassName = `app-select-control ${TermManagementFieldClassName} enabled:bg-white enabled:text-darknavy disabled:bg-darknavy/[0.03] disabled:text-darknavy/70`;

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
		headerAlign: "center",
	},
	{
		key: "period",
		label: "Period",
		className: "w-[11%]",
		headerAlign: "center",
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
		label: "Updated By",
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

export const TermManagementExportColumns: ModuleTableExportColumn<TermManagement>[] =
	[
		...TermManagementTableColumns.flatMap((column) =>
			"key" in column
				? [
						{
							header: column.label,
							id: column.key,
							value: column.key,
						},
					]
				: [],
		),
	];

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

export const TermImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const TermImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

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

export const TermImportSelectionColumnWidth = 64;

export const TermImportDefaultColumnWidths: TermImportColumnWidths = {
	name: 224,
	datemode: 160,
	period: 128,
};

export const TermImportColumnHeaders: TermImportColumnHeader[] = [
	{
		className: "z-40 px-3",
		id: "name",
		label: "Name",
		stickyLeft: TermImportSelectionColumnWidth,
	},
	{
		className: "px-3",
		id: "datemode",
		label: "Datemode",
	},
	{
		className: "px-3",
		id: "period",
		label: "Period",
	},
];

export const TermImportPreviewColumnCount =
	TermImportFieldOrder.length + 1;

export const TermImportPreviewGridLabel =
	"Import preview grid. Paste copied Excel rows here.";

export const TermImportPreviewEmptyMessage =
	"Upload a file, or focus here and paste copied Excel rows.";

export const TermImportPreviewPageSize = 10;
export const TermImportBatchSize = 25;
export const TermImportMinFileSizeBytes = 1;
export const TermImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const TemplateHeaders = TermImportTemplateHeaders;
export const DefaultColumnIndexes = TermImportDefaultColumnIndexes;
export const ImportFieldOrder = TermImportFieldOrder;
export const SelectionColumnWidth = TermImportSelectionColumnWidth;
export const DefaultColumnWidths = TermImportDefaultColumnWidths;
export const PreviewPageSize = TermImportPreviewPageSize;
export const ImportBatchSize = TermImportBatchSize;
export const MinImportFileSizeBytes = TermImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = TermImportMaxFileSizeBytes;
