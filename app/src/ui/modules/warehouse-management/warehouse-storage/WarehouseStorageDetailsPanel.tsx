"use client";

import { Edit3, MapPin, MoreVertical, PackageSearch, Printer } from "lucide-react";
import { getWarehouseStorageSetup } from "@/app/src/data/modules/warehouse-management/warehouse-storage/WarehouseStorageData";
import type { WarehouseStorageListRecord } from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-darknavy">Select a location</h2>
        <p className="mt-1 leading-6">
          Choose a bin from the layout or navigator to inspect the full storage path, capacity, and
          handling details.
        </p>
      </aside>
    );
  }

  const warehouse = warehouses.find((current) => current.id === record.warehouseId);
  const setup = getWarehouseStorageSetup(warehouse);
  const capacity = Number(record.location.capacity ?? 0);
  const usedUnits = Math.max(record.itemCount, Math.round(record.itemsOnHand / 10));
  const capacityPercent = capacity > 0 ? Math.min(100, Math.max(8, Math.round((usedUnits / capacity) * 100))) : 35;
  const maxVolume =
    record.location.capacity && record.location.capacityUom
      ? `${record.location.capacity} ${record.location.capacityUom}`
      : "2.50 m3";

  return (
    <aside className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-3">
        <h2 className="text-sm font-bold text-darknavy">Location Details</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-md text-darknavy/45 hover:bg-offwhite hover:text-darknavy" aria-label="More location actions">
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-4">
        <span className="warehouse-storage-selected-badge inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold">
          Selected Location
        </span>
        <dl className="mt-4 grid gap-3 text-xs">
          <DetailRow label="Location Code" value={record.location.locationCode} />
          <DetailRow label="Location Name" value={record.location.locationName || record.path} />
          <DetailRow label="Location Type" value={record.location.locationType || "-"} />
          <DetailRow label="Parent Location" value={getParentLocation(record)} />
          <DetailRow label="Full Path" value={record.path} />
          <DetailRow label="Purpose" value={record.location.locationType || setup.trackingMode} />
          <div className="grid grid-cols-[7.5rem_1fr] gap-3">
            <dt className="font-semibold text-darknavy/55">Status</dt>
            <dd>
              <span className={getStatusClassName(record.status)}>
                {record.status === "Active" ? "Available" : record.status}
              </span>
            </dd>
          </div>
        </dl>
        <div className="my-4 border-t border-dashed border-darknavy/15" />
        <div className="grid gap-3 text-xs">
          <div className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3">
            <span className="font-semibold text-darknavy/55">Capacity Used</span>
            <div className="h-2 overflow-hidden rounded-full bg-darknavy/10">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <span className="text-right font-bold text-darknavy">{capacityPercent}%</span>
          </div>
          <DetailRow label="Used" value={`${usedUnits} of ${capacity || 20} pallets`} />
          <DetailRow label="Max Weight" value={record.location.capacity ? `${record.location.capacity} kg` : "1,000 kg"} />
          <DetailRow label="Max Volume" value={maxVolume} />
          <DetailRow label="Max Quantity" value={`${capacity || 100} EA`} />
          <DetailRow label="Item Count" value={`${record.itemCount} items`} />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <PanelAction icon={PackageSearch} label="View Stock" />
          <PanelAction icon={Edit3} label="Edit Location" onClick={() => onEditRecord?.(record)} />
          <PanelAction icon={Printer} label="Print Label" />
        </div>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3">
      <dt className="font-semibold text-darknavy/55">{label}</dt>
      <dd
        className={joinClasses(
          "min-w-0 break-words font-bold text-darknavy",
          value === "-" ? "text-darknavy/35" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function PanelAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof PackageSearch;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="warehouse-storage-violet-action inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

function getParentLocation(record: WarehouseStorageListRecord) {
  const parts = [
    record.location.zone ? `Zone ${record.location.zone}` : "",
    record.location.aisle ? `Aisle ${record.location.aisle}` : "",
    record.location.rackNo ? `Rack ${record.location.rackNo}` : "",
    record.location.shelfNo ? `Level ${record.location.shelfNo}` : "",
  ].filter(Boolean);

  return parts.join(" / ") || "-";
}

function getStatusClassName(status: WarehouseStorageListRecord["status"]) {
  const baseClassName = "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold";

  switch (status) {
    case "Blocked":
      return `${baseClassName} bg-slate-100 text-slate-600`;
    case "Reserved":
      return `${baseClassName} bg-amber-100 text-amber-700`;
    case "Inactive":
      return `${baseClassName} bg-violet-100 text-violet-700`;
    default:
      return `${baseClassName} bg-emerald-100 text-emerald-700`;
  }
}
