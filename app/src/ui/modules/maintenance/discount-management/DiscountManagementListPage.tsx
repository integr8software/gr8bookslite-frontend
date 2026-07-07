"use client";

import { useCallback, useMemo, useState } from "react";
import {
	CheckCircle2,
	CirclePause,
	Percent,
	ShoppingCart,
	Tags,
	WalletCards,
} from "lucide-react";
import { useDiscountManagementListPage } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagementListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { DiscountManagementDrawerState } from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DiscountManagementDrawer } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementDrawer";
import { DiscountManagementHeader } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementHeader";
import { DiscountManagementImportDialog } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementImportDialog";
import { DiscountManagementTable } from "@/app/src/ui/modules/maintenance/discount-management/DiscountManagementTable";

export function DiscountManagementListPage() {
	const page = useDiscountManagementListPage();
	const [drawerState, setDrawerState] =
		useState<DiscountManagementDrawerState>(null);
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
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Percent,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total",
				summary: "All discount records",
				value: page.statistics.totalDiscounts,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active",
				summary: "Available for selection",
				value: page.statistics.activeDiscounts,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive",
				summary: "Currently inactive",
				value: page.statistics.inactiveDiscounts,
			},
			{
				icon: ShoppingCart,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Purchases",
				summary: "Purchase discounts",
				value: page.statistics.purchaseDiscounts,
			},
			{
				icon: WalletCards,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Sales",
				summary: "Sales discounts",
				value: page.statistics.salesDiscounts,
			},
			{
				icon: Tags,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Percentage Type",
				summary: "Percentage discounts",
				value: page.statistics.percentageDiscounts,
			},
		],
		[page.statistics],
	);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.typeFilter !== "All" ||
		page.discountTypeFilter !== "All" ||
		page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<DiscountManagementHeader
				onAdd={() => setDrawerState({ mode: "add" })}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<ModuleStatisticCards
				items={statisticCards}
				isLoading={page.isLoading}
				className="xl:grid-cols-6"
			/>

			<DiscountManagementTable
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
			<DiscountManagementDrawer
				discount={drawerState?.discount}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
			/>
			{page.permissions.canImport ? (
				<DiscountManagementImportDialog
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
					page.pendingStatusDiscount?.status === "Active" ? "danger" : "success"
				}
				onCancel={() => page.setPendingStatusDiscount(null)}
				onConfirm={page.confirmDiscountStatusChange}
			/>
		</section>
	);
}
