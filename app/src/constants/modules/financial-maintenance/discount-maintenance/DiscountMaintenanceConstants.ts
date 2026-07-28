import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	DiscountMaintenanceTableRecord,
	DiscountImportColumnHeader,
	DiscountImportColumnId,
	DiscountImportColumnWidths,
	DiscountStatus,
	DiscountTransactionType,
	DiscountType,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DiscountMaintenanceHref = MODULE_ROUTE_MAP.DSM;

export const DiscountMaintenanceApiPath = "/maintenance/discount-maintenance";

export const DiscountMaintenanceParentLabel = "Accounting master data";

export const DiscountMaintenanceTitle = "Discount Maintenance";

export const DiscountMaintenanceDescription =
	"Maintain purchase and sales discount definitions with their generated chart account mapping.";

export const DiscountMaintenanceDrawerFormId = "discount-maintenance-drawer-form";

export const DiscountMaintenanceFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

export const DiscountMaintenanceSelectClassName = `app-select-control ${DiscountMaintenanceFieldClassName}`;

export const DiscountMaintenanceTablePaginationStorageKey =
	"maintenance:financial-management:discount-maintenance";

export const DiscountMaintenanceTableColumns = [
	{
		key: "name",
		label: "Discount Name",
		className: "w-[18%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[24%]",
	},
	{
		key: "type",
		label: "Type",
		className: "w-[12%] text-center",
	},
	{
		key: "discountType",
		label: "Discount Type",
		className: "w-[14%] text-center",
	},
	{
		key: "amount",
		label: "Value",
		className: "w-[12%] text-center",
	},
	{
		key: "accountCode",
		label: "Account Code",
		className: "w-[14%]",
	},
	{
		key: "accountTitle",
		label: "Account Title",
		className: "w-[22%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[12%] text-center",
	},
	{ key: "createdBy", label: "Created By", className: "w-[14%]" },
	{ key: "createdAt", label: "Date Created", className: "w-[16%]" },
	{ key: "updatedBy", label: "Updated By", className: "w-[14%]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
	{
		label: "Action",
		className: "w-[16%] text-center",
	},
] as const;

export const DiscountMaintenanceTablePreferencesStorageKey =
	"gr8booksneo:discount-maintenance:table-preferences";
export const DiscountMaintenanceTablePreferencesModuleKey =
	"maintenance:discount-maintenance";
export const DiscountMaintenanceDefaultColumnOrder =
	DiscountMaintenanceTableColumns.map((column) =>
		"key" in column ? column.key : "actions",
	);
export const DiscountMaintenanceDefaultColumnVisibility: VisibilityState = {
	description: false,
	discountType: false,
	accountCode: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
export const DiscountMaintenanceDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];

export const DiscountMaintenanceExportColumns: ModuleTableExportColumn<DiscountMaintenanceTableRecord>[] =
	[
		...DiscountMaintenanceTableColumns.flatMap((column) =>
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

export const DiscountMaintenanceTypeOptions = [
	"Purchase",
	"Sales",
] as const satisfies readonly DiscountTransactionType[];

export const DiscountMaintenanceValueTypeOptions = [
	"Percentage",
	"Fixed",
] as const satisfies readonly DiscountType[];

export const DiscountMaintenanceStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly DiscountStatus[];

export const DiscountMaintenanceActionCopy = {
	add: {
		title: "Add Discount",
		description:
			"Create a purchase or sales discount with its chart account.",
	},
	edit: {
		title: "Edit Discount",
		description:
			"Update the discount value, type, status, and account mapping.",
	},
	view: {
		title: "View Discount",
		description:
			"Review the configured discount details before making changes.",
	},
} as const;

export const DiscountImportTemplateHeaders = [
	"Discount Name",
	"Type",
	"Description",
	"Discount Type",
	"Discount Value",
];

export const DiscountImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const DiscountImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const DiscountImportDefaultColumnIndexes: Record<
	DiscountImportColumnId,
	number
> = {
	name: 0,
	type: 1,
	description: 2,
	discountType: 3,
	amount: 4,
};

export const DiscountImportFieldOrder: DiscountImportColumnId[] = [
	"name",
	"type",
	"description",
	"discountType",
	"amount",
];

export const DiscountImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const DiscountImportDefaultColumnWidths: DiscountImportColumnWidths = {
	name: 224,
	type: 140,
	description: 280,
	discountType: 160,
	amount: 144,
};

export const DiscountImportColumnHeaders: DiscountImportColumnHeader[] = [
	{
		className: "z-40 px-3",
		id: "name",
		label: "Discount Name",
		stickyLeft: DiscountImportSelectionColumnWidth,
	},
	{
		className: "px-3",
		id: "type",
		label: "Type",
	},
	{
		className: "px-3",
		id: "description",
		label: "Description",
	},
	{
		className: "px-3",
		id: "discountType",
		label: "Discount Type",
	},
	{
		className: "px-3",
		id: "amount",
		label: "Discount Value",
	},
];

export const DiscountImportPreviewColumnCount =
	DiscountImportFieldOrder.length + 1;
export const DiscountImportPreviewGridLabel =
	"Discount import preview grid. Paste copied Excel rows here.";
export const DiscountImportPreviewEmptyMessage =
	"Upload a file, add a row, or focus here and paste copied Excel rows.";
export const DiscountImportPreviewPageSize = 20;
export const DiscountImportBatchSize = 25;
export const DiscountImportMinFileSizeBytes = 1;
export const DiscountImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const TemplateHeaders = DiscountImportTemplateHeaders;
export const DefaultColumnIndexes = DiscountImportDefaultColumnIndexes;
export const ImportFieldOrder = DiscountImportFieldOrder;
export const SelectionColumnWidth = DiscountImportSelectionColumnWidth;
export const DefaultColumnWidths = DiscountImportDefaultColumnWidths;
export const PreviewPageSize = DiscountImportPreviewPageSize;
export const ImportBatchSize = DiscountImportBatchSize;
export const MinImportFileSizeBytes = DiscountImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = DiscountImportMaxFileSizeBytes;
