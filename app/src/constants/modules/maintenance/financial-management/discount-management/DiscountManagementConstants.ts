import type {
	DiscountManagementTableRecord,
	DiscountImportColumnHeader,
	DiscountImportColumnId,
	DiscountImportColumnWidths,
	DiscountStatus,
	DiscountTransactionType,
	DiscountType,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DiscountManagementHref =
	"/maintenance/discount-management";

export const DiscountManagementParentLabel = "Accounting master data";

export const DiscountManagementTitle = "Discount Management";

export const DiscountManagementDescription =
	"Maintain purchase and sales discount definitions with their generated chart account mapping.";

export const DiscountManagementTablePaginationStorageKey =
	"maintenance:financial-management:discount-management";

export const DiscountManagementTableColumns = [
	{
		key: "name",
		label: "Name",
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
		className: "w-[12%]",
	},
	{
		key: "discountType",
		label: "Discount Type",
		className: "w-[14%]",
	},
	{
		key: "amount",
		label: "Value",
		className: "w-[12%]",
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
		className: "w-[12%]",
	},
	{
		label: "Action",
		className: "w-[16%] text-center",
	},
] as const;

export const DiscountManagementExportColumns: ModuleTableExportColumn<DiscountManagementTableRecord>[] =
	[
		...DiscountManagementTableColumns.flatMap((column) =>
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

export const DiscountManagementTypeOptions = [
	"Purchase",
	"Sales",
] as const satisfies readonly DiscountTransactionType[];

export const DiscountManagementValueTypeOptions = [
	"Percentage",
	"Fixed",
] as const satisfies readonly DiscountType[];

export const DiscountManagementStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly DiscountStatus[];

export const DiscountManagementActionCopy = {
	add: {
		title: "Add Discount",
		description: "Create a purchase or sales discount with its chart account.",
	},
	edit: {
		title: "Edit Discount",
		description: "Update the discount value, type, status, and account mapping.",
	},
	view: {
		title: "View Discount",
		description: "Review the configured discount details before making changes.",
	},
} as const;

export const DiscountImportTemplateHeaders = [
	"Name",
	"Type",
	"Description",
	"Discount Type",
	"Discount Value",
	"Status",
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
	status: 5,
};

export const DiscountImportFieldOrder: DiscountImportColumnId[] = [
	"name",
	"type",
	"description",
	"discountType",
	"amount",
	"status",
];

export const DiscountImportSelectionColumnWidth = 64;

export const DiscountImportDefaultColumnWidths: DiscountImportColumnWidths = {
	name: 224,
	type: 140,
	description: 280,
	discountType: 160,
	amount: 144,
	status: 140,
};

export const DiscountImportColumnHeaders: DiscountImportColumnHeader[] = [
	{
		className: "z-40 px-3",
		id: "name",
		label: "Name",
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
	{
		className: "px-3",
		id: "status",
		label: "Status",
	},
];

export const DiscountImportPreviewColumnCount =
	DiscountImportFieldOrder.length + 1;
export const DiscountImportPreviewGridLabel =
	"Discount import preview grid. Paste copied Excel rows here.";
export const DiscountImportPreviewEmptyMessage =
	"Upload a file, add a row, or focus here and paste copied Excel rows.";
export const DiscountImportPreviewPageSize = 10;
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
