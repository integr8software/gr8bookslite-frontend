import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import type { useItemsListPage } from "@/app/src/hooks/modules/maintenance/items/useItemsListPage";

export type ItemStatus = "Active" | "Inactive";

export type ItemBehavior =
	| "Sellable Item"
	| "Purchasable Item"
	| "Raw Material"
	| "Semi-Finished Goods / WIP"
	| "Finished Goods"
	| "Service Item"
	| "Non-Inventory Item"
	| "Fixed Asset Item"
	| "Consumable Item";

export type ItemSetupKind = "category" | "subcategory" | "type" | "subtype";

export type ItemTaxTreatment =
	| "VAT Exclusive"
	| "VAT Inclusive"
	| "VAT Exempt"
	| "Zero Rated"
	| "Non-VAT";

export type ItemPerishability = "Perishable" | "Non Perishable";

export type ItemCategoryAccountingSetupStatus =
	| "Configured"
	| "Inherited";

export type ItemCategoryAccountingSetupStatusFilter =
	| ""
	| ItemCategoryAccountingSetupStatus;

export type ItemCategoryStatusFilter = "" | ItemStatus;

export type ItemCategoryAccountingSetupMode = "inherit" | "own";

export type ItemCategoryAccountingSetup = {
	inventoryAccount: string;
	salesAccount: string;
	costOfSalesAccount: string;
	expenseAccount: string;
};

export type ItemSetupRecord = {
	id: string;
	code: string;
	name: string;
	description: string;
	parentIds?: string[];
	accountingSetupMode?: ItemCategoryAccountingSetupMode;
	accountingSetup?: Partial<ItemCategoryAccountingSetup>;
	allowSubCategory?: boolean;
	parentInactiveSourceIds?: string[];
	statusBeforeParentInactive?: ItemStatus;
	status: ItemStatus;
	createdBy?: string;
	createdAt?: string;
	updatedBy?: string;
	updatedAt?: string;
};

export type ItemBundleComponent = {
	id: string;
	itemId: string;
	itemCode: string;
	itemName: string;
	quantity: number;
	uom: string;
};

export type ItemBundleComponentItemOption = {
	id: string;
	itemCode: string;
	itemName: string;
	itemUom: string;
	uomOptions: string[];
};

export type ItemBundleLine = {
	id: string;
	itemId: string;
	quantity: number;
};

export type ItemBundleRecord = {
	id: string;
	bundlePrice: number;
	code: string;
	lines: ItemBundleLine[];
	name: string;
	status: ItemStatus;
};

export type ItemSupplierAssignment = {
	id: string;
	supplier: string;
	supplierItemCode: string;
	leadTime: string;
	lastCost: number;
	isDefault: boolean;
};

export type ItemSupplierRecord = {
	id: string;
	code: string;
	name: string;
	contactPerson: string;
	contactDetails: string;
	status: ItemStatus;
};

export type ItemAttributeUsage = "Variant" | "Stock Classification" | "Item Detail";

export type ItemAttributeRecord = {
	id: string;
	code: string;
	name: string;
	usage: ItemAttributeUsage;
	values: string[];
	requiredOnItem: boolean;
	affectsStock: boolean;
	status: ItemStatus;
};

export type ItemAttributeAssignment = {
	id: string;
	attributeId: string;
	value: string;
};

export type ItemPriceListRecord = {
	id: string;
	code: string;
	name: string;
	currency: string;
	customerType: string;
	pricingMode: "Manual" | "Cost Markup" | "Discount From Retail";
	markupPercent: number;
	status: ItemStatus;
};

export type ItemPriceListAssignment = {
	id: string;
	priceListId: string;
	price: number;
};

export type ItemRecord = {
	id: string;
	code: string;
	skuCode: string;
	name: string;
	model: string;
	externalReferenceCode: string;
	brand: string;
	supplier: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	category: string;
	subcategory?: string;
	type?: string;
	subtype?: string;
	primaryCategory: string;
	categories: string[];
	uom: string;
	responsibilityCenter: string;
	costPrice: number;
	sellingPrice: number;
	taxTreatment: ItemTaxTreatment;
	status: ItemStatus;
	defaultWarehouse: string;
	defaultLocation: string;
	defaultZone: string;
	defaultRack: string;
	defaultShelf: string;
	defaultBin: string;
	defaultLotNo: string;
	leadTime: string;
	reorderLevel: number;
	minimumStock: number;
	maximumStock: number;
	perishability: ItemPerishability;
	behavior: ItemBehavior;
	sellable: boolean;
	purchasable: boolean;
	trackInventory: boolean;
	service: boolean;
	asset: boolean;
	hasVariants: boolean;
	lotTracking: boolean;
	serialTracking: boolean;
	attributeAssignments: ItemAttributeAssignment[];
	priceListPrices: ItemPriceListAssignment[];
	description: string;
	tags: string[];
};

export type ItemFormValues = {
	code: string;
	skuCode: string;
	name: string;
	model: string;
	externalReferenceCode: string;
	brand: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	primaryCategory: string;
	uom: string;
	responsibilityCenter: string;
	costPrice: number;
	sellingPrice: number;
	taxTreatment: ItemTaxTreatment;
	status: ItemStatus;
	defaultWarehouse: string;
	defaultLocation: string;
	defaultZone: string;
	defaultRack: string;
	defaultShelf: string;
	defaultBin: string;
	defaultLotNo: string;
	leadTime: string;
	reorderLevel: number;
	minimumStock: number;
	maximumStock: number;
	perishability: ItemPerishability;
	behavior: ItemBehavior;
	sellable: boolean;
	purchasable: boolean;
	trackInventory: boolean;
	service: boolean;
	asset: boolean;
	hasVariants: boolean;
	lotTracking: boolean;
	serialTracking: boolean;
	attributeAssignments: ItemAttributeAssignment[];
	priceListPrices: ItemPriceListAssignment[];
	description: string;
	tags: string[];
};

export type ItemCategoryFormValues = {
	name: string;
	parentId: string;
	description: string;
	accountingSetupMode: ItemCategoryAccountingSetupMode;
	accountingSetup: ItemCategoryAccountingSetup;
	allowSubCategory: boolean;
	status: ItemStatus;
};

export type ItemFormErrors = Partial<
	Record<keyof ItemFormValues | "suppliers", string>
>;

export type ItemCategoryFormErrors = Partial<
	Record<
		| keyof ItemCategoryFormValues
		| keyof ItemCategoryAccountingSetup,
		string
	>
>;

export type ItemActionMode = "add" | "edit" | "view";

export type ItemsTableProps = Pick<
	ReturnType<typeof useItemsListPage>,
	"isLoading" | "lastSyncedAt" | "setPendingStatusItem" | "table"
> & {
	toolbar?: ReactNode;
};

export type ItemsTableRowProps = {
	item: ItemRecord;
	onStatusChange: (item: ItemRecord) => void;
};

export type ItemTableColumnKey =
	| "code"
	| "skuCode"
	| "name"
	| "category"
	| "uom"
	| "costPrice"
	| "sellingPrice"
	| "status";

export type ItemCategoryTableColumnKey =
	| "name"
	| "parentName"
	| "accountingSetupStatus"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type ItemCategoryTableRowData = {
	id: string;
	record: ItemSetupRecord;
	recordKind: ItemSetupKind;
	recordKindLabel: string;
	level: number;
	hasChildren: boolean;
	parentId: string;
	parentName: string;
	pathName: string;
	accountingSetupStatus: ItemCategoryAccountingSetupStatus;
	effectiveAccountingSetup?: ItemCategoryAccountingSetup;
	hasInactiveAncestor?: boolean;
	inheritedAccountingSourceName?: string;
	isVirtual?: boolean;
	usedByItemCount: number;
};

export type ItemCategoryPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
};

export type ItemCategoryTableProps = {
	accountingFilter: ItemCategoryAccountingSetupStatusFilter;
	allRows: ItemCategoryTableRowData[];
	expandedIds: Set<string>;
	filteredRows: ItemCategoryTableRowData[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: ItemCategoryPermissions;
	query: string;
	statusFilter: ItemCategoryStatusFilter;
	onAccountingFilterChange: (
		value: ItemCategoryAccountingSetupStatusFilter,
	) => void;
	onEditRecord: (row: ItemCategoryTableRowData) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusChange: (row: ItemCategoryTableRowData) => void;
	onStatusFilterChange: (value: ItemCategoryStatusFilter) => void;
	onToggleExpanded: (recordId: string) => void;
	onViewRecord: (row: ItemCategoryTableRowData) => void;
};

export type ItemCategoryTableFiltersProps = {
	accountingFilter: ItemCategoryAccountingSetupStatusFilter;
	exportAllRows: ItemCategoryTableRowData[];
	exportFilteredRows: ItemCategoryTableRowData[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: ItemCategoryPermissions;
	query: string;
	statusFilter: ItemCategoryStatusFilter;
	table: Table<ItemCategoryTableRowData>;
	onAccountingFilterChange: (
		value: ItemCategoryAccountingSetupStatusFilter,
	) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: ItemCategoryStatusFilter) => void;
};
