"use client";

import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import {
  PurchaseRequestHref,
  PurchaseRequestTablePaginationStorageKey,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { usePurchaseRequestListPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestListPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleTableSearch, ModuleTableToolbar } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { PurchaseRequestRecordActions } from "@/app/src/ui/modules/purchasing/purchase-request/overview/PurchaseRequestRecordActions";

export function PurchaseRequestOverviewPage() {
  const { handleQueryChange, lastSyncedAt, query, table } = usePurchaseRequestListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Purchase Request"
        description="Prepare purchase requests, review supplier details, and preview the printable request form before approval."
        eyebrow={
          <>
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Purchasing document
          </>
        }
        actions={
          <Link href={`${PurchaseRequestHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Request
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another PR no., supplier, project, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No purchase requests found"
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[74rem]"
          paginationStorageKey={PurchaseRequestTablePaginationStorageKey}
          table={table}
          tableTitle="Purchase Requests"
          toolbar={
            <ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
              <ModuleTableSearch
                label="Search purchase requests"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by PR no., supplier, project, or status"
              />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => <PurchaseRequestRecordActions key={id} request={original} />}
        />
      </div>
    </section>
  );
}
