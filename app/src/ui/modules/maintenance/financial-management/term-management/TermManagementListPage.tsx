"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CirclePause, Hash } from "lucide-react";
import { useTermManagementListPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementHeader } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementHeader";
import { TermManagementImportDialog } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementImportDialog";
import { TermManagementTable } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTable";
import { TermManagementDrawer } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementDrawer";

type DrawerState = { mode: "add" | "edit" | "view"; term?: TermManagement } | null;

export function TermManagementListPage() {
	const page = useTermManagementListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [isImportOpen, setIsImportOpen] = useState(false);
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: CalendarDays,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Terms",
				summary: "All term definitions",
				value: page.terms.length,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Terms",
				summary: "Available for selection",
				value: page.terms.filter((term) => term.status === "Active").length,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Terms",
				summary: "Currently inactive",
				value: page.terms.filter((term) => term.status === "Inactive").length,
			},
			{
				icon: Hash,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Day Mode",
				summary: "Uses day-based periods",
				value: page.terms.filter((term) => term.datemode === "Day").length,
			},
			{
				icon: CalendarDays,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Month Mode",
				summary: "Uses month-based periods",
				value: page.terms.filter((term) => term.datemode === "Month").length,
			},
			{
				icon: CalendarDays,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Year Mode",
				summary: "Uses year-based periods",
				value: page.terms.filter((term) => term.datemode === "Year").length,
			},
		],
		[page.terms],
	);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.datemodeFilter !== "All" ||
		Boolean(page.statusFilter);

	return (
		<section className="grid gap-5">
			<TermManagementHeader
				onAdd={() => setDrawerState({ mode: "add" })}
				onImport={() => setIsImportOpen(true)}
			/>
			<ModuleStatisticCards
				items={statisticCards}
				className="2xl:grid-cols-6"
			/>

			<TermManagementTable
				datemodeFilter={page.datemodeFilter}
				filteredTerms={page.filteredTerms}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				query={page.query}
				statusFilter={page.statusFilter}
				terms={page.terms}
				onDatemodeFilterChange={page.setDatemodeFilter}
				onEditTerm={(term) => setDrawerState({ mode: "edit", term })}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshTerms}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusTerm}
				onViewTerm={(term) => setDrawerState({ mode: "view", term })}
			/>
			<TermManagementDrawer
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={() => setDrawerState(null)}
				term={drawerState?.term}
			/>
			<TermManagementImportDialog
				existingTerms={page.terms}
				isOpen={isImportOpen}
				onClose={() => setIsImportOpen(false)}
				onImportTerms={page.addTerms}
			/>
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
