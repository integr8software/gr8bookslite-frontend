import type { useWarehouseAccessListPage } from "@/app/src/hooks/modules/maintenance/warehouse-access/useWarehouseAccessListPage";
import type { WarehouseStatus } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export type WarehouseAccessLevel = "Viewer" | "Picker" | "Manager";

export type WarehouseAccessPermission =
	| "View Stock"
	| "Receive Stock"
	| "Issue Stock"
	| "Transfer Stock"
	| "Adjust Stock"
	| "Manage Locations"
	| "View History";

export type WarehouseAccessRecord = {
	id: string;
	userName: string;
	accessLevel: WarehouseAccessLevel;
	permissions: WarehouseAccessPermission[];
	status: WarehouseStatus;
};

export type WarehouseAccessFormValues = {
	accessLevel: WarehouseAccessLevel;
	permissions: WarehouseAccessPermission[];
	status: WarehouseStatus;
	userName: string;
	warehouseId: string;
};

export type WarehouseAccessFormErrors = Record<
	string,
	Partial<Record<keyof WarehouseAccessRecord | "permissions", string>>
>;

export type WarehouseAccessListRecord = {
	id: string;
	recordId: string;
	status: WarehouseStatus;
	values: string[];
	warehouseId: string;
};

export type WarehouseAccessTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useWarehouseAccessListPage>;
};
