import type { Table } from "@tanstack/react-table";

export type DefaultAccountType = "EXPENSE" | "COLLECTION" | "FIXED_ASSET";
export type DefaultAccountStatus = "Active" | "Inactive";
export type ApiDefaultAccountStatus = "ACTIVE" | "INACTIVE";

export type GeneratedDefaultAccountRole =
	| "EXPENSE"
	| "REVENUE"
	| "FIXED_ASSET"
	| "ACCUMULATED_DEPRECIATION"
	| "DEPRECIATION_EXPENSE";

export type GeneratedDefaultAccount = {
	role: GeneratedDefaultAccountRole;
	chartAccountId: string;
	accountCode: string;
	accountTitle: string;
	accountType: string | null;
	accountNature: string | null;
	parentAccountId: string | null;
	status: ApiDefaultAccountStatus;
};

export type DefaultAccount = {
	id: string;
	type: DefaultAccountType;
	description: string;
	status: DefaultAccountStatus;
	generatedAccounts: GeneratedDefaultAccount[];
	createdAt?: string;
	updatedAt?: string;
};

export type DefaultAccountFormValues = {
	type: DefaultAccountType;
	description: string;
	status: DefaultAccountStatus;
};

export type DefaultAccountFormErrors = Partial<
	Record<keyof DefaultAccountFormValues, string>
>;

export type DefaultAccountActionMode = "add" | "edit" | "view";
export type DefaultAccountStatusFilter = "" | DefaultAccountStatus;
export type DefaultAccountTypeFilter = "" | DefaultAccountType;

export type DefaultAccountTableColumnKey =
	| "description"
	| "type"
	| "generatedAccounts"
	| "status"
	| "createdAt"
	| "updatedAt";

export type DefaultAccountPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	canExport: boolean;
};

export type DefaultAccountStatistics = {
	totalDefaultAccounts: number;
	activeDefaultAccounts: number;
	inactiveDefaultAccounts: number;
	expenseDefaultAccounts: number;
	collectionDefaultAccounts: number;
	fixedAssetDefaultAccounts: number;
};

export type ApiDefaultAccount = {
	id: string;
	type: DefaultAccountType;
	description: string;
	status: ApiDefaultAccountStatus;
	generatedAccounts: GeneratedDefaultAccount[];
	createdAt: string;
	updatedAt: string;
};

export type ApiDefaultAccountListResponse = {
	defaultAccounts: ApiDefaultAccount[];
	statistics?: Partial<DefaultAccountStatistics>;
	permissions?: Partial<DefaultAccountPermissions>;
};

export type ApiDefaultAccountSaveResponse = {
	defaultAccount: ApiDefaultAccount;
};

export type DefaultAccountListResponse = {
	defaultAccounts: DefaultAccount[];
	statistics: DefaultAccountStatistics;
	permissions: DefaultAccountPermissions;
};

export type DefaultAccountDrawerState =
	| { mode: DefaultAccountActionMode; defaultAccount?: DefaultAccount }
	| null;

export type DefaultAccountTableProps = {
	defaultAccounts: DefaultAccount[];
	filteredDefaultAccounts: DefaultAccount[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: DefaultAccountPermissions;
	query: string;
	statusFilter: DefaultAccountStatusFilter;
	typeFilter: DefaultAccountTypeFilter;
	onDeleteDefaultAccount: (account: DefaultAccount) => void;
	onEditDefaultAccount: (account: DefaultAccount) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: DefaultAccountStatusFilter) => void;
	onToggleStatus: (account: DefaultAccount) => void;
	onTypeFilterChange: (value: DefaultAccountTypeFilter) => void;
	onViewDefaultAccount: (account: DefaultAccount) => void;
};

export type DefaultAccountTableFiltersProps = {
	exportAllRows: DefaultAccount[];
	exportFilteredRows: DefaultAccount[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: DefaultAccountPermissions;
	query: string;
	statusFilter: DefaultAccountStatusFilter;
	table: Table<DefaultAccount>;
	typeFilter: DefaultAccountTypeFilter;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: DefaultAccountStatusFilter) => void;
	onTypeFilterChange: (value: DefaultAccountTypeFilter) => void;
};
