"use client";

import { useMemo, useState } from "react";
import { Boxes, ChevronDown, ChevronRight, Folder, MapPinned, Search } from "lucide-react";
import type { WarehouseStorageListRecord } from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { compareWarehouseStorageLocationTokens } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapUtils";

type LocationNavigatorProps = {
  onQueryChange: (value: string) => void;
  onSelectRecord: (recordId: string) => void;
  onSelectWarehouse: (warehouseId: string) => void;
  query: string;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouses: WarehouseRecord[];
};

export function WarehouseStorageLocationNavigator({
  onQueryChange,
  onSelectRecord,
  onSelectWarehouse,
  query,
  records,
  selectedRecordId,
  warehouses,
}: LocationNavigatorProps) {
  const defaultExpandedKeys = useMemo(
    () => createDefaultNavigatorKeys(records, warehouses),
    [records, warehouses],
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => defaultExpandedKeys);

  function toggleKey(key: string) {
    setExpandedKeys((current) => {
      const nextKeys = new Set(current);

      if (nextKeys.has(key)) nextKeys.delete(key);
      else nextKeys.add(key);

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
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" aria-hidden="true" />
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
            .map((warehouse) => (
              <WarehouseNavigatorNode
                key={warehouse.id}
                expandedKeys={expandedKeys}
                records={records}
                selectedRecordId={selectedRecordId}
                warehouse={warehouse}
                onSelectRecord={onSelectRecord}
                onSelectWarehouse={onSelectWarehouse}
                onToggleKey={toggleKey}
              />
            ))}
        </div>
      </div>
    </aside>
  );
}

function WarehouseNavigatorNode({
  expandedKeys,
  records,
  selectedRecordId,
  warehouse,
  onSelectRecord,
  onSelectWarehouse,
  onToggleKey,
}: {
  expandedKeys: Set<string>;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouse: WarehouseRecord;
  onSelectRecord: (recordId: string) => void;
  onSelectWarehouse: (warehouseId: string) => void;
  onToggleKey: (key: string) => void;
}) {
  const warehouseRecords = records.filter((record) => record.warehouseId === warehouse.id);
  const zones = Array.from(
    new Set(warehouseRecords.map((record) => record.location.zone || "General")),
  );
  const warehouseKey = `warehouse-${warehouse.id}`;
  const isWarehouseOpen = expandedKeys.has(warehouseKey);

  return (
    <div>
      <NavigatorRow
        depth={0}
        icon="warehouse"
        isOpen={isWarehouseOpen}
        label={`${warehouse.name} (${warehouse.code})`}
        onClick={() => onSelectWarehouse(warehouse.id)}
        onToggle={() => onToggleKey(warehouseKey)}
      />
      {isWarehouseOpen
        ? zones.map((zone) => (
            <ZoneNavigatorNode
              key={`${warehouse.id}-${zone}`}
              expandedKeys={expandedKeys}
              records={warehouseRecords}
              selectedRecordId={selectedRecordId}
              warehouseId={warehouse.id}
              zone={zone}
              zoneKey={`${warehouseKey}-zone-${zone}`}
              onSelectRecord={onSelectRecord}
              onToggleKey={onToggleKey}
            />
          ))
        : null}
    </div>
  );
}

function ZoneNavigatorNode({
  expandedKeys,
  records,
  selectedRecordId,
  warehouseId,
  zone,
  zoneKey,
  onSelectRecord,
  onToggleKey,
}: {
  expandedKeys: Set<string>;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouseId: string;
  zone: string;
  zoneKey: string;
  onSelectRecord: (recordId: string) => void;
  onToggleKey: (key: string) => void;
}) {
  const zoneRecords = records.filter((record) => (record.location.zone || "General") === zone);
  const aisles = Array.from(new Set(zoneRecords.map((record) => record.location.aisle || "Area")));
  const isZoneOpen = expandedKeys.has(zoneKey);

  return (
    <div>
      <NavigatorRow
        depth={1}
        icon="zone"
        isOpen={isZoneOpen}
        label={`Zone ${zone}`}
        onClick={() => selectFirstRecord(zoneRecords, onSelectRecord)}
        onToggle={() => onToggleKey(zoneKey)}
      />
      {isZoneOpen
        ? aisles.map((aisle) => (
            <AisleNavigatorNode
              key={`${warehouseId}-${zone}-${aisle}`}
              aisle={aisle}
              aisleKey={`${zoneKey}-aisle-${aisle}`}
              expandedKeys={expandedKeys}
              records={zoneRecords}
              selectedRecordId={selectedRecordId}
              warehouseId={warehouseId}
              zone={zone}
              onSelectRecord={onSelectRecord}
              onToggleKey={onToggleKey}
            />
          ))
        : null}
    </div>
  );
}

function AisleNavigatorNode({
  aisle,
  aisleKey,
  expandedKeys,
  records,
  selectedRecordId,
  warehouseId,
  zone,
  onSelectRecord,
  onToggleKey,
}: {
  aisle: string;
  aisleKey: string;
  expandedKeys: Set<string>;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouseId: string;
  zone: string;
  onSelectRecord: (recordId: string) => void;
  onToggleKey: (key: string) => void;
}) {
  const aisleRecords = records.filter((record) => (record.location.aisle || "Area") === aisle);
  const racks = Array.from(new Set(aisleRecords.map((record) => record.location.rackNo || "Open")));
  const isAisleOpen = expandedKeys.has(aisleKey);

  return (
    <div>
      <NavigatorRow
        depth={2}
        icon="aisle"
        isOpen={isAisleOpen}
        label={`Aisle ${aisle}`}
        onClick={() => selectFirstRecord(aisleRecords, onSelectRecord)}
        onToggle={() => onToggleKey(aisleKey)}
      />
      {isAisleOpen
        ? racks.map((rack) => (
            <RackNavigatorNode
              key={`${warehouseId}-${zone}-${aisle}-${rack}`}
              expandedKeys={expandedKeys}
              rack={rack}
              rackKey={`${aisleKey}-rack-${rack}`}
              records={aisleRecords}
              selectedRecordId={selectedRecordId}
              warehouseId={warehouseId}
              zone={zone}
              aisle={aisle}
              onSelectRecord={onSelectRecord}
              onToggleKey={onToggleKey}
            />
          ))
        : null}
    </div>
  );
}

function RackNavigatorNode({
  aisle,
  expandedKeys,
  rack,
  rackKey,
  records,
  selectedRecordId,
  warehouseId,
  zone,
  onSelectRecord,
  onToggleKey,
}: {
  aisle: string;
  expandedKeys: Set<string>;
  rack: string;
  rackKey: string;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  warehouseId: string;
  zone: string;
  onSelectRecord: (recordId: string) => void;
  onToggleKey: (key: string) => void;
}) {
  const rackRecords = records.filter((record) => (record.location.rackNo || "Open") === rack);
  const levels = Array.from(
    new Set(rackRecords.map((record) => record.location.shelfNo || "Open")),
  ).sort(compareWarehouseStorageLocationTokens);
  const isRackOpen = expandedKeys.has(rackKey);

  return (
    <div>
      <NavigatorRow
        depth={3}
        icon="rack"
        isOpen={isRackOpen}
        label={`Rack ${rack}`}
        onClick={() => selectFirstRecord(rackRecords, onSelectRecord)}
        onToggle={() => onToggleKey(rackKey)}
      />
      {isRackOpen
        ? levels.map((level) => (
            <LevelNavigatorNode
              key={`${warehouseId}-${zone}-${aisle}-${rack}-${level}`}
              level={level}
              levelKey={`${rackKey}-level-${level}`}
              records={rackRecords}
              selectedRecordId={selectedRecordId}
              isOpen={expandedKeys.has(`${rackKey}-level-${level}`)}
              onSelectRecord={onSelectRecord}
              onToggleKey={onToggleKey}
            />
          ))
        : null}
    </div>
  );
}

function LevelNavigatorNode({
  isOpen,
  level,
  levelKey,
  records,
  selectedRecordId,
  onSelectRecord,
  onToggleKey,
}: {
  isOpen: boolean;
  level: string;
  levelKey: string;
  records: WarehouseStorageListRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
  onToggleKey: (key: string) => void;
}) {
  const levelRecords = records
    .filter((record) => (record.location.shelfNo || "Open") === level)
    .sort((first, second) =>
      compareWarehouseStorageLocationTokens(first.location.binNo, second.location.binNo),
    );

  return (
    <div>
      <NavigatorRow
        depth={4}
        icon="level"
        isOpen={isOpen}
        label={`Level ${level}`}
        onClick={() => selectFirstRecord(levelRecords, onSelectRecord)}
        onToggle={() => onToggleKey(levelKey)}
      />
      {isOpen
        ? levelRecords
            .slice(0, 8)
            .map((record) => (
              <NavigatorLeafRow
                key={record.id}
                depth={5}
                isSelected={selectedRecordId === record.id}
                label={record.location.locationName || record.location.locationCode}
                onClick={() => onSelectRecord(record.id)}
              />
            ))
        : null}
    </div>
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
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
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

function NavigatorLeafRow({ depth, isSelected, label, onClick }: {
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

function createDefaultNavigatorKeys(records: WarehouseStorageListRecord[], warehouses: WarehouseRecord[]) {
  const keys = new Set<string>();

  warehouses
    .filter((warehouse) => records.some((record) => record.warehouseId === warehouse.id))
    .forEach((warehouse) => {
      const warehouseRecords = records.filter((record) => record.warehouseId === warehouse.id);
      const warehouseKey = `warehouse-${warehouse.id}`;

      keys.add(warehouseKey);
      Array.from(
        new Set(warehouseRecords.map((record) => record.location.zone || "General")),
      ).forEach((zone) => addZoneNavigatorKeys(keys, warehouseKey, warehouseRecords, zone));
    });

  return keys;
}

function addZoneNavigatorKeys(
  keys: Set<string>,
  warehouseKey: string,
  warehouseRecords: WarehouseStorageListRecord[],
  zone: string,
) {
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
      Array.from(new Set(aisleRecords.map((record) => record.location.rackNo || "Open"))).forEach(
        (rack) => {
          const rackRecords = aisleRecords.filter(
            (record) => (record.location.rackNo || "Open") === rack,
          );
          const rackKey = `${aisleKey}-rack-${rack}`;

          keys.add(rackKey);
          Array.from(
            new Set(rackRecords.map((record) => record.location.shelfNo || "Open")),
          ).forEach((level) => keys.add(`${rackKey}-level-${level}`));
        },
      );
    },
  );
}

function selectFirstRecord(records: WarehouseStorageListRecord[], onSelectRecord: (recordId: string) => void) {
  const firstRecord = records[0];

  if (firstRecord) {
    onSelectRecord(firstRecord.id);
  }
}
