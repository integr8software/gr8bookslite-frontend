import { Filter, Search } from "lucide-react";
import { PettyCashReplenishmentStatusOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentListPage";

type PettyCashReplenishmentListPageState = ReturnType<
	typeof usePettyCashReplenishmentListPage
>;

const searchIconClassName = [
	"pointer-events-none absolute left-3 top-1/2 h-4 w-4",
	"-translate-y-1/2 text-darknavy/40",
].join(" ");

const fieldClassName = [
	"h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3",
	"text-sm text-darknavy outline-none transition focus:border-skyblue",
	"focus:ring-2 focus:ring-skyblue/20",
].join(" ");

const selectClassName = [
	"h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3",
	"pr-9 text-sm font-medium text-darknavy outline-none transition",
	"focus:border-skyblue focus:ring-2 focus:ring-skyblue/20",
].join(" ");

const filterButtonClassName = [
	"inline-flex h-10 items-center justify-center gap-2 rounded-lg border",
	"border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy",
	"transition hover:bg-skyblue/10",
].join(" ");

export function PettyCashReplenishmentListFilters({
	page,
}: {
	page: PettyCashReplenishmentListPageState;
}) {
	return (
		<div className="border-b border-darknavy/10 p-4 sm:p-5">
			<div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto]">
				<div className="relative">
					<Search className={searchIconClassName} />
					<input
						type="text"
						value={page.searchQuery}
						onChange={(event) =>
							page.setSearchQuery(event.target.value)
						}
						placeholder="Search replenishment number, VCE code, or VCE name"
						className={`${fieldClassName} pl-9`}
					/>
				</div>
				<div className="grid gap-3 sm:grid-cols-[12rem_12rem] lg:justify-end">
					<select
						value={page.statusFilter}
						onChange={(event) =>
							page.setStatusFilter(event.target.value)
						}
						className={selectClassName}
					>
						{PettyCashReplenishmentStatusOptions.map((status) => (
							<option key={status} value={status}>
								{status === "All" ? "All statuses" : status}
							</option>
						))}
					</select>
					<button type="button" className={filterButtonClassName}>
						<Filter className="h-4 w-4" />
						Filter
					</button>
				</div>
			</div>
		</div>
	);
}
