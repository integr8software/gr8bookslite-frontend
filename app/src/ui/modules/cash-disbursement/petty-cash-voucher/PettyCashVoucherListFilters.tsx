import { PettyCashVoucherStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherListPage";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type PettyCashVoucherListPageState = ReturnType<
	typeof usePettyCashVoucherListPage
>;

export function PettyCashVoucherListFilters({
	page,
}: {
	page: PettyCashVoucherListPageState;
}) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
			<ModuleTableSearch
				label="Search petty cash vouchers"
				value={page.searchQuery}
				onChange={page.setSearchQuery}
				placeholder="Search voucher number, VCE, or account code"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={page.statusFilter}
				options={PettyCashVoucherStatusOptions.map((status) => ({
					label: status,
					value: status,
				}))}
				onChange={page.setStatusFilter}
			/>
			<ModuleTableResetButton onClick={page.resetFilters} />
		</ModuleTableToolbar>
	);
}
