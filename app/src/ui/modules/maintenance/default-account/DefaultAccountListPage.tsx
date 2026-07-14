"use client";

import { useMemo, useState } from "react";
import {
	CheckCircle2,
	CirclePause,
	FileCog,
	Package,
	ReceiptText,
	WalletCards,
} from "lucide-react";
import { useDefaultAccountListPage } from "@/app/src/hooks/modules/maintenance/default-account/useDefaultAccountListPage";
import type {
	DefaultAccountDrawerState,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/maintenance/default-account/DefaultAccountDrawer";
import { DefaultAccountHeader } from "@/app/src/ui/modules/maintenance/default-account/DefaultAccountHeader";
import { DefaultAccountTable } from "@/app/src/ui/modules/maintenance/default-account/DefaultAccountTable";

export function DefaultAccountListPage() {
	const page = useDefaultAccountListPage();
	const [drawerState, setDrawerState] = useState<DefaultAccountDrawerState>(null);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.statusFilter !== "Active" ||
		page.typeFilter !== "";
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: FileCog,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total",
				summary: "All default accounts",
				value: page.statistics.totalDefaultAccounts,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active",
				summary: "Available for setup",
				value: page.statistics.activeDefaultAccounts,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive",
				summary: "Hidden from selection",
				value: page.statistics.inactiveDefaultAccounts,
			},
			{
				icon: ReceiptText,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Collection",
				summary: "Revenue templates",
				value: page.statistics.collectionDefaultAccounts,
			},
			{
				icon: WalletCards,
				iconClassName: "bg-rose-50 text-rose-700",
				label: "Expense",
				summary: "Expense templates",
				value: page.statistics.expenseDefaultAccounts,
			},
			{
				icon: Package,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Fixed Asset",
				summary: "Asset templates",
				value: page.statistics.fixedAssetDefaultAccounts,
			},
		],
		[page.statistics],
	);

	return (
		<section className="grid gap-5">
			<DefaultAccountHeader
				permissions={page.permissions}
				onAdd={() => setDrawerState({ mode: "add" })}
			/>
			<ModuleStatisticCards
				items={statisticCards}
				isLoading={page.isLoading}
				className="xl:grid-cols-6"
			/>
			<DefaultAccountTable
				defaultAccounts={page.defaultAccounts}
				filteredDefaultAccounts={page.filteredDefaultAccounts}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				query={page.query}
				statusFilter={page.statusFilter}
				typeFilter={page.typeFilter}
				onEditDefaultAccount={(selected) =>
					setDrawerState({ mode: "edit", defaultAccount: selected })
				}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshDefaultAccounts}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusAccount}
				onTypeFilterChange={page.setTypeFilter}
				onViewDefaultAccount={(selected) =>
					setDrawerState({ mode: "view", defaultAccount: selected })
				}
			/>
			<DefaultAccountDrawer
				defaultAccount={drawerState?.defaultAccount}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={() => setDrawerState(null)}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingStatusAccount)}
				isPending={page.isMutating}
				title={
					page.pendingStatusAccount?.status === "Active"
						? "Inactivate default account?"
						: "Activate default account?"
				}
				description={
					page.pendingStatusAccount?.status === "Active"
						? `${page.pendingStatusAccount.defaultAccountName} will no longer be available for new setup selection.`
						: `${page.pendingStatusAccount?.defaultAccountName ?? "This default account"} will be available again.`
				}
				confirmLabel={
					page.pendingStatusAccount?.status === "Active" ? "Inactivate" : "Activate"
				}
				tone={page.pendingStatusAccount?.status === "Active" ? "danger" : "success"}
				onCancel={() => page.setPendingStatusAccount(null)}
				onConfirm={page.confirmStatusChange}
			/>
		</section>
	);
}
