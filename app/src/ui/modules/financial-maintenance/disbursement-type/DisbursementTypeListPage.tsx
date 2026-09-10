"use client";

import { useState } from "react";
import { DisbursementTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { useDisbursementTypeListPage } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementTypeListPage";
import type { DisbursementTypeDrawerState } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import type { DisbursementTypeMaintenanceKind } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DisbursementTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeDrawer";
import { DisbursementTypeHeader } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeHeader";
import { DisbursementTypeImportDialog } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeImportDialog";
import { DisbursementTypeStatisticCards } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeStatisticCards";
import { DisbursementTypeTable } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeTable";

export function DisbursementTypeListPage({
  kind = "disbursement",
  title = "Disbursement Types",
  singularTitle = "Disbursement Type",
  description = "Maintain reusable account templates that automatically create linked Chart of Accounts records.",
}: {
  kind?: DisbursementTypeMaintenanceKind;
  title?: string;
  singularTitle?: string;
  description?: string;
}) {
  const page = useDisbursementTypeListPage(kind);
  const [drawerState, setDrawerState] = useState<DisbursementTypeDrawerState>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== DisbursementTypeStatuses.Active || page.typeFilter !== "";

  return (
    <section className="grid gap-5">
      <DisbursementTypeHeader
        addLabel={`Add ${singularTitle}`}
        description={description}
        permissions={page.permissions}
        title={title}
        onAdd={() => setDrawerState({ mode: "add" })}
        onImport={() => setIsImportOpen(true)}
      />
      <DisbursementTypeStatisticCards statistics={page.statistics} isLoading={page.isLoading} />
      <DisbursementTypeTable
        disbursementTypes={page.disbursementTypes}
        filteredDisbursementTypes={page.filteredDisbursementTypes}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        query={page.query}
        statusFilter={page.statusFilter}
        typeFilter={page.typeFilter}
        onEditDisbursementType={(selected) => setDrawerState({ mode: "edit", disbursementType: selected })}
        onQueryChange={page.setQuery}
        onRefresh={page.refreshDisbursementTypes}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusAccount}
        onTypeFilterChange={page.setTypeFilter}
        showTypeTabs={false}
        title={title}
        exportFileName="disbursement-type"
        onViewDisbursementType={(selected) => setDrawerState({ mode: "view", disbursementType: selected })}
      />
      <DisbursementTypeDrawer
        disbursementType={drawerState?.disbursementType}
        isOpen={Boolean(drawerState)}
        kind={kind}
        mode={drawerState?.mode ?? "add"}
        permissions={page.permissions}
        onClose={() => setDrawerState(null)}
      />
      {page.permissions.canImport ? (
        <DisbursementTypeImportDialog
          description={`Upload, validate, edit, and import ${singularTitle.toLowerCase()} records in queued batches.`}
          existingDisbursementTypes={page.disbursementTypes}
          importLabel={`Import ${title}`}
          isOpen={isImportOpen}
          title={`Import ${title}`}
          onClose={() => setIsImportOpen(false)}
          onImportDisbursementTypes={(accounts) =>
            page.addDisbursementTypes(
              accounts.map((account) => ({
                ...account,
                type: kind === "collection" ? "COLLECTION" : kind === "disbursement" ? "EXPENSE" : account.type,
              })),
            )
          }
        />
      ) : null}
      <AppDialog
        isOpen={Boolean(page.pendingStatusAccount)}
        isPending={page.isMutating}
        title={page.pendingStatusAccount?.status === "Active" ? `Inactivate ${singularTitle.toLowerCase()}?` : `Activate ${singularTitle.toLowerCase()}?`}
        description={
          page.pendingStatusAccount?.status === "Active"
            ? `${page.pendingStatusAccount.disbursementTypeName} will no longer be available for new setup selection.`
            : `${page.pendingStatusAccount?.disbursementTypeName ?? `This ${singularTitle.toLowerCase()}`} will be available again.`
        }
        confirmLabel={page.pendingStatusAccount?.status === "Active" ? "Inactivate" : "Activate"}
        tone={page.pendingStatusAccount?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusAccount(null)}
        onConfirm={page.confirmStatusChange}
      />
    </section>
  );
}
