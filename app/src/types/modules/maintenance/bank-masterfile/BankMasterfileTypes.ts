import type { ChangeEventHandler, ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type BankMasterfileStatus = "Active" | "Inactive";

export type ApiBankStatus = "ACTIVE" | "INACTIVE";

export type BankMasterfile = {
	id: string;
	accountCode: string;
	accountTitle: string;
	bankName: string;
	branch: string;
	accountNumber: string;
	accountName: string;
	accountType: string;
	currencyCode: string;
	currencyExchangeRate: string;
	isDefault: boolean;
	seriesStart: string;
	seriesEnd: string;
	seriesDigits: string;
	status: BankMasterfileStatus;
	createdBy?: string | null;
	createdAt?: string;
	updatedBy?: string | null;
	updatedAt?: string;
};

export type BankMasterfileFormValues = {
	bankName: string;
	branch: string;
	accountNumber: string;
	accountType: string;
	currencyCode: string;
	currencyExchangeRate: string;
	isDefault: boolean;
	seriesStart: string;
	seriesEnd: string;
	seriesDigits: string;
	status: BankMasterfileStatus;
};

export type BankMasterfileFormErrors = Partial<
	Record<keyof BankMasterfileFormValues, string>
>;

export type BankMasterfileActionMode = "add" | "edit" | "view";

export type BankMasterfileTableColumnKey =
	| "bankName"
	| "branch"
	| "accountNumber"
	| "accountTitle"
	| "accountCode"
	| "currencyCode"
	| "isDefault"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type BankImportColumnId = keyof BankMasterfileFormValues;

export type BankImportCellErrors = Partial<
	Record<BankImportColumnId, string[]>
>;

export type BankImportPreviewRow = {
	cellErrors: BankImportCellErrors;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	values: BankMasterfileFormValues;
};

export type BankImportProgress = {
	imported: number;
	total: number;
};

export type BankImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = BankImportProgress;
export type ImportMode = BankImportMode;

export type BankMasterfilePermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type BankMasterfileStatistics = {
	totalBanks: number;
	activeBanks: number;
	inactiveBanks: number;
	defaultBanks: number;
};

export type BankMasterfileListResponse = {
	banks: BankMasterfile[];
	statistics: BankMasterfileStatistics;
	permissions: BankMasterfilePermissions;
};

export type ApiBank = {
	id: string;
	accountCode: string;
	accountTitle?: string | null;
	bankName: string;
	branch: string | null;
	accountNumber: string;
	accountName: string;
	chartAccount?: {
		accountTitle?: string | null;
	} | null;
	accountType: string | null;
	currencyCode: string | null;
	currencyExchangeRate: string | null;
	isDefault: boolean;
	seriesStart: string | null;
	seriesEnd: string | null;
	seriesDigits: number | null;
	status: ApiBankStatus;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

export type ApiBankListResponse = {
	bankAccounts: ApiBank[];
	statistics?: Partial<BankMasterfileStatistics>;
	permissions?: Partial<BankMasterfilePermissions>;
};

export type ApiBankSaveResponse = {
	bankAccount: ApiBank;
};

export type ApiBankImportResponse = {
	bankAccounts: ApiBank[];
};

export type ApiNextAccountCodeResponse = {
	accountCode: string;
	parentAccountCode: string;
	parentAccountTitle: string;
};

export type BankMasterfileStatusFilter = "" | BankMasterfileStatus;

export type BankMasterfileDrawerState =
	| { mode: BankMasterfileActionMode; bank?: BankMasterfile }
	| null;

export type BankMasterfileDrawerProps = {
	bank?: BankMasterfile;
	isOpen: boolean;
	mode: BankMasterfileActionMode;
	onClose: () => void;
};

export type BankMasterfileFieldsProps = {
	accountCode: string;
	errors: BankMasterfileFormErrors;
	isAccountCodeLoading: boolean;
	isReadonly: boolean;
	mode: BankMasterfileActionMode;
	values: BankMasterfileFormValues;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
};

export type BankMasterfileFormFieldProps = {
	children: ReactNode;
	className?: string;
	error?: string;
	helper?: string;
	label: string;
	required?: boolean;
};

export type BankMasterfileTableProps = {
	banks: BankMasterfile[];
	filteredBanks: BankMasterfile[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: BankMasterfilePermissions;
	query: string;
	statusFilter: BankMasterfileStatusFilter;
	onEditBank: (bank: BankMasterfile) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: BankMasterfileStatusFilter) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileStatisticCardsProps = {
	banks: BankMasterfile[];
	isLoading?: boolean;
};

export type BankMasterfileTableFiltersProps = {
	exportAllRows: BankMasterfile[];
	exportFilteredRows: BankMasterfile[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: BankMasterfilePermissions;
	query: string;
	statusFilter: BankMasterfileStatusFilter;
	table: Table<BankMasterfile>;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: BankMasterfileStatusFilter) => void;
};

export type BankMasterfileTableRowProps = {
	row: Row<BankMasterfile>;
	permissions: BankMasterfilePermissions;
	onEditBank: (bank: BankMasterfile) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileCellContentProps = {
	bank: BankMasterfile;
	columnId: string;
	permissions: BankMasterfilePermissions;
	onEditBank: (bank: BankMasterfile) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileImportDialogProps = {
	existingBanks: BankMasterfile[];
	isOpen: boolean;
	onClose: () => void;
	onImportBanks: (
		banks: BankMasterfileFormValues[],
	) => Promise<BankMasterfile[]>;
};

export type BankImportRowProps = {
	row: BankImportPreviewRow;
	selected: boolean;
	disabled: boolean;
	onToggle: (rowId: string, selected: boolean) => void;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
};
