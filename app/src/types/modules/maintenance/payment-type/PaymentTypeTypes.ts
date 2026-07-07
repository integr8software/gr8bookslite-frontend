import type {
	DisbursementPaymentClassification,
	DisbursementPaymentMethod,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { Table } from "@tanstack/react-table";
import type { PaymentTypePermissions } from "@/app/src/services/modules/maintenance/payment-type/PaymentTypeService";

export type PaymentTypeStatus = "Active" | "Inactive";
export type PaymentTypeClassification = DisbursementPaymentClassification;
export type PaymentTypeStatusFilter = "" | PaymentTypeStatus;
export type PaymentTypeClassificationFilter = "" | PaymentTypeClassification;

export type PaymentTypeRecord = {
	description: string;
	id: string;
	paymentType: DisbursementPaymentMethod;
	type: PaymentTypeClassification;
	status: PaymentTypeStatus;
	createdBy?: string | null;
	createdAt?: string;
	updatedBy?: string | null;
	updatedAt?: string;
};

export type PaymentTypeFormValues = {
	description: string;
	paymentType: string;
	type: PaymentTypeClassification | "";
	status: PaymentTypeStatus;
};

export type PaymentTypeFormErrors = Partial<
	Record<keyof PaymentTypeFormValues, string>
>;

export type PaymentTypeActionMode = "add" | "edit" | "view";

export type DrawerState =
	| { mode: "add" | "edit" | "view"; paymentType?: PaymentTypeRecord }
	| null;

export type PaymentTypeDrawerState = DrawerState;

export type PaymentTypeTableProps = {
	filteredPaymentTypes: PaymentTypeRecord[];
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	paymentTypes: PaymentTypeRecord[];
	permissions: PaymentTypePermissions;
	searchTerm: string;
	statusFilter: PaymentTypeStatusFilter;
	typeFilter: PaymentTypeClassificationFilter;
	typeFilterOptions: PaymentTypeClassification[];
	onEdit: (paymentType: PaymentTypeRecord) => void;
	onRefresh: () => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: PaymentTypeStatusFilter) => void;
	onToggleStatus: (paymentType: PaymentTypeRecord) => void;
	onTypeFilterChange: (value: PaymentTypeClassificationFilter) => void;
	onView: (paymentType: PaymentTypeRecord) => void;
};

export type PaymentTypeTableColumnKey =
	| "paymentType"
	| "description"
	| "type"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type PaymentTypeTableFiltersProps = {
	exportAllRows: PaymentTypeRecord[];
	exportFilteredRows: PaymentTypeRecord[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: PaymentTypePermissions;
	searchTerm: string;
	statusFilter: PaymentTypeStatusFilter;
	table: Table<PaymentTypeRecord>;
	typeFilter: PaymentTypeClassificationFilter;
	typeFilterOptions: PaymentTypeClassification[];
	onRefresh: () => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: PaymentTypeStatusFilter) => void;
	onTypeFilterChange: (value: PaymentTypeClassificationFilter) => void;
};

export type PaymentTypeImportColumnId =
	| "paymentType"
	| "description"
	| "type";

export type PaymentTypeImportColumnHeader = {
	className: string;
	id: PaymentTypeImportColumnId;
	label: string;
	stickyLeft?: number;
};

export type PaymentTypeImportColumnWidths = Record<
	PaymentTypeImportColumnId,
	number
>;

export type PaymentTypeImportCellErrors = Partial<
	Record<PaymentTypeImportColumnId, string[]>
>;

export type PaymentTypeImportCellWarnings = Partial<
	Record<PaymentTypeImportColumnId, string[]>
>;

export type PaymentTypeImportPreviewRow = {
	cellErrors: PaymentTypeImportCellErrors;
	cellWarnings: PaymentTypeImportCellWarnings;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	paymentType: Omit<PaymentTypeRecord, "id">;
};

export type PaymentTypeImportProgress = {
	imported: number;
	total: number;
};

export type PaymentTypeImportMode = "all-rows" | "all-valid" | "selected-valid";

export type PaymentTypeImportDialogProps = {
	existingPaymentTypes: PaymentTypeRecord[];
	isOpen: boolean;
	onClose: () => void;
	onImportPaymentTypes: (
		paymentTypes: PaymentTypeRecord[],
	) => Promise<PaymentTypeRecord[]>;
};
