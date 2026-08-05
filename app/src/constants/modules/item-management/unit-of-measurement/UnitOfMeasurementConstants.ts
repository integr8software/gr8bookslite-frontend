import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	UnitOfMeasurementImportColumnHeader,
	UnitOfMeasurementImportColumnId,
	UnitOfMeasurementImportColumnWidths,
	UnitOfMeasurementRecord,
	UnitOfMeasurementTableColumnKey,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const UnitOfMeasurementTitle = "Unit of Measurement";
export const UnitOfMeasurementDescription =
	"Maintain units used by item records, purchasing, sales, and inventory quantities.";
export const UnitOfMeasurementParentLabel = "Maintenance";
export const UnitOfMeasurementDrawerFormId = "unit-of-measurement-drawer-form";
export const UnitOfMeasurementApiPath = "/maintenance/unit-of-measurement";
export const UnitOfMeasurementPaginationStorageKey =
	"maintenance.unit-of-measurement";
export const UnitOfMeasurementTablePreferencesStorageKey =
	"gr8booksneo:unit-of-measurement:table-preferences";
export const UnitOfMeasurementTablePreferencesModuleKey =
	"maintenance:unit-of-measurement";

export const UnitOfMeasurementFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";

export const UnitOfMeasurementSelectClassName = `app-select-control ${UnitOfMeasurementFieldClassName} enabled:bg-white enabled:text-darknavy disabled:bg-offwhite/65 disabled:text-darknavy`;

export const UnitOfMeasurementQuantityModeOptions = [
	{ label: "Whole number quantities", value: "Integer" },
	{ label: "Decimal quantities", value: "Float" },
] as const;

export const UnitOfMeasurementActiveStatus: UnitOfMeasurementRecord["status"] =
	"Active";
export const UnitOfMeasurementInactiveStatus: UnitOfMeasurementRecord["status"] =
	"Inactive";
export const UnitOfMeasurementStatusOptions = [
	UnitOfMeasurementActiveStatus,
	UnitOfMeasurementInactiveStatus,
] as const satisfies readonly UnitOfMeasurementRecord["status"][];

export const UnitOfMeasurementActionCopy = {
	add: {
		title: "Add Unit of Measurement",
		description:
			"Create a new unit used in inventory and transaction quantities.",
	},
	edit: {
		title: "Edit Unit of Measurement",
		description:
			"Update the unit setup details used across item quantities.",
	},
	view: {
		title: "View Unit of Measurement",
		description:
			"Review the configured unit details before making changes.",
	},
} as const;

export const UnitOfMeasurementTableColumns = [
	{
		key: "name",
		label: "Unit of Measurement",
		className: "w-[34%]",
	},
	{
		key: "symbol",
		label: "Symbol",
		className: "w-[16%]",
	},
	{
		key: "quantityMode",
		label: "Quantity Type",
		className: "w-[18%] text-center",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[10%] text-center",
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

export const UnitOfMeasurementDefaultColumnOrder =
	UnitOfMeasurementTableColumns.map((column) =>
		"key" in column ? column.key : "actions",
	);
export const UnitOfMeasurementDefaultColumnVisibility: VisibilityState = {
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
export const UnitOfMeasurementDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];

export const UnitOfMeasurementExportColumns: ModuleTableExportColumn<UnitOfMeasurementRecord>[] =
	UnitOfMeasurementTableColumns.flatMap((column) =>
		"key" in column
			? [
					{
						header: column.label,
						id: column.key satisfies UnitOfMeasurementTableColumnKey,
						value: column.key,
					},
				]
			: [],
	);

export const UnitOfMeasurementImportTemplateHeaders = [
	"Unit of Measurement",
	"Symbol",
	"Quantity Type",
];

export const UnitOfMeasurementImportAcceptedFileExtensions =
	".xlsx,.csv,.tsv,.txt";

export const UnitOfMeasurementImportAcceptedFileLabel =
	".xlsx, .csv, .tsv, .txt";

export const UnitOfMeasurementImportDefaultColumnIndexes: Record<
	UnitOfMeasurementImportColumnId,
	number
> = {
	name: 0,
	symbol: 1,
	quantityMode: 2,
};

export const UnitOfMeasurementImportFieldOrder: UnitOfMeasurementImportColumnId[] =
	["name", "symbol", "quantityMode"];

export const UnitOfMeasurementImportSelectionColumnWidth =
	ModuleImportFixedColumnsWidth;

export const UnitOfMeasurementImportDefaultColumnWidths: UnitOfMeasurementImportColumnWidths =
	{
		name: 248,
		symbol: 144,
		quantityMode: 184,
	};

export const UnitOfMeasurementImportColumnHeaders: UnitOfMeasurementImportColumnHeader[] =
	[
		{
			className: "z-40 px-3",
			id: "name",
			label: "Unit of Measurement",
			stickyLeft: UnitOfMeasurementImportSelectionColumnWidth,
		},
		{
			className: "px-3",
			id: "symbol",
			label: "Symbol",
		},
		{
			className: "px-3",
			id: "quantityMode",
			label: "Quantity Type",
		},
	];

export const UnitOfMeasurementImportPreviewColumnCount =
	UnitOfMeasurementImportFieldOrder.length + 1;

export const UnitOfMeasurementImportPreviewGridLabel =
	"Import preview grid. Paste copied Excel rows here.";

export const UnitOfMeasurementImportPreviewEmptyMessage =
	"Upload a file, or focus here and paste copied Excel rows.";

export const UnitOfMeasurementImportPreviewPageSize = 20;
export const UnitOfMeasurementImportBatchSize = 25;
export const UnitOfMeasurementImportMinFileSizeBytes = 1;
export const UnitOfMeasurementImportMaxFileSizeBytes =
	AppMaxFileUploadSizeBytes;
