"use client";

import { BadgeDollarSign, CheckCircle2, CirclePause, Plus, Search } from "lucide-react";
import {
	PriceListsDescription,
	PriceListsPaginationStorageKey,
	PriceListsTitle,
} from "@/app/src/constants/modules/maintenance/price-lists/PriceListsConstants";
import { usePriceListsListPage } from "@/app/src/hooks/modules/maintenance/price-lists/usePriceListsListPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { PriceListsDrawer } from "@/app/src/ui/modules/maintenance/price-lists/PriceListsDrawer";
import { PriceListsTableRow } from "@/app/src/ui/modules/maintenance/price-lists/PriceListsTableRow";

export function PriceListsListPage() {
	const page = usePriceListsListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={PriceListsTitle}
				description={PriceListsDescription}
				eyebrow={
					<>
						<BadgeDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
						Maintenance
					</>
				}
				actions={
					<button
						type="button"
						className={moduleHeaderActionClassNames.primary}
						onClick={page.openAddDrawer}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Price List
					</button>
				}
			/>
			<ModuleStatisticCards
				items={[
					{
						helper: "Setup records",
						icon: BadgeDollarSign,
						label: "Total Records",
						value: page.records.length,
					},
					{
						helper: "Available for selection",
						icon: CheckCircle2,
						label: "Active",
						tone: "emerald",
						value: page.activeCount,
					},
					{
						helper: "Kept for history",
						icon: CirclePause,
						label: "Inactive",
						tone: "amber",
						value: page.records.length - page.activeCount,
					},
				]}
			/>
			<ModuleTable
				emptyDescription="Add a price list to start maintaining pricing structures."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No price lists found"
				minWidthClassName="min-w-[76rem]"
				paginationStorageKey={PriceListsPaginationStorageKey}
				table={page.table}
				tableTitle="Price lists"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search Price Lists"
							placeholder="Search price lists"
							value={page.query}
							onChange={page.setQuery}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={page.setStatusFilter}
						/>
						<ModuleTableResetButton
							onClick={() => {
								page.setQuery("");
								page.setStatusFilter("Active");
							}}
						/>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<PriceListsTableRow
						key={row.id}
						row={row}
						onEdit={page.openEditDrawer}
						onToggleStatus={page.toggleStatus}
						onView={page.openViewDrawer}
					/>
				)}
			/>
			<PriceListsDrawer
				key={`${page.drawer?.mode ?? "closed"}-${page.drawer?.record?.id ?? "new"}`}
				drawer={page.drawer}
				onClose={page.closeDrawer}
				onSave={page.saveRecord}
			/>
		</section>
	);
}
