import { PettyCashFundStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundOverviewPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function PettyCashFundListFilters({ page }: { page: PettyCashFundOverviewPageState }) {
  return (
    <ModuleTableToolbar
      className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none xl:!grid-cols-[minmax(0,1fr)_auto]"
      data-spotlight-id="maintenance-table-filters"
    >
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
        <ModuleTableSearch
          label="Search petty cash funds"
          value={page.query}
          onChange={page.setQuery}
          placeholder="Search Fund Number, Custodian, Or Account"
        />
        <DateRangePicker label="Date Range" value={page.dateRange} onChange={page.setDateRange} />
        <AmountRangePicker label="Amount Range" value={page.amountRange} onChange={page.setAmountRange} />
        <ModuleTableFilterSelect
          label="Status"
          value={page.statusFilter}
          options={PettyCashFundStatusOptions.map((status) => ({ label: status, value: status }))}
          onChange={page.setStatusFilter}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 xl:w-[7rem]" data-spotlight-id="maintenance-table-options">
        <ModuleTableColumnVisibilityButton table={page.table} />
        <ModuleTableResetButton className="px-2" onClick={page.resetFilters} />
      </div>
    </ModuleTableToolbar>
  );
}
