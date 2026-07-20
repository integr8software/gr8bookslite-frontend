import type { ReactNode } from "react";
import type { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseListPage";
import type { WarehouseAccessRecord } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type { WarehouseStockItem, WarehouseStockMovement } from "@/app/src/types/modules/maintenance/warehouse-stock-inquiry/WarehouseStockInquiryTypes";
import type { WarehouseTransferRecord } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";
import type { WarehouseStorageRecord } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";

export type WarehouseStatus = "Active" | "Inactive";
export type ApiWarehouseStatus = "ACTIVE" | "INACTIVE";
export type WarehouseBranchAvailabilityMode = "All Branches" | "Specific Branches" | "Except Branches";
export type ApiWarehouseBranchAvailabilityMode = "ALL" | "SPECIFIC" | "EXCEPT";

export type WarehouseBranchAvailability = WarehouseBranchAvailabilityMode;
export type WarehouseViewMode = "list" | "grid";

export type WarehouseRecord = {
  id: string;
  code: string;
  name: string;
  branchUnitIds: string[];
  branchAvailabilityMode: WarehouseBranchAvailabilityMode;
  branchName: string;
  availability: WarehouseBranchAvailability;
  availableBranches: string[];
  managerName: string;
  status: WarehouseStatus;
  address: string;
  contactNo: string;
  description: string;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  access: WarehouseAccessRecord[];
  items: WarehouseStockItem[];
  locations: WarehouseStorageRecord[];
  movements: WarehouseStockMovement[];
  transfers: WarehouseTransferRecord[];
};

export type ApiWarehouseBranch = {
  id: string;
  code: string;
  name: string;
};

export type ApiWarehouse = {
  id: string;
  code: string;
  name: string;
  branchUnitIds: string[];
  branchAvailabilityMode?: ApiWarehouseBranchAvailabilityMode;
  branches: ApiWarehouseBranch[];
  managerName: string | null;
  status: ApiWarehouseStatus;
  address: string | null;
  contactNo: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
};

export type ApiWarehousePayload = {
  code?: string;
  name: string;
  branchUnitIds: string[];
  branchAvailabilityMode: ApiWarehouseBranchAvailabilityMode;
  managerName?: string | null;
  status?: ApiWarehouseStatus;
  address?: string | null;
  contactNo?: string | null;
  description?: string | null;
};

export type WarehouseStatistics = {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
};

export type WarehousePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
};

export type ApiWarehouseListResponse = {
  warehouses: ApiWarehouse[];
  statistics: WarehouseStatistics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  permissions: WarehousePermissions;
};

export type ApiWarehouseSaveResponse = {
  warehouse: ApiWarehouse;
};

export type WarehouseListResponse = {
  warehouses: WarehouseRecord[];
  statistics: WarehouseStatistics;
  permissions: WarehousePermissions;
};

export type WarehouseFormValues = {
  code: string;
  name: string;
  branchUnitIds: string[];
  branchAvailabilityMode: WarehouseBranchAvailabilityMode;
  availableBranches: string[];
  managerName: string;
  status: WarehouseStatus;
  address: string;
  contactNo: string;
  description: string;
};

export type WarehouseFormErrors = Partial<Record<keyof WarehouseFormValues, string>>;

export type WarehouseActionMode = "add" | "edit" | "view";

export type DrawerState = { mode: WarehouseActionMode; warehouse?: WarehouseRecord } | null;

export type WarehouseRecordActionsProps = {
  warehouse: WarehouseRecord;
  onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
  onEditWarehouse: (warehouse: WarehouseRecord) => void;
  onViewWarehouse: (warehouse: WarehouseRecord) => void;
};

export type WarehouseTableProps = Pick<ReturnType<typeof useWarehouseListPage>, "isLoading" | "lastSyncedAt" | "setPendingDeleteWarehouse" | "table"> & {
  toolbar?: ReactNode;
  onEditWarehouse: (warehouse: ReturnType<typeof useWarehouseListPage>["warehouses"][number]) => void;
  onViewWarehouse: (warehouse: ReturnType<typeof useWarehouseListPage>["warehouses"][number]) => void;
};

export type WarehouseTableRowProps = {
  warehouse: WarehouseTableRecord;
  visibleColumnIds: string[];
  onDeleteWarehouse: (warehouse: WarehouseRecord) => void;
  onEditWarehouse: (warehouse: WarehouseRecord) => void;
  onViewWarehouse: (warehouse: WarehouseRecord) => void;
};

export type WarehouseTableColumnKey =
  | "code"
  | "name"
  | "address"
  | "description"
  | "availableBranchLabel"
  | "managerName"
  | "totalItems"
  | "inventoryValue"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type WarehouseTableRecord = WarehouseRecord & {
  availableBranchLabel: string;
  availableBranchNameSet: Set<string>;
  totalItems: number;
  inventoryValue: number;
};
