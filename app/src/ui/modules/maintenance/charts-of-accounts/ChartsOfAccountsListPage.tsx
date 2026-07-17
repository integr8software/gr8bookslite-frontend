"use client";

import { useState } from "react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsDrawer } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsDrawer";
import { ChartsOfAccountsFilters } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsFilters";
import { ChartsOfAccountsHeader } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsHeader";
import { ChartsOfAccountsStatisticCards } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsStatisticCards";
import { ChartsOfAccountsTable } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsTable";
import { ChartsOfAccountsSpotlightTutorial } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsSpotlightTutorial";
import { Card } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/charts-of-accounts/useChartsOfAccounts";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function ChartsOfAccountsListPage() {
	const coa = useChartsOfAccounts();
	const accountOptions = coa.flatAccounts.map((item) => item.account);
	const [pendingStatusAccount, setPendingStatusAccount] =
		useState<ChartAccount | null>(null);
	useMaintenanceAddDrawerSpotlight(coa.openAddDrawer, coa.closeDrawer);

	function handleConfirmStatusChange() {
		if (!pendingStatusAccount) {
			return;
		}

		coa.updateAccountStatus(pendingStatusAccount);
		setPendingStatusAccount(null);
	}

	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
			<ChartsOfAccountsSpotlightTutorial />
			<main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
				<ChartsOfAccountsHeader
					canCreate={coa.permissions.canCreate}
					onAddAccount={() => coa.openAddDrawer()}
				/>

				<ChartsOfAccountsStatisticCards
					flatAccounts={coa.flatAccounts}
					isLoading={coa.isLoading}
				/>

				<Card
					className="overflow-hidden rounded-lg"
					data-spotlight-id="charts-of-accounts-table"
				>
					<ChartsOfAccountsTable
						accounts={accountOptions}
						expandedIds={coa.expandedIds}
						isLoading={coa.isLoading}
						isRefreshing={coa.isRefreshing}
						lastSyncedAt={coa.lastSyncedAt}
						permissions={coa.permissions}
						table={coa.table}
						toolbar={
							<ChartsOfAccountsFilters
								accountTypeFilter={coa.accountTypeFilter}
								activeTab={coa.activeTab}
								exportAllRows={coa.flatAccounts}
								exportFilteredRows={coa.visibleAccounts}
								isRefreshing={coa.isRefreshing}
								permissions={coa.permissions}
								searchQuery={coa.searchQuery}
								statusFilter={coa.statusFilter}
								structureFilter={coa.structureFilter}
								table={coa.table}
								onAccountTypeChange={coa.setAccountTypeFilter}
								onRefresh={coa.refreshAccounts}
								onResetFilters={coa.resetFilters}
								onSearchChange={coa.setSearchQuery}
								onStatusChange={coa.setStatusFilter}
								onStructureChange={coa.setStructureFilter}
								onTabChange={coa.setActiveTab}
							/>
						}
						canDragRows={coa.structureFilter !== "Without Submodules"}
						showHierarchyGuides={coa.structureFilter !== "Without Submodules"}
						showParentColumn={false}
						onAddChild={coa.openAddDrawer}
						onEdit={coa.openEditDrawer}
						onReorderAccount={coa.reorderAccount}
						onStatusChange={setPendingStatusAccount}
						onToggleExpanded={coa.toggleExpanded}
						onView={coa.openViewDrawer}
					/>
				</Card>
			</main>

			<ChartsOfAccountsDrawer
				account={coa.drawerAccount}
				accounts={accountOptions}
				isOpen={coa.isDrawerOpen}
				isSaving={coa.isMutating}
				mode={coa.drawerMode}
				parentAccount={coa.drawerParentAccount}
				saveResetToken={coa.saveResetToken}
				onClose={coa.closeDrawer}
				onSave={coa.saveAccount}
			/>
			<AppDialog
				isOpen={Boolean(pendingStatusAccount)}
				isPending={coa.isMutating}
				title={
					pendingStatusAccount?.status === "Active"
						? "Deactivate chart account?"
						: "Activate chart account?"
				}
				description={
					pendingStatusAccount?.status === "Active"
						? `${pendingStatusAccount.accountName} (${pendingStatusAccount.accountNumber}) will be inactive while keeping accounting history intact.`
						: `${pendingStatusAccount?.accountName ?? "This account"} will be available for normal selection again.`
				}
				confirmLabel={
					pendingStatusAccount?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={pendingStatusAccount?.status === "Active" ? "deactivate" : "activate"}
				onCancel={() => setPendingStatusAccount(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</section>
	);
}

