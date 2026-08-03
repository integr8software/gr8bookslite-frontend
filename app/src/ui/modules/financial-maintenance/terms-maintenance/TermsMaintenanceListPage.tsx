"use client";

import { useCallback, useState } from "react";
import { useTermsMaintenanceAssistantActions } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenanceAssistantActions";
import { useTermsMaintenanceListPage } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenanceListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import type { TermsMaintenanceDrawerState } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermsMaintenanceHeader } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceHeader";
import { TermsMaintenanceImportDialog } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceImportDialog";
import { TermsMaintenanceStatisticCards } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceStatisticCards";
import { TermsMaintenanceTable } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTable";
import { TermsMaintenanceDrawer } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceDrawer";

export function TermsMaintenanceListPage() {
	const page = useTermsMaintenanceListPage();
	const [drawerState, setDrawerState] =
		useState<TermsMaintenanceDrawerState>(null);
	const [drawerVersion, setDrawerVersion] = useState(0);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const closeDrawer = useCallback(() => setDrawerState(null), []);
	const openAddDrawer = useCallback(() => {
		setDrawerVersion((version) => version + 1);
		setDrawerState({ mode: "add" });
	}, []);
	const openDrawer = useCallback(
		(state: TermsMaintenanceDrawerState) => setDrawerState(state),
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
	useTermsMaintenanceAssistantActions({
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
			<TermsMaintenanceHeader
				onAdd={openAddDrawer}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<TermsMaintenanceStatisticCards
				statistics={page.statistics}
				isLoading={page.isLoading}
			/>

			<TermsMaintenanceTable
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
			<TermsMaintenanceDrawer
				key={`${drawerState?.mode ?? "closed"}-${drawerState?.term?.id ?? "new"}-${drawerVersion}`}
				initialValues={drawerState?.initialValues}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
				term={drawerState?.term}
			/>
			{page.permissions.canImport ? (
				<TermsMaintenanceImportDialog
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
