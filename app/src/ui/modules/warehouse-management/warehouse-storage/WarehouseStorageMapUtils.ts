import type {
  WarehouseStorageListRecord,
  WarehouseStorageStatus,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";

export type WarehouseStorageLayoutSlot = {
  aisle: string;
  bin: string;
  id: string;
  label: string;
  rack: string;
  record?: WarehouseStorageListRecord;
  shelf: string;
  status: WarehouseStorageStatus | "Occupied" | "Full" | "Maintenance";
};

export type WarehouseStorageShortcutArea = {
  icon: import("lucide-react").LucideIcon;
  label: string;
  targetRecord?: WarehouseStorageListRecord;
};

export function compareWarehouseStorageLocationTokens(
  first: string | undefined,
  second: string | undefined,
) {
  const firstValue = first || "";
  const secondValue = second || "";
  const firstNumber = Number(firstValue);
  const secondNumber = Number(secondValue);

  if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber)) {
    return firstNumber - secondNumber;
  }

  return firstValue.localeCompare(secondValue);
}

export function getFirstWarehouseStorageRecordForZone(
  records: WarehouseStorageListRecord[],
  zone: string,
) {
  return records.find((record) => (record.location.zone || "General") === zone);
}

export function getFirstWarehouseStorageRecordForType(
  records: WarehouseStorageListRecord[],
  type: string,
) {
  return records.find((record) => (record.location.locationType || "").includes(type));
}

export function createWarehouseStorageLayoutSlots(records: WarehouseStorageListRecord[]) {
  return [...records]
    .sort(
      (first, second) =>
        compareWarehouseStorageLocationTokens(first.location.aisle, second.location.aisle) ||
        compareWarehouseStorageLocationTokens(first.location.rackNo, second.location.rackNo) ||
        compareWarehouseStorageLocationTokens(first.location.shelfNo, second.location.shelfNo) ||
        compareWarehouseStorageLocationTokens(first.location.binNo, second.location.binNo),
    )
    .map<WarehouseStorageLayoutSlot>((record, index) => {
      const aisle = normalizeLocationToken(record.location.aisle, "01");
      const rack = normalizeLocationToken(record.location.rackNo, "01");
      const shelf = normalizeLocationToken(record.location.shelfNo, "01");
      const bin = normalizeLocationToken(record.location.binNo, String(index + 1).padStart(2, "0"));

      return {
        aisle,
        bin,
        id: `slot-${record.id}`,
        label: `B${bin}`,
        rack,
        record,
        shelf,
        status: getWarehouseStorageSlotStatus(record, index + 1),
      };
    });
}

function normalizeLocationToken(value: string | undefined, fallback: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  return Number.isNaN(Number(normalizedValue)) ? normalizedValue : normalizedValue.padStart(2, "0");
}

function getWarehouseStorageSlotStatus(
  record: WarehouseStorageListRecord | undefined,
  slotNumber: number,
) {
  if (record?.status === "Blocked") return "Blocked";
  if (record?.status === "Reserved") return "Reserved";
  if (record?.status === "Inactive") return "Maintenance";
  if (record && record.itemsOnHand > 0) return "Occupied";
  if (slotNumber % 17 === 0) return "Full";
  if (slotNumber % 23 === 0) return "Maintenance";

  return "Active";
}
