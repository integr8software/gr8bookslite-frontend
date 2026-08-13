"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Expand,
  Folder,
  Grid3X3,
  MapPinned,
  Minus,
  PackageSearch,
  Plus,
  Search,
} from "lucide-react";
import type {
  WarehouseStorageListRecord,
  WarehouseStorageShortcutArea,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { ModuleTableFilterSelect } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  WarehouseStorageAisleBlock,
  WarehouseStorageLegendDot,
} from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageLayoutView";
import { WarehouseStorageLocationNavigator } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageLocationNavigator";
import {
  compareWarehouseStorageLocationTokens,
  createWarehouseStorageLayoutSlots,
  getFirstWarehouseStorageRecordForType,
  getFirstWarehouseStorageRecordForZone,
} from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapUtils";

type WarehouseStorageMapViewProps = {
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onSelectRecord: (recordId: string) => void;
  onStatusFilterChange: (value: string) => void;
  onWarehouseFilterChange: (value: string) => void;
  query: string;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  statusFilter: string;
  statuses: string[];
  warehouses: WarehouseRecord[];
};

const MinZoom = 75;
const MaxZoom = 150;
const ZoomStep = 25;

export function WarehouseStorageMapView({
  isLoading,
  onQueryChange,
  onSelectRecord,
  onStatusFilterChange,
  onWarehouseFilterChange,
  query,
  records,
  selectedRecordId,
  statusFilter,
  statuses,
  warehouses,
}: WarehouseStorageMapViewProps) {
  const [typeFilter, setTypeFilter] = useState("All");
  const [zoom, setZoom] = useState(100);
  const visibleRecords = useMemo(
    () =>
      typeFilter === "All"
        ? records
        : records.filter((record) => (record.location.locationType || "Unassigned") === typeFilter),
    [records, typeFilter],
  );
  const selectedRecord =
    visibleRecords.find((record) => record.id === selectedRecordId) ?? visibleRecords[0] ?? null;
  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === selectedRecord?.warehouseId,
  );
  const activeWarehouseRecords = selectedWarehouse
    ? visibleRecords.filter((record) => record.warehouseId === selectedWarehouse.id)
    : visibleRecords;
  const locationTypes = Array.from(
    new Set(records.map((record) => record.location.locationType || "Unassigned")),
  ).sort((first, second) => first.localeCompare(second));
  const statusOptions = [
    { label: "All Statuses", value: "All" },
    ...statuses.map((status) => ({ label: status, value: status })),
  ];
  const typeOptions = [
    { label: "All Types", value: "All" },
    ...locationTypes.map((type) => ({ label: type, value: type })),
  ];
  const zones = Array.from(
    new Set(activeWarehouseRecords.map((record) => record.location.zone || "General")),
  ).sort((first, second) => first.localeCompare(second));
  const selectedZone = selectedRecord?.location.zone || zones[0] || "General";
  const primaryZone = zones.includes(selectedZone) ? selectedZone : (zones[0] ?? "General");
  const zoneRecords = activeWarehouseRecords.filter(
    (record) => (record.location.zone || "General") === primaryZone,
  );
  const layoutSlots = createWarehouseStorageLayoutSlots(zoneRecords);
  const layoutAisles = Array.from(new Set(layoutSlots.map((slot) => slot.aisle))).sort(
    compareWarehouseStorageLocationTokens,
  );
  const selectedLocationLabel = selectedRecord
    ? selectedRecord.location.locationName || selectedRecord.location.locationCode
    : "No location selected";
  const navigatorKey = useMemo(
    () =>
      [
        warehouses.map((warehouse) => warehouse.id).join(","),
        visibleRecords.map((record) => record.id).join(","),
      ].join("|"),
    [visibleRecords, warehouses],
  );
  const shortcutAreas: WarehouseStorageShortcutArea[] = [
    {
      icon: Boxes,
      label:
        zones.length > 1
          ? `Zone ${zones.find((zone) => zone !== primaryZone) ?? zones[0]}`
          : `Zone ${primaryZone}`,
      targetRecord: getFirstWarehouseStorageRecordForZone(
        activeWarehouseRecords,
        zones.find((zone) => zone !== primaryZone) ?? primaryZone,
      ),
    },
    {
      icon: PackageSearch,
      label: "Receiving Area",
      targetRecord: getFirstWarehouseStorageRecordForType(activeWarehouseRecords, "Receiving"),
    },
    {
      icon: Folder,
      label: "Quality Hold",
      targetRecord: getFirstWarehouseStorageRecordForType(activeWarehouseRecords, "Quality Hold"),
    },
    {
      icon: MapPinned,
      label: "Dispatch Area",
      targetRecord: getFirstWarehouseStorageRecordForType(activeWarehouseRecords, "Dispatch"),
    },
  ];

  useEffect(() => {
    if (selectedRecord && selectedRecord.id !== selectedRecordId) {
      onSelectRecord(selectedRecord.id);
    }
  }, [onSelectRecord, selectedRecord, selectedRecordId]);

  if (isLoading) {
    return (
      <section className="grid gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="h-[34rem] animate-pulse rounded-lg bg-white shadow-sm" />
        <div className="h-[34rem] animate-pulse rounded-lg bg-white shadow-sm" />
      </section>
    );
  }

  if (records.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-darknavy/15 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-offwhite text-darknavy/55">
          <Grid3X3 className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-darknavy">No locations to map</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-darknavy/55">
          Add structured storage codes first. The visual layout will group locations by warehouse,
          zone, aisle, rack, shelf, and bin.
        </p>
      </section>
    );
  }

  return (
    <section
      className={joinClasses("grid min-h-[34rem] gap-3", "lg:grid-cols-[18rem_minmax(0,1fr)]")}
    >
      <WarehouseStorageLocationNavigator
        key={navigatorKey}
        query={query}
        records={visibleRecords}
        selectedRecordId={selectedRecord?.id ?? null}
        warehouses={warehouses}
        onQueryChange={onQueryChange}
        onSelectRecord={onSelectRecord}
        onSelectWarehouse={(warehouseId) => {
          onWarehouseFilterChange(warehouseId);
          const firstRecord = visibleRecords.find((record) => record.warehouseId === warehouseId);

          if (firstRecord) {
            onSelectRecord(firstRecord.id);
          }
        }}
      />
      <div className="min-w-0 rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 p-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <label className="relative min-w-[13rem] flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search in layout..."
                className="h-10 w-full rounded-md border border-darknavy/10 bg-white pl-9 pr-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/10"
              />
            </label>
            <ModuleTableFilterSelect
              className="min-w-[11rem]"
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={onStatusFilterChange}
            />
            <ModuleTableFilterSelect
              className="min-w-[11rem]"
              label="Types"
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
          </div>
          <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-darknavy/10 bg-white text-sm font-semibold text-darknavy/65">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center border-r border-darknavy/10 hover:bg-offwhite hover:text-darknavy"
              aria-label="Fit layout"
              onClick={() => setZoom(100)}
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center border-r border-darknavy/10 hover:bg-offwhite hover:text-darknavy"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(MinZoom, value - ZoomStep))}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-16 px-4 text-center">{zoom}%</span>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center border-l border-darknavy/10 hover:bg-offwhite hover:text-darknavy"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(MaxZoom, value + ZoomStep))}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="space-y-3 overflow-auto p-3">
          <div
            className="origin-top-left overflow-hidden rounded-lg border border-violet-400/35 bg-white transition-transform"
            style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}
          >
            <div className="border-b border-violet-200/70 bg-violet-50/55 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase text-violet-600">
                    {selectedWarehouse ? selectedWarehouse.name : "All Warehouses"} - Zone{" "}
                    {primaryZone}
                  </p>
                  <h2 className="mt-1 truncate text-sm font-bold text-darknavy">
                    {selectedLocationLabel}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-darknavy/50">
                    {selectedRecord?.path ?? `Zone ${primaryZone}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {zones.map((zone) => {
                    const targetRecord = getFirstWarehouseStorageRecordForZone(
                      activeWarehouseRecords,
                      zone,
                    );
                    const isActive = zone === primaryZone;

                    return (
                      <button
                        key={zone}
                        type="button"
                        disabled={!targetRecord}
                        onClick={() => targetRecord && onSelectRecord(targetRecord.id)}
                        className={joinClasses(
                          "min-h-8 rounded-md border px-3 text-xs font-bold transition",
                          isActive
                            ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                            : "border-violet-200 bg-white text-violet-600 hover:border-violet-400 hover:bg-violet-50",
                        )}
                      >
                        Zone {zone}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {layoutSlots.length > 0 ? (
              <div className="grid gap-3 bg-violet-50/20 p-3 xl:grid-cols-3">
                {layoutAisles.map((aisle) => (
                  <WarehouseStorageAisleBlock
                    key={aisle}
                    aisle={aisle}
                    onSelectRecord={onSelectRecord}
                    selectedRecordId={selectedRecord?.id ?? null}
                    slots={layoutSlots.filter((slot) => slot.aisle === aisle)}
                  />
                ))}
              </div>
            ) : (
              <div className="m-3 rounded-lg border border-dashed border-violet-300 bg-white p-8 text-center text-sm font-semibold text-darknavy/55">
                No locations match the selected zone and filters.
              </div>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {shortcutAreas.map(({ icon: Icon, label, targetRecord }) => (
              <button
                key={label}
                type="button"
                disabled={!targetRecord}
                onClick={() => targetRecord && onSelectRecord(targetRecord.id)}
                className="flex min-h-16 items-center justify-center gap-2 rounded-lg border border-dashed border-violet-400/45 bg-violet-50/20 px-3 text-xs font-bold uppercase tracking-normal text-violet-600 transition hover:bg-violet-50"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-darknavy/10 bg-white px-4 py-3 text-xs font-semibold text-darknavy/55">
            <WarehouseStorageLegendDot className="bg-emerald-500" label="Available" />
            <WarehouseStorageLegendDot className="bg-blue-500" label="Occupied" />
            <WarehouseStorageLegendDot className="bg-amber-500" label="Reserved" />
            <WarehouseStorageLegendDot className="bg-slate-400" label="Blocked" />
            <WarehouseStorageLegendDot className="bg-rose-500" label="Full" />
            <WarehouseStorageLegendDot className="bg-violet-500" label="Under Maintenance" />
            {selectedWarehouse ? (
              <span className="ml-auto text-darknavy/45">{selectedWarehouse.name}</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
