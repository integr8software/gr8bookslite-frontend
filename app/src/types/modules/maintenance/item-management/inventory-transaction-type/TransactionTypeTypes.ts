import type { ReactNode } from "react";

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
	isLoading: boolean;
	lastSyncedAt?: number | string | Date | null;
	transactionTypes: TransactionType[];
	toolbar?: ReactNode;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
};

export type TransactionTypeFiltersProps = {
	moduleFilter: string;
	moduleFilterOptions: Array<{ label: string; value: string }>;
	searchTerm: string;
	statusFilter: TransactionTypeStatusFilter;
	onModuleFilterChange: (value: string) => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: TransactionTypeStatusFilter) => void;
};
