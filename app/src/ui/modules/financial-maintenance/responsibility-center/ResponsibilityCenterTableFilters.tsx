import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { List, ListTree } from "lucide-react";
import {
  ResponsibilityCenterCategoryOptions,
  ResponsibilityCenterExportColumns,
  ResponsibilityCenterFinancialTypeOptions,
  ResponsibilityCenterStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/responsibility-center/ResponsibilityCenterConstants";
import type {
  ResponsibilityCenterStatusFilter,
  ResponsibilityCenterTableFiltersProps,
  ResponsibilityCenterViewMode,
  ResponsibilityCenter,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ResponsibilityCenterTableFilters({
  categoryFilter,
  exportAllRows,
  exportFilteredRows,
  financialTypeFilter,
  hasActiveFilters,
  isRefreshing,
  permissions,
  query,
  statusFilter,
  table,
  viewMode,
  onCategoryFilterChange,
  onFinancialTypeFilterChange,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onViewModeChange,
}: ResponsibilityCenterTableFiltersProps) {
  const exportTable = viewMode === "list" ? (table as Table<ResponsibilityCenter>) : undefined;

  return (
    <div>
      <div
        className="grid gap-2 border-b border-darknavy/10 px-3 py-3 xl:flex xl:items-end xl:justify-between xl:pb-0 xl:pt-2"
        data-spotlight-id="responsibility-center-view-switch"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:hidden">
          <ResponsiveFilterSelect
            label="Classification"
            value={financialTypeFilter}
            options={["All", ...ResponsibilityCenterFinancialTypeOptions]}
            getOptionLabel={getClassificationLabel}
            onChange={onFinancialTypeFilterChange}
          />
          <ResponsiveFilterSelect
            label="View"
            value={viewMode}
            options={["tree", "list"]}
            getOptionLabel={getViewModeLabel}
            onChange={(value) => onViewModeChange(value as ResponsibilityCenterViewMode)}
          />
        </div>

        <div className="hidden xl:block">
          <ClassificationTabs value={financialTypeFilter} onChange={onFinancialTypeFilterChange} />
        </div>

        <div className="hidden gap-2 overflow-x-auto pb-2 xl:flex">
          <ViewModeButton
            active={viewMode === "tree"}
            icon={<ListTree className="h-4 w-4" aria-hidden="true" />}
            label="Tree View"
            onClick={() => onViewModeChange("tree")}
          />
          <ViewModeButton
            active={viewMode === "list"}
            icon={<List className="h-4 w-4" aria-hidden="true" />}
            label="List View"
            onClick={() => onViewModeChange("list")}
          />
        </div>
      </div>

      <ModuleTableToolbar
        className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
        data-spotlight-id="responsibility-center-filters"
      >
        <div
          data-spotlight-id="maintenance-table-filters"
          className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,0.85fr)_minmax(7rem,0.7fr)]"
        >
          <div className="col-span-2 lg:col-span-1">
            <ModuleTableSearch
              label="Search responsibility centers"
              value={query}
              onChange={onQueryChange}
              placeholder="Search by code, name, type, parent, or status"
            />
          </div>
          <ModuleTableFilterSelect
            label="Type"
            value={categoryFilter}
            options={[
              { label: "All", value: "All" },
              ...ResponsibilityCenterCategoryOptions.map((category) => ({
                label: category,
                value: category,
              })),
            ]}
            onChange={onCategoryFilterChange}
          />
          <ModuleTableFilterSelect
            label="Status"
            value={statusFilter}
            options={[
              { label: "All", value: "" },
              ...ResponsibilityCenterStatusOptions.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => onStatusFilterChange(value as ResponsibilityCenterStatusFilter)}
          />
        </div>
        <div data-spotlight-id="maintenance-table-options" className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
          <ModuleTableColumnVisibilityButton table={table as Table<ResponsibilityCenter>} />
          {permissions.canExport ? (
            <ModuleTableExportButton
              allRows={exportAllRows}
              columns={ResponsibilityCenterExportColumns}
              fileName="responsibility-center"
              filteredRows={exportFilteredRows}
              isFiltered={hasActiveFilters}
              table={exportTable}
              title="Responsibility Centers"
            />
          ) : (
            <span aria-hidden="true" />
          )}
          <ModuleTableResetButton className="px-2" isRefreshing={isRefreshing} onClick={onRefresh}>
            <span className="sr-only">Refresh</span>
          </ModuleTableResetButton>
        </div>
      </ModuleTableToolbar>
    </div>
  );
}

function ClassificationTabs({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const options = ["All", ...ResponsibilityCenterFinancialTypeOptions];

  return (
    <div className="flex gap-0 overflow-x-auto" aria-label="Classification filter">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={joinClasses(
            "relative h-12 whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition",
            value === option ? "border-skyblue text-skyblue" : "border-transparent text-darknavy/65 hover:text-darknavy",
          )}
        >
          {getClassificationLabel(option)}
        </button>
      ))}
    </div>
  );
}

function ViewModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={joinClasses(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
        active
          ? "border-skyblue bg-skyblue/10 text-skyblue"
          : "border-darknavy/10 bg-white text-darknavy/75 hover:border-skyblue/40 hover:bg-skyblue/10",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ResponsiveFilterSelect<TValue extends string>({
  getOptionLabel,
  label,
  options,
  value,
  onChange,
}: {
  getOptionLabel: (value: TValue) => string;
  label: string;
  options: TValue[];
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className="h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function getViewModeLabel(value: ResponsibilityCenterViewMode) {
  return value === "tree" ? "Tree View" : "List View";
}

function getClassificationLabel(value: string) {
  return value === "All" ? "All Responsibility Center" : value;
}
