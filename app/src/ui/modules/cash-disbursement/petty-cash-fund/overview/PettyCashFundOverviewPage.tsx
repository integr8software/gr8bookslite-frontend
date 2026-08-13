"use client";

import Link from "next/link";
import { Home, Plus, Search } from "lucide-react";
import {
  PettyCashFundHref,
  PettyCashFundPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { usePettyCashFundOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { PettyCashFundListFilters } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/overview/PettyCashFundListFilters";
import { PettyCashFundTableRow } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/overview/PettyCashFundTableRow";

export function PettyCashFundOverviewPage() {
  const page = usePettyCashFundOverviewPage();
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Petty Cash Fund"
        titleAs="h1"
        description="Manage fund custodians, balances, detailed transactions, and accounting entries."
        eyebrow={
          <>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={`${PettyCashFundHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Petty Cash Fund
          </Link>
        }
      />
      <ModuleStatisticCards className="2xl:grid-cols-4" isLoading={page.isLoading} items={page.statisticCards} />
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or add a petty cash fund record."
          emptyTitle="No petty cash funds found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="funds"
          paginationStorageKey={PettyCashFundPaginationStorageKey}
          table={page.table}
          tableTitle="Petty cash funds"
          toolbar={<PettyCashFundListFilters page={page} />}
          renderRow={(row) => <PettyCashFundTableRow key={row.id} row={row} onUpdateStatus={page.updateStatus} />}
        />
      </div>
    </section>
  );
}
