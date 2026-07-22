export type {
	ItemActionMode,
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingRequirements,
	ItemCategoryAccountingSetupMode,
	ItemCategoryAccountingSetupStatus,
	ItemCategoryAccountingSetupStatusFilter,
	ItemCategoryFormErrors,
	ItemCategoryFormValues,
	ItemBehavior,
	ItemCategoryPermissions,
	ItemCategoryStatusFilter,
	ItemCategoryTableColumnKey,
	ItemCategoryTableFiltersProps,
	ItemCategoryTableProps,
	ItemCategoryTableRowData,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

import type {
	ItemBehavior,
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryPermissions,
	ItemCategoryTableRowData,
	ItemSetupRecord,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

export type ApiItemCategoryStatus = "ACTIVE" | "INACTIVE";

export type ApiItemCategoryAccountingSetupMode = "INHERIT" | "AUTO_CREATE";

export type ApiItemCategory = {
	id: string;
	code: string;
	name: string;
	description: string | null;
	parentId: string | null;
	accountingSetupMode: ApiItemCategoryAccountingSetupMode;
	accountingSetup: Partial<ItemCategoryAccountingSetup> | null;
	effectiveAccountingSetup: ItemCategoryAccountingSetup;
	requiresInventoryAccount: boolean;
	requiresSalesAccount: boolean;
	requiresCostOfSalesAccount: boolean;
	requiresExpenseAccount: boolean;
	behaviors: ItemBehavior[];
	inheritedAccountingSourceName: string | null;
	allowSubCategory: boolean;
	status: ApiItemCategoryStatus;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
	usedByItemCount: number;
};

export type ItemCategoryStatistics = {
	totalCount: number;
	activeCount: number;
	inactiveCount: number;
	configuredCount: number;
	inheritedCount: number;
	subcategoryLockedCount: number;
};

export type ItemCategoryListResponse = {
	categories: ItemCategoryTableRowData[];
	records: ItemSetupRecord[];
	permissions: ItemCategoryPermissions;
	statistics: ItemCategoryStatistics;
};

export type ApiItemCategoryListResponse = {
	categories: ApiItemCategory[];
	statistics: ItemCategoryStatistics;
	permissions: ItemCategoryPermissions;
};

export type ApiItemCategorySaveResponse = {
	category: ApiItemCategory;
};

export type ApiItemCategoryOption = {
	id: string;
	code: string;
	name: string;
	description: string | null;
	parentId: string | null;
	behaviors: ItemBehavior[];
	allowSubCategory: boolean;
	status: ApiItemCategoryStatus;
};

export type ApiItemCategoryOptionsResponse = {
	categories: ApiItemCategoryOption[];
};

export type ItemCategorySavePayload = {
	id?: string;
	parentId: string;
	values: {
		name: string;
		parentId: string;
		description: string;
		accountingSetupMode: ItemCategoryAccountingSetupMode;
		accountingSetup: ItemCategoryAccountingSetup;
		requiresInventoryAccount: boolean;
		requiresSalesAccount: boolean;
		requiresCostOfSalesAccount: boolean;
		requiresExpenseAccount: boolean;
		behaviors: ItemBehavior[];
		allowSubCategory: boolean;
		status: ItemStatus;
	};
};
