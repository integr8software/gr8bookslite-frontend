import type {
  WarehouseBranchAvailability,
  WarehouseBranchAvailabilityMode,
  WarehouseFormValues,
  WarehouseRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export const WarehouseInitialFormValues: WarehouseFormValues = {
  code: "",
  name: "",
  branchUnitIds: [],
  branchAvailabilityMode: "All Branches",
  availableBranches: [],
  managerName: "",
  status: "Active",
  address: "",
  contactNo: "",
  description: "",
};

export function createWarehouseFormValues(warehouse: WarehouseRecord): WarehouseFormValues {
  return {
    code: warehouse.code,
    name: warehouse.name,
    branchUnitIds: warehouse.branchUnitIds,
    branchAvailabilityMode: warehouse.branchAvailabilityMode,
    availableBranches: warehouse.availableBranches,
    managerName: warehouse.managerName,
    status: warehouse.status,
    address: warehouse.address,
    contactNo: warehouse.contactNo,
    description: warehouse.description,
  };
}

export function updateWarehouseRecord(warehouse: WarehouseRecord, values: WarehouseFormValues): WarehouseRecord {
  return {
    ...warehouse,
    code: values.code.trim() || warehouse.code,
    ...createWarehouseRecordFields(values),
  };
}

export function getWarehouseAvailableStock(item: { onHand: number; allocated?: number; reserved?: number }) {
  return item.onHand - (item.reserved ?? item.allocated ?? 0);
}

export function getWarehouseAvailableBranchLabel(warehouse: {
  availability?: WarehouseBranchAvailability;
  branchAvailabilityMode?: WarehouseBranchAvailabilityMode;
  availableBranches: string[];
  branchName?: string;
}) {
  const mode = warehouse.branchAvailabilityMode ?? warehouse.availability;

  if (mode === "All Branches") {
    return "All branches";
  }

  if (mode === "Except Branches") {
    return warehouse.availableBranches.length > 0 ? `All except ${warehouse.availableBranches.join(", ")}` : "All branches";
  }

  return warehouse.availableBranches.length > 0 ? warehouse.availableBranches.join(", ") : "No branches selected";
}

function createWarehouseRecordFields(values: WarehouseFormValues) {
  const availableBranches = normalizeWarehouseAvailableBranches(values);
  const branchName = availableBranches[0] ?? "";

  return {
    name: values.name,
    branchUnitIds: values.branchUnitIds,
    branchAvailabilityMode: values.branchAvailabilityMode,
    branchName,
    availability: values.branchAvailabilityMode,
    availableBranches,
    managerName: values.managerName,
    status: values.status,
    address: values.address,
    contactNo: values.contactNo,
    description: values.description,
  };
}

function normalizeWarehouseAvailableBranches(values: WarehouseFormValues) {
  return Array.from(new Set(values.availableBranches.filter((branchName) => branchName.trim())));
}
