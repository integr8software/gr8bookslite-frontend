"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Expand,
  Folder,
  Grid3X3,
  MapPinned,
  Minus,
  PackageSearch,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import type {
  WarehouseStorageListRecord,
  WarehouseStorageStatus,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { ModuleTableFilterSelect } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

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

type LayoutSlot = {
  aisle: string;
  bin: string;
  id: string;
  label: string;
  rack: string;
  record?: WarehouseStorageListRecord;
  shelf: string;
  status: WarehouseStorageStatus | "Occupied" | "Full" | "Maintenance";
};

type ShortcutArea = {
  icon: LucideIcon;
  label: string;
  targetRecord?: WarehouseStorageListRecord;
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
  const layoutSlots = createLayoutSlots(zoneRecords);
  const layoutAisles = Array.from(new Set(layoutSlots.map((slot) => slot.aisle))).sort(
    compareLocationTokens,
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
  const shortcutAreas: ShortcutArea[] = [
    {
      icon: Boxes,
      label:
        zones.length > 1
          ? `Zone ${zones.find((zone) => zone !== primaryZone) ?? zones[0]}`
          : `Zone ${primaryZone}`,
      targetRecord: getFirstRecordForZone(
        activeWarehouseRecords,
        zones.find((zone) => zone !== primaryZone) ?? primaryZone,
      ),
    },
    {
      icon: PackageSearch,
      label: "Receiving Area",
      targetRecord: getFirstRecordForType(activeWarehouseRecords, "Receiving"),
    },
    {
      icon: Folder,
      label: "Quality Hold",
      targetRecord: getFirstRecordForType(activeWarehouseRecords, "Quality Hold"),
    },
    {
      icon: MapPinned,
      label: "Dispatch Area",
      targetRecord: getFirstRecordForType(activeWarehouseRecords, "Dispatch"),
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
      <LocationNavigator
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
                    const targetRecord = getFirstRecordForZone(activeWarehouseRecords, zone);
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
                  <AisleBlock
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
            <LegendDot className="bg-emerald-500" label="Available" />
            <LegendDot className="bg-blue-500" label="Occupied" />
            <LegendDot className="bg-amber-500" label="Reserved" />
            <LegendDot className="bg-slate-400" label="Blocked" />
            <LegendDot className="bg-rose-500" label="Full" />
            <LegendDot className="bg-violet-500" label="Under Maintenance" />
            {selectedWarehouse ? (
              <span className="ml-auto text-darknavy/45">{selectedWarehouse.name}</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationNavigator({
  onQueryChange,
  onSelectRecord,
  onSelectWarehouse,
  query,
  records,
  selectedRecordId,
  warehouses,
}: {
  onQueryChange: (value: string) => void;
  onSelectRecord: (recordId: string) => void;
  onSelectWarehouse: (warehouseId: string) => void;
  query: string;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouses: WarehouseRecord[];
}) {
  const defaultExpandedKeys = useMemo(
    () => createDefaultNavigatorKeys(records, warehouses),
    [records, warehouses],
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => defaultExpandedKeys);

  function toggleKey(key: string) {
    setExpandedKeys((current) => {
      const nextKeys = new Set(current);

      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }

      return nextKeys;
    });
  }

  return (
    <aside className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-darknavy">
          <MapPinned className="h-4 w-4 text-darknavy/45" aria-hidden="true" />
          Location Navigator
        </div>
      </div>
      <div className="p-3">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search locations..."
            className="h-9 w-full rounded-md border border-darknavy/10 bg-offwhite/40 px-3 pr-9 text-sm text-darknavy outline-none placeholder:text-darknavy/35"
          />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setExpandedKeys(defaultExpandedKeys)}
            className="h-8 rounded-md border border-darknavy/10 bg-white text-xs font-semibold text-darknavy/60 transition hover:border-skyblue/30 hover:text-darknavy"
          >
            Expand
          </button>
          <button
            type="button"
            onClick={() => setExpandedKeys(new Set())}
            className="h-8 rounded-md border border-darknavy/10 bg-white text-xs font-semibold text-darknavy/60 transition hover:border-skyblue/30 hover:text-darknavy"
          >
            Collapse
          </button>
        </div>
        <div className="mt-3 max-h-[28rem] space-y-1 overflow-auto pr-1">
          {warehouses
            .filter((warehouse) => records.some((record) => record.warehouseId === warehouse.id))
            .map((warehouse) => {
              const warehouseRecords = records.filter(
                (record) => record.warehouseId === warehouse.id,
              );
              const zones = Array.from(
                new Set(warehouseRecords.map((record) => record.location.zone || "General")),
              );
              const warehouseKey = `warehouse-${warehouse.id}`;
              const isWarehouseOpen = expandedKeys.has(warehouseKey);

              return (
                <div key={warehouse.id}>
                  <NavigatorRow
                    depth={0}
                    icon="warehouse"
                    isOpen={isWarehouseOpen}
                    label={`${warehouse.name} (${warehouse.code})`}
                    onClick={() => onSelectWarehouse(warehouse.id)}
                    onToggle={() => toggleKey(warehouseKey)}
                  />
                  {isWarehouseOpen &&
                    zones.map((zone) => {
                      const zoneRecords = warehouseRecords.filter(
                        (record) => (record.location.zone || "General") === zone,
                      );
                      const aisles = Array.from(
                        new Set(zoneRecords.map((record) => record.location.aisle || "Area")),
                      );
                      const zoneKey = `${warehouseKey}-zone-${zone}`;
                      const isZoneOpen = expandedKeys.has(zoneKey);

                      return (
                        <div key={`${warehouse.id}-${zone}`}>
                          <NavigatorRow
                            depth={1}
                            icon="zone"
                            isOpen={isZoneOpen}
                            label={`Zone ${zone}`}
                            onClick={() => {
                              const firstRecord = zoneRecords[0];

                              if (firstRecord) {
                                onSelectRecord(firstRecord.id);
                              }
                            }}
                            onToggle={() => toggleKey(zoneKey)}
                          />
                          {isZoneOpen &&
                            aisles.map((aisle) => {
                              const aisleRecords = zoneRecords.filter(
                                (record) => (record.location.aisle || "Area") === aisle,
                              );
                              const racks = Array.from(
                                new Set(
                                  aisleRecords.map((record) => record.location.rackNo || "Open"),
                                ),
                              );
                              const aisleKey = `${zoneKey}-aisle-${aisle}`;
                              const isAisleOpen = expandedKeys.has(aisleKey);

                              return (
                                <div key={`${warehouse.id}-${zone}-${aisle}`}>
                                  <NavigatorRow
                                    depth={2}
                                    icon="aisle"
                                    isOpen={isAisleOpen}
                                    label={`Aisle ${aisle}`}
                                    onClick={() => {
                                      const firstRecord = aisleRecords[0];

                                      if (firstRecord) {
                                        onSelectRecord(firstRecord.id);
                                      }
                                    }}
                                    onToggle={() => toggleKey(aisleKey)}
                                  />
                                  {isAisleOpen &&
                                    racks.map((rack) => {
                                      const rackRecords = aisleRecords.filter(
                                        (record) => (record.location.rackNo || "Open") === rack,
                                      );
                                      const levels = Array.from(
                                        new Set(
                                          rackRecords.map(
                                            (record) => record.location.shelfNo || "Open",
                                          ),
                                        ),
                                      ).sort(compareLocationTokens);
                                      const rackKey = `${aisleKey}-rack-${rack}`;
                                      const isRackOpen = expandedKeys.has(rackKey);

                                      return (
                                        <div key={`${warehouse.id}-${zone}-${aisle}-${rack}`}>
                                          <NavigatorRow
                                            depth={3}
                                            icon="rack"
                                            isOpen={isRackOpen}
                                            label={`Rack ${rack}`}
                                            onClick={() => {
                                              const firstRecord = rackRecords[0];

                                              if (firstRecord) {
                                                onSelectRecord(firstRecord.id);
                                              }
                                            }}
                                            onToggle={() => toggleKey(rackKey)}
                                          />
                                          {isRackOpen &&
                                            levels.map((level) => {
                                              const levelRecords = rackRecords
                                                .filter(
                                                  (record) =>
                                                    (record.location.shelfNo || "Open") === level,
                                                )
                                                .sort((first, second) =>
                                                  compareLocationTokens(
                                                    first.location.binNo,
                                                    second.location.binNo,
                                                  ),
                                                );
                                              const levelKey = `${rackKey}-level-${level}`;
                                              const isLevelOpen = expandedKeys.has(levelKey);

                                              return (
                                                <div
                                                  key={`${warehouse.id}-${zone}-${aisle}-${rack}-${level}`}
                                                >
                                                  <NavigatorRow
                                                    depth={4}
                                                    icon="level"
                                                    isOpen={isLevelOpen}
                                                    label={`Level ${level}`}
                                                    onClick={() => {
                                                      const firstRecord = levelRecords[0];

                                                      if (firstRecord) {
                                                        onSelectRecord(firstRecord.id);
                                                      }
                                                    }}
                                                    onToggle={() => toggleKey(levelKey)}
                                                  />
                                                  {isLevelOpen &&
                                                    levelRecords
                                                      .slice(0, 8)
                                                      .map((record) => (
                                                        <NavigatorLeafRow
                                                          key={record.id}
                                                          depth={5}
                                                          isSelected={
                                                            selectedRecordId === record.id
                                                          }
                                                          label={
                                                            record.location.locationName ||
                                                            record.location.locationCode
                                                          }
                                                          onClick={() => onSelectRecord(record.id)}
                                                        />
                                                      ))}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      );
                                    })}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      </div>
    </aside>
  );
}

function NavigatorRow({
  depth,
  icon,
  isOpen,
  label,
  onClick,
  onToggle,
}: {
  depth: number;
  icon: "warehouse" | "zone" | "aisle" | "rack" | "level";
  isOpen: boolean;
  label: string;
  onClick: () => void;
  onToggle: () => void;
}) {
  const Icon = icon === "warehouse" ? Boxes : Folder;

  return (
    <div
      className="flex w-full items-center gap-1.5 rounded-md py-1 text-xs font-semibold text-darknavy/70 transition hover:bg-offwhite"
      style={{ paddingLeft: `${0.35 + depth * 0.72}rem` }}
    >
      <span className="flex min-w-0 flex-1 items-center gap-0.5">
        <button
          type="button"
          onClick={onToggle}
          className="grid h-6 w-4 shrink-0 place-items-center rounded text-darknavy/45 transition hover:bg-white hover:text-darknavy"
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
        </button>
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-1 text-left transition hover:text-darknavy"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </button>
      </span>
    </div>
  );
}

function NavigatorLeafRow({
  depth,
  isSelected,
  label,
  onClick,
}: {
  depth: number;
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={joinClasses(
        "flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-semibold transition",
        isSelected ? "warehouse-storage-selected-row" : "text-darknavy/65 hover:bg-offwhite",
      )}
      style={{ paddingLeft: `${0.35 + depth * 0.72 + 1.25}rem` }}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

function createDefaultNavigatorKeys(
  records: WarehouseStorageListRecord[],
  warehouses: WarehouseRecord[],
) {
  const keys = new Set<string>();

  warehouses
    .filter((warehouse) => records.some((record) => record.warehouseId === warehouse.id))
    .forEach((warehouse) => {
      const warehouseRecords = records.filter((record) => record.warehouseId === warehouse.id);
      const warehouseKey = `warehouse-${warehouse.id}`;

      keys.add(warehouseKey);

      Array.from(
        new Set(warehouseRecords.map((record) => record.location.zone || "General")),
      ).forEach((zone) => {
        const zoneRecords = warehouseRecords.filter(
          (record) => (record.location.zone || "General") === zone,
        );
        const zoneKey = `${warehouseKey}-zone-${zone}`;

        keys.add(zoneKey);

        Array.from(new Set(zoneRecords.map((record) => record.location.aisle || "Area"))).forEach(
          (aisle) => {
            const aisleRecords = zoneRecords.filter(
              (record) => (record.location.aisle || "Area") === aisle,
            );
            const aisleKey = `${zoneKey}-aisle-${aisle}`;

            keys.add(aisleKey);

            Array.from(
              new Set(aisleRecords.map((record) => record.location.rackNo || "Open")),
            ).forEach((rack) => {
              const rackRecords = aisleRecords.filter(
                (record) => (record.location.rackNo || "Open") === rack,
              );
              const rackKey = `${aisleKey}-rack-${rack}`;

              keys.add(rackKey);

              Array.from(
                new Set(rackRecords.map((record) => record.location.shelfNo || "Open")),
              ).forEach((level) => {
                keys.add(`${rackKey}-level-${level}`);
              });
            });
          },
        );
      });
    });

  return keys;
}

function compareLocationTokens(first: string | undefined, second: string | undefined) {
  const firstValue = first || "";
  const secondValue = second || "";
  const firstNumber = Number(firstValue);
  const secondNumber = Number(secondValue);

  if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber)) {
    return firstNumber - secondNumber;
  }

  return firstValue.localeCompare(secondValue);
}

function AisleBlock({
  aisle,
  onSelectRecord,
  selectedRecordId,
  slots,
}: {
  aisle: string;
  onSelectRecord: (recordId: string) => void;
  selectedRecordId: string | null;
  slots: LayoutSlot[];
}) {
  const racks = Array.from(new Set(slots.map((slot) => slot.rack))).sort(compareLocationTokens);

  return (
    <div className="rounded-lg border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5">
      <div className="mb-2 text-center text-xs font-bold text-darknavy/65">Aisle {aisle}</div>
      <div className="grid gap-2 md:grid-cols-2">
        {racks.map((rack) => {
          const rackSlots = slots.filter((slot) => slot.rack === rack);
          const levels = Array.from(new Set(rackSlots.map((slot) => slot.shelf))).sort(
            compareLocationTokens,
          );

          return (
            <div key={rack} className="rounded-md border border-darknavy/5 bg-offwhite/80 p-2">
              <div className="mb-2 text-[11px] font-bold text-darknavy/65">Rack {rack}</div>
              <div className="space-y-2">
                {levels.map((shelf) => (
                  <div key={shelf}>
                    <div className="mb-1 text-[10px] font-bold uppercase text-darknavy/40">
                      Level {shelf}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {rackSlots
                        .filter((slot) => slot.shelf === shelf)
                        .map((slot) => (
                          <SlotButton
                            key={slot.id}
                            isSelected={slot.record?.id === selectedRecordId}
                            onSelectRecord={onSelectRecord}
                            slot={slot}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlotButton({
  isSelected,
  onSelectRecord,
  slot,
}: {
  isSelected: boolean;
  onSelectRecord: (recordId: string) => void;
  slot: LayoutSlot;
}) {
  return (
    <button
      type="button"
      disabled={!slot.record}
      onClick={() => slot.record && onSelectRecord(slot.record.id)}
      className={joinClasses(
        "grid h-9 place-items-center rounded-md border text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-4",
        getSlotClassName(slot.status),
        isSelected ? getSelectedSlotClassName(slot.status) : "",
        !slot.record ? "cursor-default opacity-95" : "hover:-translate-y-0.5",
      )}
      title={slot.record?.path ?? slot.label}
    >
      {slot.label}
    </button>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={joinClasses("h-3 w-3 rounded-sm", className)} />
      {label}
    </span>
  );
}

function getFirstRecordForZone(records: WarehouseStorageListRecord[], zone: string) {
  return records.find((record) => (record.location.zone || "General") === zone);
}

function getFirstRecordForType(records: WarehouseStorageListRecord[], type: string) {
  return records.find((record) => (record.location.locationType || "").includes(type));
}

function createLayoutSlots(records: WarehouseStorageListRecord[]) {
  return [...records]
    .sort(
      (first, second) =>
        compareLocationTokens(first.location.aisle, second.location.aisle) ||
        compareLocationTokens(first.location.rackNo, second.location.rackNo) ||
        compareLocationTokens(first.location.shelfNo, second.location.shelfNo) ||
        compareLocationTokens(first.location.binNo, second.location.binNo),
    )
    .map<LayoutSlot>((record, index) => {
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
        status: getSlotStatus(record, index + 1),
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

function getSlotStatus(record: WarehouseStorageListRecord | undefined, slotNumber: number) {
  if (record?.status === "Blocked") {
    return "Blocked";
  }

  if (record?.status === "Reserved") {
    return "Reserved";
  }

  if (record?.status === "Inactive") {
    return "Maintenance";
  }

  if (record && record.itemsOnHand > 0) {
    return "Occupied";
  }

  if (slotNumber % 17 === 0) {
    return "Full";
  }

  if (slotNumber % 23 === 0) {
    return "Maintenance";
  }

  return "Active";
}

function getSlotClassName(status: LayoutSlot["status"]) {
  switch (status) {
    case "Blocked":
      return "border-slate-200 bg-slate-100 text-slate-500 focus-visible:ring-slate-500/20";
    case "Reserved":
      return "border-amber-200 bg-amber-100 text-amber-700 focus-visible:ring-amber-500/20";
    case "Occupied":
      return "border-blue-200 bg-blue-100 text-blue-700 focus-visible:ring-blue-500/20";
    case "Full":
      return "border-rose-200 bg-rose-100 text-rose-700 focus-visible:ring-rose-500/20";
    case "Maintenance":
      return "border-violet-200 bg-violet-100 text-violet-700 focus-visible:ring-violet-500/20";
    default:
      return "border-emerald-200 bg-emerald-100 text-emerald-700 focus-visible:ring-emerald-500/20";
  }
}

function getSelectedSlotClassName(status: LayoutSlot["status"]) {
  switch (status) {
    case "Blocked":
      return "border-slate-500 bg-slate-100 text-slate-700 ring-2 ring-slate-500/35";
    case "Reserved":
      return "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-500/35";
    case "Occupied":
      return "border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-500/35";
    case "Full":
      return "border-rose-500 bg-rose-100 text-rose-800 ring-2 ring-rose-500/35";
    case "Maintenance":
      return "border-violet-500 bg-violet-100 text-violet-800 ring-2 ring-violet-500/35";
    default:
      return "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/35";
  }
}
