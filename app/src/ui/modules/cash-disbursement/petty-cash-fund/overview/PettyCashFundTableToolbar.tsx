import { PettyCashFundStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundOverviewPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundOverviewPage";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function PettyCashFundTableToolbar({ page }: { page: PettyCashFundOverviewPageState }) {
  return (
    <ModuleTableToolbar
      className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none 2xl:!grid-cols-[minmax(0,1fr)_auto]"
      data-spotlight-id="maintenance-table-filters"
    >
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
        <div className="sm:col-span-2 2xl:col-span-1">
          <ModuleTableSearch
            label="Search petty cash funds"
            value={page.query}
            onChange={page.setQuery}
            placeholder="Search by Petty Cash Fund No., Party, or Account"
          />
        </div>
        <DateRangePicker label="Date Range" value={page.dateRange} onChange={page.setDateRange} />
        <AmountRangePicker label="Total Amount" value={page.amountRange} onChange={page.setAmountRange} />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 md:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] 2xl:w-[21.5rem]" data-spotlight-id="maintenance-table-options">
        <ModuleTableFilterSelect label="Status" value={page.statusFilter} options={PettyCashFundStatusOptions.map((status) => ({ label: status, value: status }))} onChange={page.setStatusFilter} />
        <ModuleTableColumnVisibilityButton table={page.table} />
        <ModuleTableResetButton onClick={page.refreshRecords} />
      </div>
    </ModuleTableToolbar>
  );
}
