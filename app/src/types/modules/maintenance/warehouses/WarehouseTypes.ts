import type { ReactNode } from "react";
import type { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseListPage";
import type {
	WarehouseAccessFormErrors,
	WarehouseAccessPermission,
	WarehouseAccessRecord,
} from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type {
	WarehouseStockItem,
	WarehouseStockMovement,
} from "@/app/src/types/modules/maintenance/warehouse-stock-inquiry/WarehouseStockInquiryTypes";
import type { WarehouseTransferRecord } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";
import type { StorageLocationRecord } from "@/app/src/types/modules/maintenance/storage-locations/StorageLocationTypes";

export type WarehouseStatus = "Active" | "Inactive";

export type WarehouseBranchAvailability =
	| "Home Branch Only"
	| "Selected Branches"
	| "All Branches";

export type WarehouseRecord = {
	id: string;
	code: string;
	name: string;
	type: string;
	branchName: string;
	availability: WarehouseBranchAvailability;
	availableBranches: string[];
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
	access: WarehouseAccessRecord[];
	items: WarehouseStockItem[];
	locations: StorageLocationRecord[];
	movements: WarehouseStockMovement[];
	transfers: WarehouseTransferRecord[];
};

export type WarehouseFormValues = {
	code: string;
	name: string;
	availableBranches: string[];
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
};

export type WarehouseFormErrors = Partial<Record<keyof WarehouseFormValues, string>>;

export type WarehouseActionMode = "add" | "edit" | "view";

export type DrawerState =
	| { mode: "add" | "edit"; warehouse?: WarehouseRecord }
	| null;

export type WarehouseRecordActionsProps = {
	warehouse: WarehouseRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
	onEditWarehouse: (warehouse: WarehouseRecord) => void;
};

export type WarehouseAccessTableProps = {
	accessRecords: WarehouseAccessRecord[];
	errors: WarehouseAccessFormErrors;
	isPending: boolean;
	onAddAccess: () => void;
	onRemoveAccess: (accessId: string) => void;
	onTogglePermission: (
		accessId: string,
		permission: WarehouseAccessPermission,
	) => void;
	onUpdateAccess: <TKey extends keyof WarehouseAccessRecord>(
		accessId: string,
		field: TKey,
		value: WarehouseAccessRecord[TKey],
	) => void;
};

export type WarehouseTableProps = Pick<
	ReturnType<typeof useWarehouseListPage>,
	"isLoading" | "lastSyncedAt" | "setPendingDeleteWarehouse" | "table"
> & {
	toolbar?: ReactNode;
	onEditWarehouse: (
		warehouse: ReturnType<typeof useWarehouseListPage>["warehouses"][number],
	) => void;
};

export type WarehouseTableRowProps = {
	warehouse: WarehouseTableRecord;
	onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
	onEditWarehouse: (warehouse: WarehouseRecord) => void;
};

export type WarehouseTableColumnKey =
	| "code"
	| "name"
	| "availableBranchLabel"
	| "managerName"
	| "totalItems"
	| "inventoryValue"
	| "status";

export type WarehouseTableRecord = WarehouseRecord & {
	availableBranchLabel: string;
	totalItems: number;
	inventoryValue: number;
};
