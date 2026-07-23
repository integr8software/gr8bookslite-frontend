"use client";

import { useCallback, useState } from "react";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import { useUnitOfMeasurementListPage } from "@/app/src/hooks/modules/item-management/unit-of-measurement/useUnitOfMeasurementListPage";
import type { UnitOfMeasurementDrawerState } from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { UnitOfMeasurementDrawer } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementDrawer";
import { UnitOfMeasurementHeader } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementHeader";
import { UnitOfMeasurementImportDialog } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementImportDialog";
import { UnitOfMeasurementStatisticCards } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementStatisticCards";
import { UnitOfMeasurementTable } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementTable";

export function UnitOfMeasurementListPage() {
	const page = useUnitOfMeasurementListPage();
	const [drawerState, setDrawerState] =
		useState<UnitOfMeasurementDrawerState>(null);
	const [drawerVersion, setDrawerVersion] = useState(0);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const closeDrawer = useCallback(() => {
		page.closeDrawer();
		setDrawerState(null);
	}, [page]);
	const openAddDrawer = useCallback(() => {
		setDrawerVersion((version) => version + 1);
		page.openAddDrawer();
		setDrawerState({ mode: "add" });
	}, [page]);
	const openEditDrawer = useCallback(
		(record: NonNullable<UnitOfMeasurementDrawerState>["record"]) => {
			if (!record) {
				return;
			}

			page.openEditDrawer(record);
			setDrawerState({ mode: "edit", record });
		},
		[page],
	);
	const openViewDrawer = useCallback(
		(record: NonNullable<UnitOfMeasurementDrawerState>["record"]) => {
			if (!record) {
				return;
			}

			page.openViewDrawer(record);
			setDrawerState({ mode: "view", record });
		},
		[page],
	);
	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				openAddDrawer();
			}
		},
		closeDrawer,
	);
	const activeDrawer = drawerState ?? page.drawer;
	const statistics = {
		totalUnits: page.records.length,
		activeUnits: page.activeCount,
		inactiveUnits: page.records.filter((record) => record.status === "Inactive")
			.length,
		decimalUnits: page.decimalCount,
	};
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.quantityModeFilter !== "All" ||
		page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<UnitOfMeasurementHeader
				onAdd={openAddDrawer}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<UnitOfMeasurementStatisticCards
				statistics={statistics}
				isLoading={page.isLoading}
			/>
			<UnitOfMeasurementTable
				filteredRecords={page.filteredRecords}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				isSyncing={page.isRefreshing || page.isMutating}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				quantityModeFilter={page.quantityModeFilter}
				query={page.query}
				records={page.records}
				statusFilter={page.statusFilter}
				table={page.table}
				onEditRecord={openEditDrawer}
				onQuantityModeFilterChange={page.setQuantityModeFilter}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshRecords}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusRecord}
				onViewRecord={openViewDrawer}
			/>
			<UnitOfMeasurementDrawer
				key={`${activeDrawer?.mode ?? "closed"}-${activeDrawer?.record?.id ?? "new"}-${drawerVersion}`}
				initialValues={activeDrawer?.initialValues}
				isOpen={Boolean(activeDrawer)}
				isSaving={page.isMutating}
				mode={activeDrawer?.mode ?? "add"}
				onClose={closeDrawer}
				onSave={page.saveRecord}
				record={activeDrawer?.record}
			/>
			{page.permissions.canImport ? (
				<UnitOfMeasurementImportDialog
					existingRecords={page.records}
					isOpen={isImportOpen}
					onClose={() => setIsImportOpen(false)}
					onImportRecords={page.importRecords}
				/>
			) : null}
			<AppDialog
				isOpen={Boolean(page.pendingStatusRecord)}
				isPending={page.isMutating}
				title={
					page.pendingStatusRecord?.status === "Active"
						? "Deactivate unit?"
						: "Activate unit?"
				}
				description={
					page.pendingStatusRecord?.status === "Active"
						? `${page.pendingStatusRecord.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusRecord?.name ?? "This unit"} will be available for normal selection again.`
				}
				confirmLabel={
					page.pendingStatusRecord?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={
					page.pendingStatusRecord?.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusRecord(null)}
				onConfirm={page.confirmStatusChange}
			/>
		</section>
	);
}
