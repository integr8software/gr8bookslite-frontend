"use client";

import { CheckCircle2, CirclePause, ListChecks, Plus, Tags } from "lucide-react";
import {
  ItemVariationsExportColumns,
  ItemVariationsDescription,
  ItemVariationsTitle,
} from "@/app/src/constants/modules/maintenance/item-variations/ItemVariationsConstants";
import { useItemVariationsListPage } from "@/app/src/hooks/modules/maintenance/item-variations/useItemVariationsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemVariationsDrawer } from "@/app/src/ui/modules/maintenance/item-variations/ItemVariationsDrawer";
import { ItemVariationsTable } from "@/app/src/ui/modules/maintenance/item-variations/ItemVariationsTable";

export function ItemVariationsListPage() {
  const page = useItemVariationsListPage();
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== "Active";

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={ItemVariationsTitle}
        description={ItemVariationsDescription}
        eyebrow={
          <>
            <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
            Maintenance
          </>
        }
        actions={
          page.permissions.canCreate ? (
            <button
              type="button"
              className={moduleHeaderActionClassNames.primary}
              onClick={page.openAddDrawer}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Variation
            </button>
          ) : null
        }
      />
      <ModuleStatisticCards
        items={[
          {
            helper: "Setup records",
            icon: ListChecks,
            label: "Total Records",
            value: page.statistics.totalVariations,
          },
          {
            helper: "Available for selection",
            icon: CheckCircle2,
            label: "Active",
            tone: "emerald",
            value: page.activeCount,
          },
          {
            helper: "Kept for history",
            icon: CirclePause,
            label: "Inactive",
            tone: "amber",
            value: page.inactiveCount,
          },
          {
            helper: "Configured values",
            icon: Tags,
            label: "Values",
            tone: "violet",
            value: page.statistics.totalValues,
          },
        ]}
        className="xl:grid-cols-4"
      />
      <ItemVariationsTable
        emptyDescription={
          page.isLoadError
            ? (page.loadErrorMessage ??
              "The item variations service is not responding. Try refreshing the table.")
            : undefined
        }
        emptyTitle={page.isLoadError ? "Could not load item variations" : undefined}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        table={page.table}
        toolbar={
          <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)]">
              <ModuleTableSearch
                label="Search Item Variations"
                placeholder="Search variations"
                value={page.query}
                onChange={page.setQuery}
              />
              <ModuleTableFilterSelect
                label="Status"
                value={page.statusFilter}
                options={[
                  { label: "All", value: "All" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                onChange={page.setStatusFilter}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
              <ModuleTableColumnVisibilityButton table={page.table} />
              {page.permissions.canExport ? (
                <ModuleTableExportButton
                  allRows={page.records}
                  columns={ItemVariationsExportColumns}
                  fileName="item-variations"
                  filteredRows={page.filteredRecords}
                  isFiltered={hasActiveFilters}
                  table={page.table}
                  title="Item Variations"
                />
              ) : (
                <span aria-hidden="true" />
              )}
              <ModuleTableResetButton
                className="px-2"
                onClick={() => {
                  page.setQuery("");
                  page.setStatusFilter("Active");
                  page.refreshRecords();
                }}
              >
                <span className="sr-only">Reset filters</span>
              </ModuleTableResetButton>
            </div>
          </ModuleTableToolbar>
        }
        onEdit={page.openEditDrawer}
        onToggleStatus={page.setPendingStatusRecord}
        onView={page.openViewDrawer}
      />
      <ItemVariationsDrawer
        key={`${page.drawer?.mode ?? "closed"}-${page.drawer?.record?.id ?? "new"}`}
        drawer={page.drawer}
        records={page.records}
        onClose={page.closeDrawer}
        onSave={page.saveRecord}
      />
      <AppDialog
        isOpen={Boolean(page.pendingStatusRecord)}
        title={
          page.pendingStatusRecord?.status === "Active"
            ? "Deactivate item variation?"
            : "Activate item variation?"
        }
        description={
          page.pendingStatusRecord?.status === "Active"
            ? `${page.pendingStatusRecord.name} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusRecord?.name ?? "This item variation"} will be available for normal selection again.`
        }
        confirmLabel={page.pendingStatusRecord?.status === "Active" ? "Deactivate" : "Activate"}
        isPending={page.isMutating}
        tone={page.pendingStatusRecord?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusRecord(null)}
        onConfirm={page.confirmStatusChange}
      />
    </section>
  );
}
