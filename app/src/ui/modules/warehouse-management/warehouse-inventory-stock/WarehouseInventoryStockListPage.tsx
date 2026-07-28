"use client";

import { ArrowDownLeft, ArrowUpRight, Boxes, History, MapPin, Search } from "lucide-react";
import {
  WarehouseInventoryStockActionLabel,
  WarehouseInventoryStockDescription,
  WarehouseInventoryStockTitle,
} from "@/app/src/constants/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockConstants";
import { useWarehouseInventoryStockListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-inventory-stock/useWarehouseInventoryStockListPage";
import type { WarehouseInventoryStockMovement } from "@/app/src/types/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseInventoryStockTable } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockTable";
import { WarehouseInventoryStockScopeSwitcher } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockScopeSwitcher";

export function WarehouseInventoryStockListPage() {
  const page = useWarehouseInventoryStockListPage();
  const hasActiveFilters =
    page.query.trim().length > 0 ||
    page.statusFilter !== "Active" ||
    page.warehouseFilter !== "All";

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={WarehouseInventoryStockTitle}
        description={WarehouseInventoryStockDescription}
        eyebrow={
          <>
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Warehouse management
          </>
        }
        actions={
          <button
            type="button"
            className={moduleHeaderActionClassNames.primary}
            onClick={page.refreshRecords}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {WarehouseInventoryStockActionLabel}
          </button>
        }
      />
      <WarehouseInventoryStockScopeSwitcher
        value={page.warehouseFilter}
        warehouses={page.warehouses}
        onChange={page.setWarehouseFilter}
      />
      <InventoryStockSummary page={page} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <WarehouseInventoryStockTable page={page} hasActiveFilters={hasActiveFilters} />
        <StockMovementPanel movements={createMovementRows(page)} />
      </section>
    </section>
  );
}

function InventoryStockSummary({ page }: { page: ReturnType<typeof useWarehouseInventoryStockListPage> }) {
  const totals = page.filteredRecords.reduce(
    (summary, record) => {
      summary.onHand += Number(record.values[4] ?? 0);
      summary.reserved += Number(record.values[5] ?? 0);
      summary.available += Number(record.values[6] ?? 0);
      summary.locations.add(record.values[10] ?? "-");
      summary.warehouses.add(record.warehouseId);

      return summary;
    },
    {
      available: 0,
      locations: new Set<string>(),
      onHand: 0,
      reserved: 0,
      warehouses: new Set<string>(),
    },
  );

  const cards = [
    {
      icon: Boxes,
      label: "On hand",
      value: totals.onHand.toLocaleString(),
      detail: `${totals.available.toLocaleString()} available after reservations`,
    },
    {
      icon: MapPin,
      label: "Warehouse locations",
      value: totals.locations.size.toLocaleString(),
      detail: `${totals.warehouses.size.toLocaleString()} warehouse${totals.warehouses.size === 1 ? "" : "s"} in view`,
    },
    {
      icon: ArrowUpRight,
      label: "Reserved",
      value: totals.reserved.toLocaleString(),
      detail: "Committed stock awaiting pick, transfer, or dispatch",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section key={card.label} className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/10 text-skyblue">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-darknavy/45">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-darknavy">{card.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-darknavy/55">{card.detail}</p>
          </section>
        );
      })}
    </div>
  );
}

function StockMovementPanel({ movements }: { movements: WarehouseInventoryStockMovement[] }) {
  return (
    <aside className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="border-b border-darknavy/10 p-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-skyblue" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-darknavy">Stock Movement History</h2>
        </div>
        <p className="mt-1 text-xs text-darknavy/50">Latest movement rows for the selected warehouse scope.</p>
      </div>
      <div className="grid max-h-[38rem] gap-3 overflow-auto p-4">
        {movements.length > 0 ? (
          movements.map((movement) => (
            <article key={movement.id} className="rounded-md border border-darknavy/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-darknavy">{movement.item}</p>
                  <p className="mt-1 text-xs text-darknavy/45">{movement.referenceNumber} - {movement.transactionType}</p>
                </div>
                <span className="text-xs font-semibold text-darknavy/45">{movement.date}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <MovementMetric icon={ArrowDownLeft} label="In" value={movement.quantityIn} tone="in" />
                <MovementMetric icon={ArrowUpRight} label="Out" value={movement.quantityOut} tone="out" />
                <MovementMetric icon={Boxes} label="Balance" value={movement.balance} tone="balance" />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-darknavy/15 p-5 text-center text-sm text-darknavy/55">
            No stock movement history in this scope.
          </div>
        )}
      </div>
    </aside>
  );
}

function MovementMetric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Boxes;
  label: string;
  tone: "balance" | "in" | "out";
  value: number;
}) {
  const toneClassName =
    tone === "in" ? "text-emerald-600" : tone === "out" ? "text-coralpink" : "text-skyblue";

  return (
    <span className="rounded-md bg-offwhite px-2 py-1.5">
      <span className={`flex items-center gap-1 font-semibold ${toneClassName}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {value.toLocaleString()}
      </span>
      <span className="mt-0.5 block text-darknavy/45">{label}</span>
    </span>
  );
}

function createMovementRows(page: ReturnType<typeof useWarehouseInventoryStockListPage>) {
  const warehouseIds =
    page.warehouseFilter === "All" ? new Set(page.warehouses.map((warehouse) => warehouse.id)) : new Set([page.warehouseFilter]);
  const recordedMovements = page.warehouses
    .filter((warehouse) => warehouseIds.has(warehouse.id))
    .flatMap((warehouse) => warehouse.movements);

  if (recordedMovements.length > 0) {
    return recordedMovements.slice(0, 12);
  }

  return page.filteredRecords.slice(0, 8).map((record, index) => {
    const onHand = Number(record.values[4] ?? 0);
    const reserved = Number(record.values[5] ?? 0);

    return {
      balance: onHand,
      date: `2026-07-${String(20 + index).padStart(2, "0")}`,
      id: `demo-movement-${record.id}`,
      item: record.values[1] ?? "Stock item",
      quantityIn: index % 2 === 0 ? onHand : 0,
      quantityOut: index % 2 === 0 ? 0 : reserved,
      referenceNumber: index % 2 === 0 ? `RCV-${1000 + index}` : `PCK-${1000 + index}`,
      transactionType: index % 2 === 0 ? "Receiving" : "Picking",
      user: "Warehouse Team",
    };
  });
}
