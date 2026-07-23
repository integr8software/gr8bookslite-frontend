"use client";

import { useCallback, useState } from "react";
import { useTaxMaintenanceListPage } from "@/app/src/hooks/modules/financial-maintenance/tax-maintenance/useTaxMaintenanceListPage";
import type {
  TaxMaintenance,
  TaxMaintenanceDrawerState,
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TaxMaintenanceDrawer } from "@/app/src/ui/modules/financial-maintenance/tax-maintenance/TaxMaintenanceDrawer";
import { TaxMaintenanceHeader } from "@/app/src/ui/modules/financial-maintenance/tax-maintenance/TaxMaintenanceHeader";
import { TaxMaintenanceStatisticCards } from "@/app/src/ui/modules/financial-maintenance/tax-maintenance/TaxMaintenanceStatisticCards";
import { TaxMaintenanceTable } from "@/app/src/ui/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTable";

export function TaxMaintenanceListPage() {
  const page = useTaxMaintenanceListPage();
  const [drawerState, setDrawerState] =
    useState<TaxMaintenanceDrawerState>(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const closeDrawer = useCallback(() => setDrawerState(null), []);
  const openAddDrawer = useCallback(() => {
    setDrawerVersion((version) => version + 1);
    setDrawerState({ mode: "add" });
  }, []);
  const hasActiveFilters =
    page.query.trim().length > 0 || page.statusFilter !== "Active";

  async function handleSave(values: TaxMaintenance | TaxMaintenanceFormValues) {
    if ("id" in values) {
      await page.updateTax(values);
    } else {
      await page.addTax(values);
    }
    closeDrawer();
  }

  return (
    <section className="grid gap-5">
      <TaxMaintenanceHeader
        onAdd={openAddDrawer}
        permissions={page.permissions}
      />
      <TaxMaintenanceStatisticCards
        statistics={page.statistics}
        taxes={page.taxes}
        isLoading={page.isLoading}
      />
      <TaxMaintenanceTable
        filteredTaxes={page.filteredTaxes}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        query={page.query}
        statusFilter={page.statusFilter}
        taxes={page.taxes}
        onEditTax={(tax) => setDrawerState({ mode: "edit", tax })}
        onQueryChange={page.setQuery}
        onRefresh={page.refresh}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusTax}
        onViewTax={(tax) => setDrawerState({ mode: "view", tax })}
      />
      <TaxMaintenanceDrawer
        key={`${drawerState?.mode ?? "closed"}-${drawerState?.tax?.id ?? "new"}-${drawerVersion}-${page.accountOptions.length}-${Object.values(page.defaultAccountIds).join(":")}`}
        accountOptions={page.accountOptions}
        defaultAccountIds={page.defaultAccountIds}
        isOpen={Boolean(drawerState)}
        isSaving={page.isMutating}
        mode={drawerState?.mode ?? "add"}
        tax={drawerState?.tax}
        onAccountOptionsChanged={page.refresh}
        onClose={closeDrawer}
        onSave={handleSave}
      />
      <AppDialog
        isOpen={Boolean(page.pendingStatusTax)}
        isPending={page.isMutating}
        title={
          page.pendingStatusTax?.status === "Active"
            ? "Deactivate tax type?"
            : "Activate tax type?"
        }
        description={
          page.pendingStatusTax?.status === "Active"
            ? `${page.pendingStatusTax.name} will remain in existing records, but will no longer be active for normal selection.`
            : `${page.pendingStatusTax?.name ?? "This tax type"} will be available for normal selection again.`
        }
        confirmLabel={
          page.pendingStatusTax?.status === "Active" ? "Deactivate" : "Activate"
        }
        tone={page.pendingStatusTax?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusTax(null)}
        onConfirm={page.confirmTaxStatusChange}
      />
    </section>
  );
}
