import { PettyCashVoucherStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherOverviewPage";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type PettyCashVoucherOverviewPageState = ReturnType<
	typeof usePettyCashVoucherOverviewPage
>;

export function PettyCashVoucherListFilters({
	page,
}: {
	page: PettyCashVoucherOverviewPageState;
}) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]"
			data-spotlight-id="maintenance-table-filters"
		>
			<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
				<ModuleTableSearch
					label="Search petty cash vouchers"
					value={page.searchQuery}
					onChange={page.setSearchQuery}
					placeholder="Search Voucher Number, Party, Or Account Code"
				/>
				<DateRangePicker
					label="Date Range"
					value={page.dateRange}
					onChange={page.setDateRange}
				/>
				<AmountRangePicker
					label="Amount Range"
					value={page.amountRange}
					onChange={page.setAmountRange}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={page.statusFilter}
					options={PettyCashVoucherStatusOptions.map((status) => ({
						label: status,
						value: status,
					}))}
					onChange={(value) => page.setStatusFilter(value)}
				/>
			</div>
			<div
				className="grid grid-cols-2 gap-2 xl:w-[7rem]"
				data-spotlight-id="maintenance-table-options"
			>
				<ModuleTableColumnVisibilityButton table={page.table} />
				<ModuleTableResetButton className="px-2" onClick={page.resetFilters} />
			</div>
		</ModuleTableToolbar>
	);
}
