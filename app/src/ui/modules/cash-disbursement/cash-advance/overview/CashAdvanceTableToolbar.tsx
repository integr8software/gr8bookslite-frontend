import { CashAdvanceStatusFilterOptions } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { useCashAdvanceTable } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type CashAdvanceTableState = ReturnType<typeof useCashAdvanceTable>;

export function CashAdvanceTableToolbar({ tableState }: { tableState: CashAdvanceTableState }) {
  return (
    <ModuleTableToolbar
      className="!grid-cols-1 !gap-2 !p-3 sm:!gap-2 sm:!p-3 2xl:!grid-cols-[minmax(0,1fr)_auto]"
      data-spotlight-id="maintenance-table-filters"
    >
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
        <div className="sm:col-span-2 2xl:col-span-1">
          <ModuleTableSearch
            label="Search cash advances"
            placeholder="Search by Cash Advance No., Party Name, Account Title, or Remarks"
            value={tableState.query}
            onChange={tableState.setQuery}
          />
        </div>
        <DateRangePicker label="Date Range" value={tableState.dateRange} onChange={tableState.setDateRange} />
        <AmountRangePicker label="Total Amount" value={tableState.amountRange} onChange={tableState.setAmountRange} />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 md:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] 2xl:w-[21.5rem]" data-spotlight-id="maintenance-table-options">
        <ModuleTableFilterSelect
          label="Status"
          value={tableState.statusFilter}
          options={CashAdvanceStatusFilterOptions}
          onChange={(value) => tableState.setStatusFilter(value as Parameters<typeof tableState.setStatusFilter>[0])}
        />
        <ModuleTableColumnVisibilityButton table={tableState.table} />
        <ModuleTableResetButton className="px-2" onClick={tableState.resetFilters}>
          <span className="sr-only">Reset filters</span>
        </ModuleTableResetButton>
      </div>
    </ModuleTableToolbar>
  );
}
