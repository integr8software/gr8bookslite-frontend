"use client";

import { useState } from "react";
import { CollectionTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { useCollectionTypeListPage } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionTypeListPage";
import type { CollectionTypeDrawerState } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import type { CollectionTypeMaintenanceKind } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { CollectionTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeDrawer";
import { CollectionTypeHeader } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeHeader";
import { CollectionTypeImportDialog } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeImportDialog";
import { CollectionTypeStatisticCards } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeStatisticCards";
import { CollectionTypeTable } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeTable";

export function CollectionTypeListPage({
  kind = "collection",
  title = "Collection Types",
  singularTitle = "Collection Type",
  description = "Maintain collection classifications and their linked revenue Chart of Accounts records.",
}: {
  kind?: CollectionTypeMaintenanceKind;
  title?: string;
  singularTitle?: string;
  description?: string;
}) {
  const page = useCollectionTypeListPage(kind);
  const [drawerState, setDrawerState] = useState<CollectionTypeDrawerState>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== CollectionTypeStatuses.Active || page.typeFilter !== "";

  return (
    <section className="grid gap-5">
      <CollectionTypeHeader
        addLabel={`Add ${singularTitle}`}
        description={description}
        permissions={page.permissions}
        title={title}
        onAdd={() => setDrawerState({ mode: "add" })}
        onImport={() => setIsImportOpen(true)}
      />
      <CollectionTypeStatisticCards statistics={page.statistics} isLoading={page.isLoading} />
      <CollectionTypeTable
        collectionTypes={page.collectionTypes}
        filteredCollectionTypes={page.filteredCollectionTypes}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        query={page.query}
        statusFilter={page.statusFilter}
        typeFilter={page.typeFilter}
        onEditCollectionType={(selected) => setDrawerState({ mode: "edit", collectionType: selected })}
        onQueryChange={page.setQuery}
        onRefresh={page.refreshCollectionTypes}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusAccount}
        onTypeFilterChange={page.setTypeFilter}
        showTypeTabs={false}
        title={title}
        exportFileName="collection-type"
        onViewCollectionType={(selected) => setDrawerState({ mode: "view", collectionType: selected })}
      />
      <CollectionTypeDrawer
        collectionType={drawerState?.collectionType}
        isOpen={Boolean(drawerState)}
        kind={kind}
        mode={drawerState?.mode ?? "add"}
        permissions={page.permissions}
        onClose={() => setDrawerState(null)}
      />
      {page.permissions.canImport ? (
        <CollectionTypeImportDialog
          description={`Upload, validate, edit, and import ${singularTitle.toLowerCase()} records in queued batches.`}
          existingCollectionTypes={page.collectionTypes}
          importLabel={`Import ${title}`}
          isOpen={isImportOpen}
          title={`Import ${title}`}
          onClose={() => setIsImportOpen(false)}
          onImportCollectionTypes={(accounts) =>
            page.addCollectionTypes(
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
            ? `${page.pendingStatusAccount.collectionTypeName} will no longer be available for new setup selection.`
            : `${page.pendingStatusAccount?.collectionTypeName ?? `This ${singularTitle.toLowerCase()}`} will be available again.`
        }
        confirmLabel={page.pendingStatusAccount?.status === "Active" ? "Inactivate" : "Activate"}
        tone={page.pendingStatusAccount?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusAccount(null)}
        onConfirm={page.confirmStatusChange}
      />
    </section>
  );
}
