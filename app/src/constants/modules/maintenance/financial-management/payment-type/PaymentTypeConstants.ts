import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import type {
	PaymentTypeClassification,
	PaymentTypeImportColumnHeader,
	PaymentTypeImportColumnId,
	PaymentTypeImportColumnWidths,
	PaymentTypeRecord,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const PaymentTypeHref = "/maintenance/payment-type";

export const PaymentTypeParentLabel = "Accounting master data";

export const PaymentTypeTitle = "Payment Type";

export const PaymentTypeDescription =
	"Maintain payment type names, categories, and active status for cash disbursement workflows.";

export const PaymentTypeTablePaginationStorageKey =
	"maintenance:financial-management:payment-type";

export const PaymentTypeTableColumns = [
	{ key: "paymentType", label: "Name", className: "w-[22%]" },
	{ key: "description", label: "Description", className: "w-[28%]" },
	{ key: "type", label: "Category", className: "w-[16%] text-center" },
	{ key: "status", label: "Status", className: "w-[12%]" },
	{ key: "createdBy", label: "Created By", className: "w-[14%]" },
	{ key: "createdAt", label: "Date Created", className: "w-[16%]" },
	{ key: "updatedBy", label: "Modified By", className: "w-[14%]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
	{ label: "Action", className: "w-[16%] text-center" },
] as const;

export const PaymentTypeExportColumns: ModuleTableExportColumn<PaymentTypeRecord>[] =
	PaymentTypeTableColumns.flatMap((column) =>
		"key" in column
			? [{ header: column.label, id: column.key, value: column.key }]
			: [],
	);

export const PaymentTypeClassificationOptions = [
	"Cash",
	"With Bank",
	"Bank Transfer",
	"Online Payment",
	"Multiple Check",
	"Debit",
] as const satisfies readonly PaymentTypeClassification[];

export const PaymentTypeStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly PaymentTypeStatus[];

export const PaymentTypeImportTemplateHeaders = [
	"Name",
	"Description",
	"Category",
];

export const PaymentTypeImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const PaymentTypeImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const PaymentTypeImportDefaultColumnIndexes: Record<
	PaymentTypeImportColumnId,
	number
> = {
	paymentType: 0,
	description: 1,
	type: 2,
};

export const PaymentTypeImportFieldOrder: PaymentTypeImportColumnId[] = [
	"paymentType",
	"description",
	"type",
];

export const PaymentTypeImportSelectionColumnWidth = 64;

export const PaymentTypeImportDefaultColumnWidths: PaymentTypeImportColumnWidths =
	{
		paymentType: 224,
		description: 280,
		type: 176,
	};

export const PaymentTypeImportColumnHeaders: PaymentTypeImportColumnHeader[] = [
	{
		className: "z-40 px-3",
		id: "paymentType",
		label: "Name",
		stickyLeft: PaymentTypeImportSelectionColumnWidth,
	},
	{ className: "px-3", id: "description", label: "Description" },
	{ className: "px-3", id: "type", label: "Category" },
];

export const PaymentTypeImportPreviewColumnCount =
	PaymentTypeImportFieldOrder.length + 1;

export const PaymentTypeImportPreviewGridLabel =
	"Import preview grid. Paste copied Excel rows here.";

export const PaymentTypeImportPreviewEmptyMessage =
	"Upload a file, or focus here and paste copied Excel rows.";

export const PaymentTypeImportPreviewPageSize = 10;
export const PaymentTypeImportBatchSize = 25;
export const PaymentTypeImportMinFileSizeBytes = 1;
export const PaymentTypeImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const ImportFieldOrder = PaymentTypeImportFieldOrder;
export const SelectionColumnWidth = PaymentTypeImportSelectionColumnWidth;
export const DefaultColumnWidths = PaymentTypeImportDefaultColumnWidths;
export const PreviewPageSize = PaymentTypeImportPreviewPageSize;
export const ImportBatchSize = PaymentTypeImportBatchSize;
export const MinImportFileSizeBytes = PaymentTypeImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = PaymentTypeImportMaxFileSizeBytes;
