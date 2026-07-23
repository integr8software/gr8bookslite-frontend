"use client";

import { useState } from "react";
import { useDefaultAccountListPage } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccountListPage";
import type {
	DefaultAccountDrawerState,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountDrawer";
import { DefaultAccountHeader } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountHeader";
import { DefaultAccountStatisticCards } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountStatisticCards";
import { DefaultAccountTable } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountTable";

export function DefaultAccountListPage() {
	const page = useDefaultAccountListPage();
	const [drawerState, setDrawerState] = useState<DefaultAccountDrawerState>(null);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.statusFilter !== "Active" ||
		page.typeFilter !== "";

	return (
		<section className="grid gap-5">
			<DefaultAccountHeader
				permissions={page.permissions}
				onAdd={() => setDrawerState({ mode: "add" })}
			/>
			<DefaultAccountStatisticCards
				statistics={page.statistics}
				isLoading={page.isLoading}
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
				tone={page.pendingStatusAccount?.status === "Active" ? "deactivate" : "activate"}
				onCancel={() => page.setPendingStatusAccount(null)}
				onConfirm={page.confirmStatusChange}
			/>
		</section>
	);
}
