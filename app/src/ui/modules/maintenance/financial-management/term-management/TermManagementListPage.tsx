"use client";

import { useState } from "react";
import { CalendarDays, Download, Hash, Plus, Upload } from "lucide-react";
import {
	TermManagementDatemodeOptions,
	TermManagementStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementListPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementTable } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTable";
import { TermManagementDrawer } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementDrawer";

type DrawerState = { mode: "add" | "edit" | "view"; term?: TermManagement } | null;

export function TermManagementListPage() {
	const page = useTermManagementListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Term Management"
				description="Manage datemode and period definitions used for term reporting and payment cycles."
				eyebrow={
					<>
						<CalendarDays
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						Accounting master data
					</>
				}
				actions={<TermManagementHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
			/>

			<ModuleMetrics
				metrics={[
					{
						helper: "All term definitions",
						icon: CalendarDays,
						label: "Total Terms",
						value: page.terms.length,
					},
					{
						helper: "Uses day-based periods",
						icon: Hash,
						label: "Day Mode",
						tone: "emerald",
						value: page.terms.filter((term) => term.datemode === "Day")
							.length,
					},
					{
						helper: "Uses month-based periods",
						icon: CalendarDays,
						label: "Month Mode",
						tone: "violet",
						value: page.terms.filter((term) => term.datemode === "Month")
							.length,
					},
					{
						helper: "Uses year-based periods",
						icon: CalendarDays,
						label: "Year Mode",
						tone: "amber",
						value: page.terms.filter((term) => term.datemode === "Year")
							.length,
					},
				]}
			/>

			<TermManagementTable
				isLoading={page.isLoading}
				terms={page.filteredTerms}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search terms"
							value={page.query}
							onChange={page.setQuery}
							placeholder="Search by name, datemode, period, or status"
						/>
						<ModuleTableFilterSelect
							label="Datemode"
							value={page.datemodeFilter}
							options={[
								{ label: "All", value: "All" },
								...TermManagementDatemodeOptions.map(
									(datemode) => ({
										label: datemode,
										value: datemode,
									}),
								),
							]}
							onChange={page.setDatemodeFilter}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "" },
								...TermManagementStatusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							onChange={(value) =>
								page.setStatusFilter(
									value as "" | (typeof TermManagementStatusOptions)[number],
								)
							}
						/>
						<ModuleTableResetButton onClick={page.resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				onEditTerm={(term) => setDrawerState({ mode: "edit", term })}
				onToggleStatus={page.setPendingStatusTerm}
				onViewTerm={(term) => setDrawerState({ mode: "view", term })}
			/>
			<TermManagementDrawer isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} term={drawerState?.term} />
			<AppDialog
				isOpen={Boolean(page.pendingStatusTerm)}
				isPending={page.isMutating}
				title={
					page.pendingStatusTerm?.status === "Active"
						? "Set term inactive?"
						: "Reactivate term?"
				}
				description={
					page.pendingStatusTerm?.status === "Active"
						? `${page.pendingStatusTerm.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusTerm?.name ?? "This term"} will be available for selection again.`
				}
				confirmLabel={
					page.pendingStatusTerm?.status === "Active"
						? "Set Inactive"
						: "Reactivate"
				}
				tone={page.pendingStatusTerm?.status === "Active" ? "danger" : "success"}
				onCancel={() => page.setPendingStatusTerm(null)}
				onConfirm={page.confirmTermStatusChange}
			/>
		</section>
	);
}

function TermManagementHeaderActions({ onAdd }: { onAdd: () => void }) {
	return (
		<>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Upload className="h-4 w-4" aria-hidden="true" />
				Import
			</button>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</button>
			<button
				type="button"
				onClick={onAdd}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Term
			</button>
		</>
	);
}
