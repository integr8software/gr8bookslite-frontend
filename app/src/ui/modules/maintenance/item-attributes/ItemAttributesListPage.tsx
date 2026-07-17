"use client";

import { CheckCircle2, CirclePause, ListChecks, Plus, Tags } from "lucide-react";
import {
	ItemAttributesDescription,
	ItemAttributesTitle,
} from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import { useItemAttributesListPage } from "@/app/src/hooks/modules/maintenance/item-attributes/useItemAttributesListPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemAttributesDrawer } from "@/app/src/ui/modules/maintenance/item-attributes/ItemAttributesDrawer";
import { ItemAttributesTable } from "@/app/src/ui/modules/maintenance/item-attributes/ItemAttributesTable";

export function ItemAttributesListPage() {
	const page = useItemAttributesListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={ItemAttributesTitle}
				description={ItemAttributesDescription}
				eyebrow={
					<>
						<ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
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
						Add Attribute
					</button>
				}
			/>
			<ModuleStatisticCards
				items={[
					{
						helper: "Setup records",
						icon: ListChecks,
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
					{
						helper: "Configured values",
						icon: Tags,
						label: "Values",
						tone: "violet",
						value: page.records.reduce(
							(total, record) => total + record.values.length,
							0,
						),
					},
				]}
				className="xl:grid-cols-4"
			/>
			<ItemAttributesTable
				table={page.table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search Item Attributes"
							placeholder="Search item attributes"
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
				onEdit={page.openEditDrawer}
				onToggleStatus={page.toggleStatus}
				onView={page.openViewDrawer}
			/>
			<ItemAttributesDrawer
				key={`${page.drawer?.mode ?? "closed"}-${page.drawer?.record?.id ?? "new"}`}
				drawer={page.drawer}
				onClose={page.closeDrawer}
				onSave={page.saveRecord}
			/>
		</section>
	);
}
