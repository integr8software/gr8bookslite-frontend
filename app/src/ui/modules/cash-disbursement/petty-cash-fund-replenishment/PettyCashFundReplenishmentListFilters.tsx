import { PettyCashFundReplenishmentStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { usePettyCashFundReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentListPage";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type PettyCashFundReplenishmentListPageState = ReturnType<
	typeof usePettyCashFundReplenishmentListPage
>;

export function PettyCashFundReplenishmentListFilters({
	page,
}: {
	page: PettyCashFundReplenishmentListPageState;
}) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
			<ModuleTableSearch
				label="Search petty cash fund replenishments"
				value={page.searchQuery}
				onChange={page.setSearchQuery}
				placeholder="Search replenishment number, VCE code, or VCE name"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={page.statusFilter}
				options={PettyCashFundReplenishmentStatusOptions.map((status) => ({
					label: status,
					value: status,
				}))}
				onChange={page.setStatusFilter}
			/>
			<ModuleTableResetButton onClick={page.resetFilters} />
		</ModuleTableToolbar>
	);
}
