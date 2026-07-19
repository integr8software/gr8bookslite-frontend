"use client";

import Link from "next/link";
import { ArrowLeft, Package, ShieldCheck } from "lucide-react";
import { createWarehouseAccessHref } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { useWarehouseItemsPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseItemsPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseItemsTable } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseItemsTable";
import { WarehouseNotFound } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseNotFound";

export function WarehouseItemsPage() {
  const page = useWarehouseItemsPage();

  if (!page.warehouse) {
    return <WarehouseNotFound />;
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={`${page.warehouse.name} Items`}
        description="Review the list of items currently assigned to this warehouse."
        eyebrow={
          <>
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            Warehouse management
          </>
        }
        actions={
          <>
            <Link href={page.warehouseHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <Link href={createWarehouseAccessHref(page.warehouse.id)} className={moduleHeaderActionClassNames.secondary}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Access
            </Link>
          </>
        }
      />

      <WarehouseItemsTable warehouse={page.warehouse} />
    </section>
  );
}
