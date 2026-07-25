"use client";

import { Edit3, MapPin } from "lucide-react";
import { getWarehouseStorageSetup } from "@/app/src/data/modules/warehouse-management/storage-locations/WarehouseStorageData";
import type { WarehouseStorageListRecord } from "@/app/src/types/modules/warehouse-management/storage-locations/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseStorageDetailsPanelProps = {
  onEditRecord?: (record: WarehouseStorageListRecord) => void;
  record: WarehouseStorageListRecord | null;
  warehouses: WarehouseRecord[];
};

export function WarehouseStorageDetailsPanel({
  onEditRecord,
  record,
  warehouses,
}: WarehouseStorageDetailsPanelProps) {
  if (!record) {
    return (
      <aside className="rounded-lg border border-dashed border-darknavy/15 bg-white p-5 text-sm text-darknavy/55">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-offwhite text-darknavy/55">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-darknavy">Select a location</h2>
        <p className="mt-1 leading-6">
          Open a row or map slot to see the location setup and any stock items assigned to that
          storage code.
        </p>
      </aside>
    );
  }

  const warehouse = warehouses.find((current) => current.id === record.warehouseId);
  const setup = getWarehouseStorageSetup(warehouse);
  return (
    <aside className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="border-b border-darknavy/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-darknavy">
                {record.location.locationCode}
              </h2>
              <ModuleStatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-sm text-darknavy/55">
              {record.location.locationName || record.path}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditRecord?.(record)}
            className={moduleHeaderActionClassNames.secondary}
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
      <div className="p-4">
        <dl className="grid gap-3 text-sm">
          <DetailRow label="Warehouse" value={warehouse?.name ?? record.values[2] ?? "-"} />
          <DetailRow label="Storage mode" value={setup.trackingMode} />
          <DetailRow label="Path" value={record.path} />
          <DetailRow label="Purpose" value={record.location.locationType || "-"} />
          <DetailRow
            label="Capacity"
            value={
              record.location.capacity
                ? `${record.location.capacity} ${record.location.capacityUom ?? ""}`
                : "-"
            }
          />
          <DetailRow label="Temperature" value={record.location.temperatureZone || "-"} />
          <DetailRow label="Notes" value={record.location.notes || "-"} />
        </dl>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <dt className="text-darknavy/45">{label}</dt>
      <dd
        className={joinClasses(
          "font-medium text-darknavy",
          value === "-" ? "text-darknavy/35" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
