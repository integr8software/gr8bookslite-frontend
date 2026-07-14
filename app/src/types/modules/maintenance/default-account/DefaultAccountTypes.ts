import type {
	ColumnOrderState,
	Row,
	SortingState,
	Table,
	VisibilityState,
} from "@tanstack/react-table";

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
	defaultAccountName: string;
	description: string;
	status: DefaultAccountStatus;
	expenseParentCoaId?: string;
	generatedAccounts: GeneratedDefaultAccount[];
	createdBy?: string | null;
	createdAt?: string;
	updatedBy?: string | null;
	updatedAt?: string;
};

export type DefaultAccountFormValues = {
	type: DefaultAccountType;
	defaultAccountName: string;
	description: string;
	status: DefaultAccountStatus;
	expenseParentCoaId: string;
};

export type DefaultAccountFormErrors = Partial<
	Record<keyof DefaultAccountFormValues, string>
>;

export type DefaultAccountActionMode = "add" | "edit" | "view";
export type DefaultAccountStatusFilter = "" | DefaultAccountStatus;
export type DefaultAccountTypeFilter = "" | DefaultAccountType;

export type DefaultAccountTableColumnKey =
	| "defaultAccountName"
	| "description"
	| "type"
	| "accountCode"
	| "accountName"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type DefaultAccountTablePreferences = {
	columnOrder: ColumnOrderState;
	columnVisibility: VisibilityState;
	sorting: SortingState;
};

export type DefaultAccountColumnMeta = {
	className: string;
	headerAlign?: "center" | "left";
};

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
	defaultAccountName: string;
	description: string;
	status: ApiDefaultAccountStatus;
	generatedAccounts: GeneratedDefaultAccount[];
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
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

export type DefaultAccountExpenseParentOption = {
	id: string;
	accountCode: string;
	accountTitle: string;
	accountLevel: string;
	parentAccountId: string | null;
};

export type ApiDefaultAccountExpenseParentOptionsResponse = {
	options: DefaultAccountExpenseParentOption[];
};

export type DefaultAccountListResponse = {
	defaultAccounts: DefaultAccount[];
	statistics: DefaultAccountStatistics;
	permissions: DefaultAccountPermissions;
};

export type DefaultAccountDrawerState =
	| { mode: DefaultAccountActionMode; defaultAccount?: DefaultAccount }
	| null;

export type DefaultAccountDrawerProps = {
	defaultAccount?: DefaultAccount;
	isOpen: boolean;
	mode: DefaultAccountActionMode;
	onClose: () => void;
};

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

export type DefaultAccountTableRowProps = {
	row: Row<DefaultAccount>;
	permissions: DefaultAccountPermissions;
	onEditDefaultAccount: (account: DefaultAccount) => void;
	onToggleStatus: (account: DefaultAccount) => void;
	onViewDefaultAccount: (account: DefaultAccount) => void;
};
