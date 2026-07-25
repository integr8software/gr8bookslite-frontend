"use client";

import { useState } from "react";
import {
  ChevronDown,
  Edit3,
  Eye,
  Plus,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { WarehouseStockCountPaginationStorageKey } from "@/app/src/constants/modules/warehouse-management/stock-count/WarehouseStockCountConstants";
import { useWarehouseStockCountListPage } from "@/app/src/hooks/modules/warehouse-management/stock-count/useWarehouseStockCountListPage";
import type {
  WarehouseStockCountColumn,
  WarehouseStockCountModule,
  WarehouseStockCountRecord,
} from "@/app/src/types/modules/warehouse-management/stock-count/WarehouseStockCountTypes";
import { validateWarehouseStockCountDraft } from "@/app/src/validations/modules/warehouse-management/stock-count/WarehouseStockCountValidation";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ComposerState = "new" | WarehouseStockCountRecord | null;

export function WarehouseStockCountListPage() {
  const featureModule = "stock-count" as WarehouseStockCountModule;
  const page = useWarehouseStockCountListPage(featureModule);
  const [composerState, setComposerState] = useState<ComposerState>(null);
  const selectedWarehouseName =
    page.warehouses.find((warehouse) => warehouse.id === page.warehouseFilter)?.name ??
    "All accessible warehouses";

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        eyebrow={page.config.group}
        title={page.config.title}
        description={page.config.description}
        actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
        actions={
          <>
            {page.config.primaryAction && page.permissions.canCreate ? (
              <button
                type="button"
                className={moduleHeaderActionClassNames.primary}
                onClick={() => setComposerState("new")}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {page.config.primaryAction}
              </button>
            ) : null}
          </>
        }
      />
      <WarehouseScopeNavigation
        allowAllWarehouses={page.config.warehouseMode === "all-or-one"}
        warehouses={page.warehouses}
        value={page.warehouseFilter}
        onChange={page.setWarehouseFilter}
      />

      {page.error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-coralpink/25 bg-coralpink/5 p-4 text-sm text-darknavy"
        >
          <div>
            <p className="font-semibold">Warehouse mock data could not be refreshed.</p>
            <p className="mt-1 text-darknavy/65">
              {page.error instanceof Error ? page.error.message : "Please refresh and try again."}
            </p>
          </div>
          <button
            type="button"
            className={moduleHeaderActionClassNames.secondary}
            onClick={page.refreshRecords}
          >
            Retry
          </button>
        </div>
      ) : null}

      {composerState ? (
        <WorkspaceComposer
          actionLabel={
            composerState === "new"
              ? (page.config.primaryAction ?? "Create Record")
              : `Edit ${page.config.title}`
          }
          columns={page.config.columns
            .filter((column) => !["actions", "status"].includes(column.id))
            .slice(0, 6)}
          initialRecord={composerState === "new" ? undefined : composerState}
          isPending={page.isMutating}
          module={featureModule}
          warehouseId={
            page.warehouseFilter === "All"
              ? (page.warehouses[0]?.id ?? "wh-main")
              : page.warehouseFilter
          }
          warehouseName={selectedWarehouseName}
          onClose={() => setComposerState(null)}
          onSave={async (record) => {
            await page.saveRecord(record);
            toast.success(`${page.config.title} ${record.id ? "updated" : "created"}.`);
            setComposerState(null);
          }}
        />
      ) : null}
      <WorkspaceTable
          module={featureModule}
          page={page}
          onEditRecord={(record) => setComposerState(record)}
        />
    </section>
  );
}

function WarehouseScopeNavigation({
  allowAllWarehouses,
  onChange,
  value,
  warehouses,
}: {
  allowAllWarehouses: boolean;
  onChange: (warehouseId: string) => void;
  value: string;
  warehouses: ReadonlyArray<{ code: string; id: string; name: string }>;
}) {
  return (
    <nav
      aria-label="Warehouse navigation"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-darknavy/10 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-skyblue/10 text-skyblue">
          <Warehouse className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-darknavy/45">
            Warehouse navigation
          </p>
          <p className="mt-0.5 text-sm text-darknavy/60">
            Choose the warehouse context for this screen.
          </p>
        </div>
      </div>
      <label className="relative min-w-64">
        <span className="sr-only">Selected warehouse</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-darknavy/15 bg-white pl-3 pr-9 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
        >
          {allowAllWarehouses ? <option value="All">All Warehouses</option> : null}
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} ({warehouse.code})
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-darknavy/45"
          aria-hidden="true"
        />
      </label>
    </nav>
  );
}

function WorkspaceTable({
  module,
  onEditRecord,
  page,
}: {
  module: WarehouseStockCountModule;
  onEditRecord: (record: WarehouseStockCountRecord) => void;
  page: ReturnType<typeof useWarehouseStockCountListPage>;
}) {
  const hasActiveFilters =
    page.query.length > 0 ||
    page.statusFilter !== "All" ||
    page.warehouseFilter !== (page.config.warehouseMode === "one" ? "wh-main" : "All");
  const exportColumns = page.config.columns
    .filter((column) => column.id !== "actions")
    .map((column) => ({
      header: column.label,
      id: column.id,
      value: (record: WarehouseStockCountRecord) =>
        column.id === "status" ? record.status : (record.cells[column.id] ?? ""),
    }));
  const showDetails = !["capacity-storage-rules"].includes(module);

  return (
    <div
      className={joinClasses("grid gap-4", showDetails ? "xl:grid-cols-[minmax(0,1fr)_20rem]" : "")}
    >
      <ModuleTable
        emptyDescription={page.config.emptyDescription}
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle={`No ${page.config.title} Found`}
        isLoading={page.isLoading}
        isSyncing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        minWidthClassName="min-w-[72rem]"
        paginationStorageKey={`${WarehouseStockCountPaginationStorageKey}:${module}`}
        table={page.table}
        tableTitle={page.config.title}
        toolbar={
          <ModuleTableToolbar className="!grid-cols-1 !gap-2 !p-3 lg:!grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              <ModuleTableSearch
                label={`Search ${page.config.title}`}
                placeholder={page.config.searchPlaceholder}
                value={page.query}
                onChange={page.setQuery}
              />
              <ModuleTableFilterSelect
                label="Status"
                value={page.statusFilter}
                options={[
                  { label: "All Statuses", value: "All" },
                  ...page.statuses.map((status) => ({
                    label: status,
                    value: status,
                  })),
                ]}
                onChange={page.setStatusFilter}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 lg:w-44">
              <ModuleTableColumnVisibilityButton table={page.table} />
              {page.permissions.canExport ? (
                <ModuleTableExportButton
                  allRows={page.records}
                  columns={exportColumns}
                  fileName={module}
                  filteredRows={page.filteredRecords}
                  isFiltered={hasActiveFilters}
                  table={page.table}
                  title={page.config.title}
                />
              ) : (
                <span />
              )}
              <ModuleTableResetButton
                aria-label={hasActiveFilters ? "Clear filters" : "Refresh records"}
                isRefreshing={page.isRefreshing}
                onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
              />
            </div>
          </ModuleTableToolbar>
        }
        renderRow={(row) => (
          <tr
            className={joinClasses(
              "module-table-row",
              page.selectedRecord?.id === row.original.id ? "bg-skyblue/5" : "",
            )}
            key={row.id}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`px-4 py-3.5 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
              >
                {cell.column.id === "status" ? (
                  <ModuleStatusBadge status={row.original.status} />
                ) : cell.column.id === "actions" ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => page.setSelectedRecordId(row.original.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-skyblue hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      View
                    </button>
                    {page.permissions.canUpdate && !page.config.readOnly ? (
                      <button
                        type="button"
                        aria-label={`Edit ${page.config.title} record`}
                        onClick={() => onEditRecord(row.original)}
                        className="text-darknavy/45 hover:text-skyblue"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  String(cell.getValue() || "â€”")
                )}
              </td>
            ))}
          </tr>
        )}
      />
      {showDetails ? (
        <WorkspaceDetails
          canEdit={page.permissions.canUpdate && !page.config.readOnly}
          record={page.selectedRecord}
          title={page.config.title}
          onClose={() => page.setSelectedRecordId(null)}
          onEdit={() => page.selectedRecord && onEditRecord(page.selectedRecord)}
        />
      ) : null}
    </div>
  );
}

function WorkspaceDetails({
  canEdit,
  onClose,
  onEdit,
  record,
  title,
}: {
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  record: WarehouseStockCountRecord | null;
  title: string;
}) {
  return (
    <aside className="h-fit rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm xl:sticky xl:top-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-darknavy/40">
            Record details
          </p>
          <h2 className="mt-1 text-base font-semibold text-darknavy">
            {record ? title : "Select a record"}
          </h2>
        </div>
        {record ? (
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="rounded-md p-1 text-darknavy/40 hover:bg-offwhite hover:text-darknavy"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {record ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-md bg-offwhite p-3">
            <p className="text-xs font-medium text-darknavy/50">Warehouse</p>
            <p className="mt-1 text-sm font-semibold text-darknavy">{record.warehouseName}</p>
          </div>
          {Object.entries(record.cells)
            .filter(([key]) => key !== "status")
            .map(([key, value]) => (
              <div key={key} className="border-b border-darknavy/8 pb-3 last:border-0">
                <p className="text-xs font-medium capitalize text-darknavy/45">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="mt-1 text-sm font-medium text-darknavy">{value || "â€”"}</p>
              </div>
            ))}
          <div className="flex items-center justify-between gap-3">
            <ModuleStatusBadge status={record.status} />
            {canEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs font-semibold text-skyblue hover:underline"
              >
                Edit record
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-darknavy/55">
          Choose View on a row to inspect its warehouse context, status, and operational values.
        </p>
      )}
    </aside>
  );
}

function WorkspaceComposer({
  actionLabel,
  columns,
  initialRecord,
  isPending,
  module,
  onClose,
  onSave,
  warehouseId,
  warehouseName,
}: {
  actionLabel: string;
  columns: WarehouseStockCountColumn[];
  initialRecord?: WarehouseStockCountRecord;
  isPending: boolean;
  module: WarehouseStockCountModule;
  onClose: () => void;
  onSave: (record: WarehouseStockCountRecord) => Promise<unknown>;
  warehouseId: string;
  warehouseName: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialRecord?.cells ?? {});
  const [status, setStatus] = useState(initialRecord?.status ?? "Draft");
  const [error, setError] = useState("");

  async function handleSubmit() {
    const validationError = validateWarehouseStockCountDraft({
      columns,
      status,
      values,
      warehouseId,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      await onSave({
        cells: values,
        id: initialRecord?.id ?? "",
        status,
        warehouseId: initialRecord?.warehouseId ?? warehouseId,
        warehouseName: initialRecord?.warehouseName ?? warehouseName,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The record could not be saved.");
    }
  }

  return (
    <section className="rounded-lg border border-skyblue/25 bg-white p-5 shadow-sm shadow-darknavy/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-skyblue">
            {module.replaceAll("-", " ")}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-darknavy">{actionLabel}</h2>
          <p className="mt-1 text-sm text-darknavy/55">
            Warehouse: {warehouseName}. Values are saved to the local mock workspace.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close form"
          onClick={onClose}
          className="rounded-md p-2 text-darknavy/45 hover:bg-offwhite hover:text-darknavy"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, index) => (
          <label key={column.id} className="grid gap-1.5 text-sm font-semibold text-darknavy">            <span>
              {column.label}
              {index < 2 ? <span className="text-coralpink"> *</span> : null}
            </span>
            <input
              value={values[column.id] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [column.id]: event.target.value,
                }))
              }
              className="h-11 rounded-md border border-darknavy/15 px-3 font-normal outline-none focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
              placeholder={`Enter ${column.label.toLowerCase()}`}
            />
          </label>
        ))}
        <label className="grid gap-1.5 text-sm font-semibold text-darknavy">
          Status <span className="text-coralpink">*</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-md border border-darknavy/15 bg-white px-3 font-normal outline-none focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
          >
            {getComposerStatuses(module).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={moduleHeaderActionClassNames.secondary}>
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit}
          className={moduleHeaderActionClassNames.primary}
        >
          {isPending ? "Saving..." : "Save Draft"}
        </button>
      </div>
    </section>
  );
}


function getComposerStatuses(module: WarehouseStockCountModule) {
  if (module === "location-availability") {
    return ["Available", "Reserved", "Blocked", "Under Maintenance", "Quality Hold", "Inactive"];
  }
  if (["location-transfer", "stock-count"].includes(module)) {
    return ["Draft", "Submitted", "Posted", "Cancelled"];
  }
  if (module === "stock-adjustment") {
    return ["Draft", "Submitted", "Approved", "Posted", "Rejected"];
  }
  if (module === "receiving-putaway") {
    return ["Expected", "Receiving", "Received", "Putaway In Progress", "Completed"];
  }
  if (module === "picking-dispatch") {
    return ["Open", "Allocated", "Picking", "Picked", "Staged", "Released"];
  }
  return ["Draft", "Active", "Inactive"];
}
