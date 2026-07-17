"use client";

import { useCallback, useState } from "react";
import { useTermManagementAssistantActions } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementAssistantActions";
import { useTermManagementListPage } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { TermManagementDrawerState } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementHeader } from "@/app/src/ui/modules/maintenance/term-management/TermManagementHeader";
import { TermManagementImportDialog } from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportDialog";
import { TermManagementStatisticCards } from "@/app/src/ui/modules/maintenance/term-management/TermManagementStatisticCards";
import { TermManagementTable } from "@/app/src/ui/modules/maintenance/term-management/TermManagementTable";
import { TermManagementDrawer } from "@/app/src/ui/modules/maintenance/term-management/TermManagementDrawer";

export function TermManagementListPage() {
	const page = useTermManagementListPage();
	const [drawerState, setDrawerState] =
		useState<TermManagementDrawerState>(null);
	const [drawerVersion, setDrawerVersion] = useState(0);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const closeDrawer = useCallback(() => setDrawerState(null), []);
	const openAddDrawer = useCallback(() => {
		setDrawerVersion((version) => version + 1);
		setDrawerState({ mode: "add" });
	}, []);
	const openDrawer = useCallback(
		(state: TermManagementDrawerState) => setDrawerState(state),
		[],
	);
	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				openAddDrawer();
			}
		},
		closeDrawer,
	);
	useTermManagementAssistantActions({
		closeDrawer,
		openDrawer,
		page,
	});
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.datemodeFilter !== "All" ||
		page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<TermManagementHeader
				onAdd={openAddDrawer}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<TermManagementStatisticCards
				statistics={page.statistics}
				isLoading={page.isLoading}
			/>

			<TermManagementTable
				datemodeFilter={page.datemodeFilter}
				filteredTerms={page.filteredTerms}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				query={page.query}
				statusFilter={page.statusFilter}
				terms={page.terms}
				permissions={page.permissions}
				onDatemodeFilterChange={page.setDatemodeFilter}
				onEditTerm={(term) => setDrawerState({ mode: "edit", term })}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshTerms}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusTerm}
				onViewTerm={(term) => setDrawerState({ mode: "view", term })}
			/>
			<TermManagementDrawer
				key={`${drawerState?.mode ?? "closed"}-${drawerState?.term?.id ?? "new"}-${drawerVersion}`}
				initialValues={drawerState?.initialValues}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
				term={drawerState?.term}
			/>
			{page.permissions.canImport ? (
				<TermManagementImportDialog
					existingTerms={page.terms}
					isOpen={isImportOpen}
					onClose={() => setIsImportOpen(false)}
					onImportTerms={page.addTerms}
				/>
			) : null}
			<AppDialog
				isOpen={Boolean(page.pendingStatusTerm)}
				isPending={page.isMutating}
				title={
					page.pendingStatusTerm?.status === "Active"
						? "Deactivate term?"
						: "Activate term?"
				}
				description={
					page.pendingStatusTerm?.status === "Active"
						? `${page.pendingStatusTerm.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusTerm?.name ?? "This term"} will be available for normal selection again.`
				}
				confirmLabel={
					page.pendingStatusTerm?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={page.pendingStatusTerm?.status === "Active" ? "deactivate" : "activate"}
				onCancel={() => page.setPendingStatusTerm(null)}
				onConfirm={page.confirmTermStatusChange}
			/>
		</section>
	);
}
