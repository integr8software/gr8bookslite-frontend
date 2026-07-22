"use client";

import Link from "next/link";
import { CheckCircle2, CirclePause, Layers, Package, Plus } from "lucide-react";
import {
  ItemsHref,
  ItemsExportColumns,
  ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import { useItemsListPage } from "@/app/src/hooks/modules/maintenance/items/useItemsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableResetButton,
  ModuleTableFilterSelect,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemsTable } from "@/app/src/ui/modules/maintenance/items/ItemsTable";

export function ItemsListPage() {
  const page = useItemsListPage();
  const hasActiveFilters =
    page.query.trim().length > 0 || page.categoryFilter !== "All" || page.statusFilter !== "Active";

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Items"
        description="Maintain products, services, assets, suppliers, categories, inventory setup, and pricing."
        eyebrow={
          <>
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            Item management
          </>
        }
        actions={
          <Link href={`${ItemsHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Item
          </Link>
        }
      />

      <ModuleStatisticCards
        isLoading={page.isLoading}
        className="xl:grid-cols-4"
        items={[
          {
            helper: "All item master records",
            icon: Package,
            label: "Total Items",
            value: page.items.length,
          },
          {
            helper: "Available for use",
            icon: CheckCircle2,
            label: "Active Items",
            tone: "emerald",
            value: page.items.filter((item) => item.status === "Active").length,
          },
          {
            helper: "Currently inactive",
            icon: CirclePause,
            label: "Inactive Items",
            tone: "amber",
            value: page.items.filter((item) => item.status === "Inactive").length,
          },
          {
            helper: "Items tracked in inventory",
            icon: Layers,
            label: "Tracked Items",
            tone: "violet",
            value: page.items.filter((item) => item.trackInventory).length,
          },
        ]}
      />

      <ItemsTable
        isLoading={page.isLoading}
        lastSyncedAt={page.lastSyncedAt}
        setPendingStatusItem={page.setPendingStatusItem}
        table={page.table}
        toolbar={
          <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]">
              <ModuleTableSearch
                label="Search items"
                value={page.query}
                onChange={page.handleQueryChange}
                placeholder="Search by item, code, category, model, or status"
              />
              <ModuleTableFilterSelect
                label="Category"
                value={page.categoryFilter}
                options={[
                  { label: "All", value: "All" },
                  ...page.categoryFilterOptions.map((category) => ({
                    label: category,
                    value: category,
                  })),
                ]}
                onChange={page.setCategoryFilter}
              />
              <ModuleTableFilterSelect
                label="Status"
                value={page.statusFilter}
                options={[
                  { label: "All", value: "All" },
                  ...ItemStatusOptions.map((status) => ({
                    label: status,
                    value: status,
                  })),
                ]}
                onChange={page.setStatusFilter}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
              <ModuleTableColumnVisibilityButton table={page.table} />
              <ModuleTableExportButton
                allRows={page.items}
                columns={ItemsExportColumns}
                fileName="items"
                filteredRows={page.filteredItems}
                isFiltered={hasActiveFilters}
                table={page.table}
                title="Items"
              />
              <ModuleTableResetButton className="px-2" onClick={page.resetFilters}>
                <span className="sr-only">Reset</span>
              </ModuleTableResetButton>
            </div>
          </ModuleTableToolbar>
        }
      />

      <AppDialog
        isOpen={Boolean(page.pendingStatusItem)}
        isPending={page.isMutating}
        title={
          page.pendingStatusItem?.status === "Active" ? "Set item inactive?" : "Reactivate item?"
        }
        description={
          page.pendingStatusItem?.status === "Active"
            ? `${page.pendingStatusItem.name} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusItem?.name ?? "This item"} will be available for selection again.`
        }
        confirmLabel={page.pendingStatusItem?.status === "Active" ? "Set Inactive" : "Reactivate"}
        tone={page.pendingStatusItem?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusItem(null)}
        onConfirm={page.handleConfirmStatusChange}
      />
    </section>
  );
}
