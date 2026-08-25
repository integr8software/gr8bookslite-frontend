"use client";

import { useCallback, useState } from "react";
import { usePaymentTypeListPage } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentTypeListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import type { DrawerState } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PaymentTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeDrawer";
import { PaymentTypeHeader } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeHeader";
import { PaymentTypeImportDialog } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeImportDialog";
import { PaymentTypeStatisticCards } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeStatisticCards";
import { PaymentTypeTable } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeTable";

export function PaymentTypeListPage() {
  const page = usePaymentTypeListPage();
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
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

  return (
    <section className="grid gap-5">
      <PaymentTypeHeader onAdd={openAddDrawer} onImport={() => setIsImportOpen(true)} permissions={page.permissions} />

      <PaymentTypeStatisticCards statistics={page.statistics} isLoading={page.isLoading} />

      <PaymentTypeTable
        filteredPaymentTypes={page.filteredPaymentTypes}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        paymentTypes={page.paymentTypes}
        permissions={page.permissions}
        searchTerm={page.searchTerm}
        statusFilter={page.statusFilter}
        typeFilter={page.typeFilter}
        typeFilterOptions={page.typeFilterOptions}
        onRefresh={page.refreshPaymentTypes}
        onReorder={page.reorderPaymentType}
        onSearchTermChange={page.setSearchTerm}
        onStatusFilterChange={page.setStatusFilter}
        onTypeFilterChange={page.setTypeFilter}
        onEdit={(paymentType) => setDrawerState({ mode: "edit", paymentType })}
        onToggleStatus={page.setPendingStatusPaymentType}
        onView={(paymentType) => setDrawerState({ mode: "view", paymentType })}
      />

      <PaymentTypeDrawer
        key={`${drawerState?.mode ?? "closed"}-${drawerState?.paymentType?.id ?? "new"}-${drawerVersion}`}
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        onClose={closeDrawer}
        paymentType={drawerState?.paymentType}
      />
      {page.permissions.canImport ? (
        <PaymentTypeImportDialog
          existingPaymentTypes={page.paymentTypes}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportPaymentTypes={page.addPaymentTypes}
        />
      ) : null}
      <AppDialog
        isOpen={Boolean(page.pendingStatusPaymentType)}
        isPending={page.isMutating}
        title={page.pendingStatusPaymentType?.status === "Active" ? "Set payment type inactive?" : "Reactivate payment type?"}
        description={
          page.pendingStatusPaymentType?.status === "Active"
            ? `${page.pendingStatusPaymentType.paymentType} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusPaymentType?.paymentType ?? "This payment type"} will be available for selection again.`
        }
        confirmLabel={page.pendingStatusPaymentType?.status === "Active" ? "Set Inactive" : "Reactivate"}
        tone={page.pendingStatusPaymentType?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusPaymentType(null)}
        onConfirm={page.confirmPaymentTypeStatusChange}
      />
    </section>
  );
}
