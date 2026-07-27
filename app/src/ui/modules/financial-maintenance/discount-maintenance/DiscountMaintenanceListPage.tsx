"use client";

import { useCallback, useState } from "react";
import { useDiscountMaintenanceListPage } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenanceListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import type { DiscountMaintenanceDrawerState } from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DiscountMaintenanceDrawer } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceDrawer";
import { DiscountMaintenanceHeader } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceHeader";
import { DiscountMaintenanceImportDialog } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceImportDialog";
import { DiscountMaintenanceStatisticCards } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceStatisticCards";
import { DiscountMaintenanceTable } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTable";

export function DiscountMaintenanceListPage() {
	const page = useDiscountMaintenanceListPage();
	const [drawerState, setDrawerState] =
		useState<DiscountMaintenanceDrawerState>(null);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const closeDrawer = useCallback(() => setDrawerState(null), []);
	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				setDrawerState({ mode: "add" });
			}
		},
		closeDrawer,
	);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.typeFilter !== "All" ||
		page.discountTypeFilter !== "All" ||
		page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<DiscountMaintenanceHeader
				onAdd={() => setDrawerState({ mode: "add" })}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<DiscountMaintenanceStatisticCards
				statistics={page.statistics}
				isLoading={page.isLoading}
			/>

			<DiscountMaintenanceTable
				discountTypeFilter={page.discountTypeFilter}
				filteredDiscounts={page.filteredDiscounts}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				query={page.query}
				statusFilter={page.statusFilter}
				tableTypeFilter={page.typeFilter}
				discounts={page.discounts}
				onDiscountTypeFilterChange={page.setDiscountTypeFilter}
				onEditDiscount={(discount) =>
					setDrawerState({ discount, mode: "edit" })
				}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshDiscounts}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusDiscount}
				onTypeFilterChange={page.setTypeFilter}
				onViewDiscount={(discount) =>
					setDrawerState({ discount, mode: "view" })
				}
			/>
			<DiscountMaintenanceDrawer
				discount={drawerState?.discount}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
			/>
			{page.permissions.canImport ? (
				<DiscountMaintenanceImportDialog
					existingDiscounts={page.discounts}
					isOpen={isImportOpen}
					onClose={() => setIsImportOpen(false)}
					onImportDiscounts={page.addDiscounts}
				/>
			) : null}
			<AppDialog
				isOpen={Boolean(page.pendingStatusDiscount)}
				isPending={page.isMutating}
				title={
					page.pendingStatusDiscount?.status === "Active"
						? "Deactivate discount?"
						: "Activate discount?"
				}
				description={
					page.pendingStatusDiscount?.status === "Active"
						? `${page.pendingStatusDiscount.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusDiscount?.name ?? "This discount"} will be available for normal selection again.`
				}
				confirmLabel={
					page.pendingStatusDiscount?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={
					page.pendingStatusDiscount?.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusDiscount(null)}
				onConfirm={page.confirmDiscountStatusChange}
			/>
		</section>
	);
}
