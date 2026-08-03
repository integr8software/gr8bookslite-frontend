import type { Table, Row } from "@tanstack/react-table";

export type TransactionTypeStatus = "Active" | "Inactive";

export type TransactionType = {
	id: string;
	name: string;
	description: string;
	moduleId?: string;
	moduleName?: string;
	moduleIds: string[];
	moduleNames: string[];
	status: TransactionTypeStatus;
	accountId?: string;
	accountCode?: string;
	accountTitle?: string;
};

export type TransactionTypeFormValues = {
	name: string;
	description: string;
	moduleIds: string[];
	status: TransactionTypeStatus;
	accountId: string;
};

export type TransactionTypeFormErrors = Partial<
	Record<keyof TransactionTypeFormValues, string>
>;

export type TransactionTypeActionMode = "add" | "edit" | "view";

export type TransactionTypeStatusFilter = "" | TransactionTypeStatus;

export type TransactionTypeDrawerState =
	| {
			mode: TransactionTypeActionMode;
			transactionType?: TransactionType;
	  }
	| null;

export type TransactionTypeDrawerProps = {
	isOpen: boolean;
	mode: TransactionTypeActionMode;
	onClose: () => void;
	transactionType?: TransactionType;
};

export type TransactionTypeTableColumnKey =
	| "name"
	| "description"
	| "accountLabel"
	| "moduleLabel"
	| "status";

export type TransactionTypeTableRecord = TransactionType & {
	accountLabel: string;
	moduleLabel: string;
};

export type TransactionTypeTableProps = {
	filteredTransactionTypes: TransactionType[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	isSyncing: boolean;
	lastSyncedAt?: number | string | Date | null;
	moduleFilter: string;
	moduleFilterOptions: Array<{ label: string; value: string }>;
	searchTerm: string;
	statusFilter: TransactionTypeStatusFilter;
	table: Table<TransactionTypeTableRecord>;
	transactionTypes: TransactionType[];
	onEdit: (transactionType: TransactionType) => void;
	onModuleFilterChange: (value: string) => void;
	onRefresh: () => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: TransactionTypeStatusFilter) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
};

export type TransactionTypeFiltersProps = {
	exportAllRows: TransactionTypeTableRecord[];
	exportFilteredRows: TransactionTypeTableRecord[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	moduleFilter: string;
	moduleFilterOptions: Array<{ label: string; value: string }>;
	searchTerm: string;
	statusFilter: TransactionTypeStatusFilter;
	table: Table<TransactionTypeTableRecord>;
	onModuleFilterChange: (value: string) => void;
	onRefresh: () => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: TransactionTypeStatusFilter) => void;
};

export type TransactionTypeTableRowProps = {
	row: Row<TransactionTypeTableRecord>;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
};
