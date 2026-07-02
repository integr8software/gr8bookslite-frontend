"use client";

import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { ListTree, Network } from "lucide-react";
import {
  AccountStatuses,
  AccountTypeLabels,
  AccountTypes,
  ChartsOfAccountsNavs,
  NormalBalanceLabels,
  type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  AccountStatus,
  AccountType,
  ChartAccountStructureFilter,
  FilterValue,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { Tabs } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  type ModuleTableExportColumn,
  ModuleTableResetButton,
  ModuleTableFilterSelect,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export type ChartsOfAccountsFiltersProps = {
  accountTypeFilter: FilterValue<AccountType>;
  activeTab: ChartsOfAccountsNav;
  searchQuery: string;
  statusFilter: FilterValue<AccountStatus>;
  structureFilter: ChartAccountStructureFilter;
  exportAllRows: FlattenedChartAccount[];
  exportFilteredRows: FlattenedChartAccount[];
  isRefreshing: boolean;
  permissions: {
    canExport: boolean;
  };
  table: Table<FlattenedChartAccount>;
  onAccountTypeChange: (value: FilterValue<AccountType>) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onStatusChange: (value: FilterValue<AccountStatus>) => void;
  onStructureChange: (value: ChartAccountStructureFilter) => void;
  onTabChange: (value: ChartsOfAccountsNav) => void;
};

export function ChartsOfAccountsFilters({
  accountTypeFilter,
  activeTab,
  searchQuery,
  statusFilter,
  structureFilter,
  exportAllRows,
  exportFilteredRows,
  isRefreshing,
  permissions,
  table,
  onAccountTypeChange,
  onRefresh,
  onSearchChange,
  onResetFilters,
  onStatusChange,
  onStructureChange,
  onTabChange,
}: ChartsOfAccountsFiltersProps) {
  return (
    <div>
      <div
        className="grid gap-2 border-b border-darknavy/10 px-3 py-3 xl:flex xl:items-end xl:justify-between xl:pb-0 xl:pt-2"
        data-spotlight-id="charts-of-accounts-tabs"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:hidden">
          <ResponsiveFilterSelect
            label="View"
            value={activeTab}
            options={[...ChartsOfAccountsNavs]}
            onChange={(value) => onTabChange(value as ChartsOfAccountsNav)}
          />
          <ResponsiveFilterSelect
            label="Structure"
            value={structureFilter}
            options={["All", "With Submodules", "Without Submodules"]}
            onChange={(value) =>
              onStructureChange(value as ChartAccountStructureFilter)
            }
          />
        </div>

        <div className="hidden xl:block">
          <Tabs
            value={activeTab}
            options={[...ChartsOfAccountsNavs]}
            onChange={onTabChange}
          />
        </div>

        <div className="hidden gap-2 overflow-x-auto pb-2 xl:flex">
          <StructureButton
            active={structureFilter === "With Submodules"}
            icon={<Network className="h-4 w-4" aria-hidden="true" />}
            label="With Submodules"
            onClick={() =>
              onStructureChange(
                structureFilter === "With Submodules"
                  ? "All"
                  : "With Submodules",
              )
            }
          />
          <StructureButton
            active={structureFilter === "Without Submodules"}
            icon={<ListTree className="h-4 w-4" aria-hidden="true" />}
            label="Without Submodules"
            onClick={() =>
              onStructureChange(
                structureFilter === "Without Submodules"
                  ? "All"
                  : "Without Submodules",
              )
            }
          />
        </div>
      </div>

      <ModuleTableToolbar
        className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
        data-spotlight-id="charts-of-accounts-filters"
      >
        <div
          data-spotlight-id="maintenance-table-filters"
          className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)_auto]"
        >
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <ModuleTableSearch
              label="Search accounts"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search account number or name..."
            />
          </div>
          <ModuleTableFilterSelect
            label="Account Type"
            value={accountTypeFilter}
            options={[
              { label: "All", value: "All" },
              ...AccountTypes.map((type) => ({
                label: AccountTypeLabels[type],
                value: type,
              })),
            ]}
            onChange={(value) =>
              onAccountTypeChange(value as FilterValue<AccountType>)
            }
          />
          <ModuleTableFilterSelect
            label="Status"
            value={statusFilter}
            options={[
              { label: "All", value: "All" },
              ...AccountStatuses.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) =>
              onStatusChange(value as FilterValue<AccountStatus>)
            }
          />
          <div
            data-spotlight-id="maintenance-table-options"
            className="col-span-2 grid w-full grid-cols-3 gap-2 sm:col-span-1 sm:w-[10.75rem] sm:self-end"
          >
            <ModuleTableColumnVisibilityButton table={table} />
            {permissions.canExport ? (
              <ModuleTableExportButton
                allRows={exportAllRows}
                columns={ChartsOfAccountsExportColumns}
                fileName="chart-of-accounts"
                filteredRows={exportFilteredRows}
                isFiltered={exportAllRows.length !== exportFilteredRows.length}
                table={table}
                title="Chart of Accounts"
              />
            ) : (
              <span aria-hidden="true" />
            )}
            <ModuleTableResetButton
              className="px-2"
              isRefreshing={isRefreshing}
              onClick={() => {
                onResetFilters();
                onRefresh();
              }}
            >
              <span className="sr-only">Refresh</span>
            </ModuleTableResetButton>
          </div>
        </div>
      </ModuleTableToolbar>
    </div>
  );
}

function ResponsiveFilterSelect<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: TValue[];
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className="h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const ChartsOfAccountsExportColumns: ModuleTableExportColumn<FlattenedChartAccount>[] =
  [
    { header: "Account Number", id: "accountNumber", value: (row) => row.account.accountNumber },
    { header: "Parent Account Number", id: "parentAccountNumber", value: (row) => row.parentAccountNumber },
    { header: "Parent", id: "parent", value: (row) => row.parentPath },
    { header: "Account Name", id: "accountName", value: (row) => row.account.accountName },
    { header: "Account Type", id: "accountType", value: (row) => AccountTypeLabels[row.account.accountType] },
    { header: "Statement Section", id: "statementSection", value: (row) => row.account.statementSection },
    { header: "Account Nature", id: "normalBalance", value: (row) => NormalBalanceLabels[row.account.normalBalance] },
    { header: "Description", id: "description", value: (row) => row.account.description },
    { header: "Status", id: "status", value: (row) => row.account.status },
    { header: "Posting Account", id: "isPostingAccount", value: (row) => row.account.isPostingAccount ? "Yes" : "No" },
  ];

function StructureButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: ChartAccountStructureFilter;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
        active
          ? "border-skyblue bg-skyblue/10 text-skyblue"
          : "border-darknavy/10 bg-white text-darknavy/75 hover:border-skyblue/40 hover:bg-skyblue/10",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
