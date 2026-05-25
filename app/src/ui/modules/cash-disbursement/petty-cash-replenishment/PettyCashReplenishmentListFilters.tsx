import { PettyCashReplenishmentStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentListPage";
import {
	ModuleTableFilterButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

type PettyCashReplenishmentListPageState = ReturnType<
	typeof usePettyCashReplenishmentListPage
>;

export function PettyCashReplenishmentListFilters({
	page,
}: {
	page: PettyCashReplenishmentListPageState;
}) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
			<ModuleTableSearch
				label="Search petty cash replenishments"
				value={page.searchQuery}
				onChange={page.setSearchQuery}
				placeholder="Search replenishment number, VCE code, or VCE name"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={page.statusFilter}
				options={PettyCashReplenishmentStatusOptions.map((status) => ({
					label: status === "All" ? "All statuses" : status,
					value: status,
				}))}
				onChange={page.setStatusFilter}
			/>
			<ModuleTableFilterButton />
		</ModuleTableToolbar>
	);
}
