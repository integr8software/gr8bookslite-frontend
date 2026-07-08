import type {
	DisbursementPaymentClassification,
	DisbursementPaymentMethod,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { Row, Table } from "@tanstack/react-table";

export type PaymentTypeStatus = "Active" | "Inactive";
export type PaymentTypeClassification = DisbursementPaymentClassification;
export type PaymentTypeStatusFilter = "" | PaymentTypeStatus;
export type PaymentTypeClassificationFilter = "" | PaymentTypeClassification;
export type PaymentTypeSortKey = "paymentType" | "type" | "status";

export type PaymentTypeListParams = {
	search?: string;
	sortBy?: PaymentTypeSortKey;
	sortDirection?: "asc" | "desc";
	status?: "" | PaymentTypeStatus;
	type?: "" | PaymentTypeClassification;
};

export type ApiPaymentTypeClassification =
	| "CASH"
	| "WITH_BANK"
	| "BANK_TRANSFER"
	| "ONLINE_PAYMENT"
	| "MULTIPLE_CHECK"
	| "DEBIT";

export type ApiPaymentTypeStatus = "ACTIVE" | "INACTIVE";

export type ApiPaymentType = {
	id: string;
	name: string;
	description: string | null;
	classification: ApiPaymentTypeClassification;
	status: ApiPaymentTypeStatus;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

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

export type PaymentTypeDrawerProps = {
	isOpen: boolean;
	mode: PaymentTypeActionMode;
	onClose: () => void;
	paymentType?: PaymentTypeRecord;
};

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

export type PaymentTypeTableRowProps = {
	row: Row<PaymentTypeRecord>;
	permissions: PaymentTypePermissions;
	onEdit: (paymentType: PaymentTypeRecord) => void;
	onToggleStatus: (paymentType: PaymentTypeRecord) => void;
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

export type PaymentTypePermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type PaymentTypeStatistics = {
	totalPaymentTypes: number;
	activePaymentTypes: number;
	inactivePaymentTypes: number;
	cashPaymentTypes: number;
	withBankPaymentTypes: number;
	bankTransferPaymentTypes: number;
	onlinePaymentTypes: number;
	multipleCheckPaymentTypes: number;
	debitPaymentTypes: number;
};

export type PaymentTypeListResponse = {
	paymentTypes: PaymentTypeRecord[];
	statistics: PaymentTypeStatistics;
	permissions: PaymentTypePermissions;
};

export type ApiPaymentTypeListResponse = {
	paymentTypes: ApiPaymentType[];
	statistics: PaymentTypeStatistics;
	permissions: PaymentTypePermissions;
};

export type ApiPaymentTypeSaveResponse = {
	paymentType: ApiPaymentType;
};

export type ApiPaymentTypeImportResponse = {
	paymentTypes: ApiPaymentType[];
};

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
