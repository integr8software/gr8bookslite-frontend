import { CashVoucherStatusFilterOptions } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type { CashVoucherPreviewTableState } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleTableColumnVisibilityButton, ModuleTableFilterSelect, ModuleTableResetButton, ModuleTableSearch, ModuleTableToolbar } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function CashVoucherTableToolbar({
  onRefresh,
  previewTable,
}: {
  onRefresh: () => void;
  previewTable: CashVoucherPreviewTableState;
}) {
  return (
    <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 2xl:!grid-cols-[minmax(0,1fr)_auto]" data-spotlight-id="maintenance-table-filters">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
        <div className="sm:col-span-2 2xl:col-span-1">
          <ModuleTableSearch label="Search cash vouchers" value={previewTable.query} onChange={previewTable.setQuery} placeholder="Search by Voucher No., Payee, or Remarks" />
        </div>
        <DateRangePicker label="Date Range" value={previewTable.dateRange} onChange={previewTable.setDateRange} />
        <AmountRangePicker label="Total Amount" value={previewTable.amountRange} onChange={previewTable.setAmountRange} />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 md:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] 2xl:w-[21.5rem]" data-spotlight-id="maintenance-table-options">
        <ModuleTableFilterSelect label="Status" value={previewTable.statusFilter} options={CashVoucherStatusFilterOptions} onChange={(value) => previewTable.setStatusFilter(value as (typeof previewTable.statusOptions)[number])} />
        <ModuleTableColumnVisibilityButton table={previewTable.table} />
        <ModuleTableResetButton className="px-2" onClick={onRefresh} />
      </div>
    </ModuleTableToolbar>
  );
}
