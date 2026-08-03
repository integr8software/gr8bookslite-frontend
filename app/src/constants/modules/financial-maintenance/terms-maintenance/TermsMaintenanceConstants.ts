import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	TermImportColumnId,
	TermImportColumnHeader,
	TermImportColumnWidths,
	TermsMaintenance,
	TermsMaintenanceDatemode,
	TermsMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const TermsMaintenanceHref = MODULE_ROUTE_MAP.TM;

export const TermsMaintenanceApiPath = "/maintenance/terms-maintenance";

export const TermsMaintenanceParentLabel = "Accounting master data";

export const TermsMaintenanceTitle = "Terms Maintenance";

export const TermsMaintenanceDescription =
	"Manage datemode and period definitions used for term reporting and payment cycles.";

export const TermsMaintenanceDrawerFormId = "terms-maintenance-drawer-form";

export const TermsMaintenanceFieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";

export const TermsMaintenanceSelectClassName = `app-select-control ${TermsMaintenanceFieldClassName} enabled:bg-white enabled:text-darknavy disabled:bg-darknavy/[0.03] disabled:text-darknavy/70`;

export const TermsMaintenanceTablePaginationStorageKey =
	"maintenance:financial-management:terms-maintenance";

export const TermsMaintenanceTableColumns = [
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
		className: "w-[13%] text-center",
	},
	{
		key: "period",
		label: "Period",
		className: "w-[11%] text-center",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[12%] text-center",
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

export const TermsMaintenanceTablePreferencesStorageKey =
	"gr8booksneo:terms-maintenance:table-preferences";
export const TermsMaintenanceTablePreferencesModuleKey =
	"maintenance:terms-maintenance";
export const TermsMaintenanceDefaultColumnOrder = TermsMaintenanceTableColumns.map(
	(column) => ("key" in column ? column.key : "actions"),
);
export const TermsMaintenanceDefaultColumnVisibility: VisibilityState = {
	description: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
export const TermsMaintenanceDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];

export const TermsMaintenanceExportColumns: ModuleTableExportColumn<TermsMaintenance>[] =
	[
		...TermsMaintenanceTableColumns.flatMap((column) =>
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

export const TermsMaintenanceDatemodeOptions = [
	"Day",
	"Month",
	"Year",
] as const satisfies readonly TermsMaintenanceDatemode[];

export const TermsMaintenanceStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly TermsMaintenanceStatus[];

export const TermsMaintenanceActionCopy = {
	add: {
		title: "Add Terms Maintenance",
		description:
			"Create a new term schedule for period reporting and financial tracking.",
	},
	edit: {
		title: "Edit Terms Maintenance",
		description:
			"Update the term settings used for payment and reporting cycles.",
	},
	view: {
		title: "View Terms Maintenance",
		description:
			"Review the configured term details before making changes.",
	},
} as const;

export const TermImportTemplateHeaders = ["Term Name", "Datemode", "Period"];

export const TermImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const TermImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const TermImportDefaultColumnIndexes: Record<
	TermImportColumnId,
	number
> = {
	name: 0,
	datemode: 1,
	period: 2,
};

export const TermImportFieldOrder: TermImportColumnId[] = [
	"name",
	"datemode",
	"period",
];

export const TermImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const TermImportDefaultColumnWidths: TermImportColumnWidths = {
	name: 224,
	datemode: 160,
	period: 128,
};

export const TermImportColumnHeaders: TermImportColumnHeader[] = [
	{
		className: "z-40 px-3",
		id: "name",
		label: "Term Name",
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

export const TermImportPreviewColumnCount = TermImportFieldOrder.length + 1;

export const TermImportPreviewGridLabel =
	"Import preview grid. Paste copied Excel rows here.";

export const TermImportPreviewEmptyMessage =
	"Upload a file, or focus here and paste copied Excel rows.";

export const TermImportPreviewPageSize = 20;
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
