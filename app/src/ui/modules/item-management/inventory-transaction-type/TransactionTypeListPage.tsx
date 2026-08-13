"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CirclePause, Network, Package } from "lucide-react";
import {
	TransactionTypeDescription,
	TransactionTypeParentLabel,
	TransactionTypeTitle,
} from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import { useTransactionTypeListPage } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionTypeListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TransactionTypeHeaderActions } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeHeaderActions";
import { TransactionTypeTable } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeTable";
import { TransactionTypeDrawer } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeDrawer";
import type { TransactionTypeDrawerState } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

export function TransactionTypeListPage() {
	const page = useTransactionTypeListPage();
	const [drawerState, setDrawerState] =
		useState<TransactionTypeDrawerState>(null);
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Package,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Types",
				summary: "All inventory movement types",
				value: page.transactionTypes.length,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Types",
				summary: "Available for GR/GI selection",
				value: page.transactionTypes.filter(
					(type) => type.status === "Active",
				).length,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Types",
				summary: "Currently inactive",
				value: page.transactionTypes.filter(
					(type) => type.status === "Inactive",
				).length,
			},
			{
				icon: Network,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Linked Modules",
				summary: "Modules using transaction types",
				value: page.moduleFilterOptions.length,
			},
		],
		[page.moduleFilterOptions.length, page.transactionTypes],
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={TransactionTypeTitle}
				description={TransactionTypeDescription}
				eyebrow={
					<>
						<Package className="h-3.5 w-3.5" aria-hidden="true" />
						{TransactionTypeParentLabel}
					</>
				}
				actions={<TransactionTypeHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
			/>

			<ModuleStatisticCards
				items={statisticCards}
				className="xl:grid-cols-4"
			/>

			<TransactionTypeTable
				filteredTransactionTypes={page.filteredTransactionTypes}
				hasActiveFilters={page.hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				isSyncing={page.isRefreshing || page.isMutating}
				lastSyncedAt={page.lastSyncedAt}
				moduleFilter={page.moduleFilter}
				moduleFilterOptions={page.moduleFilterOptions}
				searchTerm={page.searchTerm}
				statusFilter={page.statusFilter}
				table={page.table}
				transactionTypes={page.transactionTypes}
				onEdit={(transactionType) => setDrawerState({ mode: "edit", transactionType })}
				onModuleFilterChange={page.setModuleFilter}
				onRefresh={page.refreshTransactionTypes}
				onSearchTermChange={page.setSearchTerm}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusTransactionType}
				onView={(transactionType) => setDrawerState({ mode: "view", transactionType })}
			/>
			<TransactionTypeDrawer isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} transactionType={drawerState?.transactionType} />
			<AppDialog
				isOpen={Boolean(page.pendingStatusTransactionType)}
				isPending={page.isMutating}
				title={
					page.pendingStatusTransactionType?.status === "Active"
						? "Deactivate inventory transaction type?"
						: "Activate inventory transaction type?"
				}
				description={
					page.pendingStatusTransactionType?.status === "Active"
						? `${page.pendingStatusTransactionType.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusTransactionType?.name ?? "This inventory transaction type"} will be available for selection again.`
				}
				confirmLabel={
					page.pendingStatusTransactionType?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={
					page.pendingStatusTransactionType?.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusTransactionType(null)}
				onConfirm={page.confirmTransactionTypeStatusChange}
			/>
		</section>
	);
}
