"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { WarehouseStorageHref } from "@/app/src/constants/modules/warehouse-management/warehouse-storage/WarehouseStorageConstants";
import { useWarehouseStorageListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-storage/useWarehouseStorageListPage";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseStorageMapView } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapView";

export function WarehouseStorageFullMapPage() {
  const searchParams = useSearchParams();
  const page = useWarehouseStorageListPage({
    initialWarehouseFilter: searchParams.get("warehouseId") ?? "All",
  });

  return (
    <section className="grid min-h-[calc(100vh-7rem)] gap-3">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-skyblue">
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            Warehouse Storage
          </p>
          <h1 className="mt-1 text-2xl font-bold text-darknavy">Full Location Map</h1>
        </div>
        <Link href={WarehouseStorageHref} className={moduleHeaderActionClassNames.secondary}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
      </header>
      <WarehouseStorageMapView
        isFullView
        isLoading={page.isLoading}
        query={page.query}
        records={page.filteredListRecords}
        selectedRecordId={page.selectedRecord?.id ?? null}
        statusFilter={page.statusFilter}
        statuses={page.statuses}
        warehouseFilter={page.warehouseFilter}
        warehouses={page.warehouses}
        onQueryChange={page.setQuery}
        onSelectRecord={page.setSelectedRecordId}
        onStatusFilterChange={page.setStatusFilter}
        onWarehouseFilterChange={page.setWarehouseFilter}
      />
    </section>
  );
}
