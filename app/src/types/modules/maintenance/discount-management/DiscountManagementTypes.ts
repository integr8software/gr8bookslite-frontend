import type { Table } from "@tanstack/react-table";

export type DiscountType = "Percentage" | "Fixed";
export type DiscountTransactionType = "Purchase" | "Sales";
export type DiscountStatus = "Active" | "Inactive";
export type DiscountTypeFilter = "All" | DiscountTransactionType;
export type DiscountValueTypeFilter = "All" | DiscountType;
export type DiscountStatusFilter = "" | DiscountStatus;

export type Discount = {
	id: string;
	name: string;
	description: string;
	type: DiscountTransactionType;
	discountType: DiscountType;
	amount: number;
	status: DiscountStatus;
	accountId?: string;
	accountCode?: string;
	accountTitle?: string;
	accountGroupPath?: string;
};

export type DiscountManagementFormValues = {
	name: string;
	description: string;
	type: DiscountTransactionType;
	discountType: DiscountType;
	amount: string;
	status: DiscountStatus;
};

export type DiscountManagementFormErrors = Partial<
	Record<keyof DiscountManagementFormValues, string>
>;

export type DiscountManagementActionMode = "add" | "edit" | "view";

export type DiscountManagementDrawerState =
	| {
			discount?: Discount;
			initialValues?: DiscountManagementFormValues;
			mode: DiscountManagementActionMode;
	  }
	| null;

export type DiscountManagementTableColumnKey =
	| "name"
	| "description"
	| "type"
	| "discountType"
	| "amount"
	| "accountCode"
	| "accountTitle"
	| "status";

export type DiscountManagementTableRecord = Discount & {
	amountLabel: string;
	valueLabel: string;
};

export type DiscountManagementStatistics = {
	totalDiscounts: number;
	activeDiscounts: number;
	inactiveDiscounts: number;
	purchaseDiscounts: number;
	salesDiscounts: number;
	percentageDiscounts: number;
};

export type DiscountManagementPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type DiscountManagementTableProps = {
	discountTypeFilter: DiscountValueTypeFilter;
	filteredDiscounts: Discount[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: DiscountManagementPermissions;
	query: string;
	statusFilter: DiscountStatusFilter;
	tableTypeFilter: DiscountTypeFilter;
	discounts: Discount[];
	onDiscountTypeFilterChange: (value: DiscountValueTypeFilter) => void;
	onEditDiscount: (discount: DiscountManagementTableRecord) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: DiscountStatusFilter) => void;
	onToggleStatus: (discount: DiscountManagementTableRecord) => void;
	onTypeFilterChange: (value: DiscountTypeFilter) => void;
	onViewDiscount: (discount: DiscountManagementTableRecord) => void;
};

export type DiscountManagementTableFiltersProps = {
	discountTypeFilter: DiscountValueTypeFilter;
	exportAllRows: DiscountManagementTableRecord[];
	exportFilteredRows: DiscountManagementTableRecord[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: DiscountManagementPermissions;
	query: string;
	statusFilter: DiscountStatusFilter;
	table: Table<DiscountManagementTableRecord>;
	typeFilter: DiscountTypeFilter;
	onDiscountTypeFilterChange: (value: DiscountValueTypeFilter) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: DiscountStatusFilter) => void;
	onTypeFilterChange: (value: DiscountTypeFilter) => void;
};

export type DiscountImportColumnId =
	| "name"
	| "type"
	| "description"
	| "discountType"
	| "amount"
	| "status";

export type DiscountImportColumnHeader = {
	className: string;
	id: DiscountImportColumnId;
	label: string;
	stickyLeft?: number;
};

export type DiscountImportColumnWidths = Record<DiscountImportColumnId, number>;

export type DiscountImportCellErrors = Partial<
	Record<DiscountImportColumnId, string[]>
>;

export type DiscountImportCellWarnings = Partial<
	Record<DiscountImportColumnId, string[]>
>;

export type DiscountImportPreviewRow = {
	cellErrors: DiscountImportCellErrors;
	cellWarnings: DiscountImportCellWarnings;
	discount: Discount;
	id: string;
	rowErrors: string[];
	rowNumber: number;
};

export type DiscountImportProgress = {
	imported: number;
	total: number;
};

export type DiscountImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = DiscountImportProgress;

export type DiscountManagementImportDialogProps = {
	existingDiscounts: Discount[];
	isOpen: boolean;
	onClose: () => void;
	onImportDiscounts: (discounts: Discount[]) => Promise<Discount[]>;
};
