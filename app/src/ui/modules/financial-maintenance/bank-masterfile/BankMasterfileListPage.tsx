"use client";

import { useCallback, useState } from "react";
import { useBankMasterfileListPage } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfileListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import type { BankMasterfileDrawerState } from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { BankMasterfileDrawer } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileDrawer";
import { BankMasterfileHeader } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileHeader";
import { BankMasterfileImportDialog } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileImportDialog";
import { BankMasterfileStatisticCards } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileStatisticCards";
import { BankMasterfileTable } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileTable";

export function BankMasterfileListPage() {
  const page = useBankMasterfileListPage();
  const [drawerState, setDrawerState] = useState<BankMasterfileDrawerState>(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerState(null), []);
  const openAddDrawer = useCallback(() => {
    setDrawerVersion((version) => version + 1);
    setDrawerState({ mode: "add" });
  }, []);
  useMaintenanceAddDrawerSpotlight(() => {
    if (page.permissions.canCreate) {
      openAddDrawer();
    }
  }, closeDrawer);
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== "";

  return (
    <section className="grid gap-5">
      <BankMasterfileHeader onAdd={openAddDrawer} onImport={() => setIsImportOpen(true)} permissions={page.permissions} />
      <BankMasterfileStatisticCards banks={page.banks} isLoading={page.isLoading} />

      <BankMasterfileTable
        banks={page.banks}
        filteredBanks={page.filteredBanks}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        query={page.query}
        statusFilter={page.statusFilter}
        onEditBank={(bank) => setDrawerState({ mode: "edit", bank })}
        onQueryChange={page.setQuery}
        onRefresh={page.refreshBanks}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusBank}
        onViewBank={(bank) => setDrawerState({ mode: "view", bank })}
      />
      <BankMasterfileDrawer
        key={`${drawerState?.mode ?? "closed"}-${drawerState?.bank?.id ?? "new"}-${drawerVersion}`}
        bank={drawerState?.bank}
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        onClose={closeDrawer}
      />
      {page.permissions.canImport ? (
        <BankMasterfileImportDialog
          existingBanks={page.banks}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportBanks={page.addBanks}
        />
      ) : null}
      <AppDialog
        isOpen={Boolean(page.pendingStatusBank)}
        isPending={page.isMutating}
        title={page.pendingStatusBank?.status === "Active" ? "Inactivate bank?" : "Activate bank?"}
        description={
          page.pendingStatusBank?.status === "Active"
            ? `${page.pendingStatusBank.bankName} will remain in history, but will no longer be active for new transactions.`
            : `${page.pendingStatusBank?.bankName ?? "This bank"} will be available for transactions again.`
        }
        confirmLabel={page.pendingStatusBank?.status === "Active" ? "Inactivate" : "Activate"}
        tone={page.pendingStatusBank?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusBank(null)}
        onConfirm={page.confirmBankStatusChange}
      />
    </section>
  );
}
