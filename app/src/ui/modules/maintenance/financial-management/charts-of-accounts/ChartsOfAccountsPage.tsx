"use client";

import { ChartsOfAccountsSpotlightTutorialOpenEvent } from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";
import { ChartsOfAccountsDrawer } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsDrawer";
import { ChartsOfAccountsFilters } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsFilters";
import { ChartsOfAccountsHeader } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsHeader";
import { ChartsOfAccountsTable } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTable";
import { ChartsOfAccountsSpotlightTutorial } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorial";
import { Card } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";

export function ChartsOfAccountsMain() {
	const coa = useChartsOfAccounts();
	const accountOptions = coa.flatAccounts.map((item) => item.account);

	function openSpotlightTutorial() {
		window.dispatchEvent(new Event(ChartsOfAccountsSpotlightTutorialOpenEvent));
	}

	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-slate-100 text-slate-950 sm:-mx-5 lg:-mx-6">
			<ChartsOfAccountsSpotlightTutorial />
			<main className="grid min-h-[calc(100dvh-5rem)] gap-5 p-4 sm:p-6">
				<ChartsOfAccountsHeader
					onAddAccount={coa.openAddDrawer}
					onStartSpotlightTutorial={openSpotlightTutorial}
				/>

				<Card className="overflow-hidden">
					<ChartsOfAccountsFilters
						accountTypeFilter={coa.accountTypeFilter}
						activeTab={coa.activeTab}
						searchQuery={coa.searchQuery}
						statementGroupFilter={coa.statementGroupFilter}
						statusFilter={coa.statusFilter}
						onAccountTypeChange={coa.setAccountTypeFilter}
						onSearchChange={coa.setSearchQuery}
						onStatementGroupChange={coa.setStatementGroupFilter}
						onStatusChange={coa.setStatusFilter}
						onTabChange={coa.setActiveTab}
					/>

					<ChartsOfAccountsTable
						expandedIds={coa.expandedIds}
						isLoading={coa.isLoading}
						page={coa.page}
						rows={coa.paginatedAccounts}
						sortDirection={coa.sortDirection}
						sortKey={coa.sortKey}
						totalPages={coa.totalPages}
						totalRows={coa.visibleAccounts.length}
						onDelete={coa.deleteAccount}
						onEdit={coa.openEditDrawer}
						onPageChange={coa.setPage}
						onSort={coa.handleSort}
						onToggleExpanded={coa.toggleExpanded}
					/>
				</Card>
			</main>

			<ChartsOfAccountsDrawer
				account={coa.drawerAccount}
				accounts={accountOptions}
				isOpen={coa.isDrawerOpen}
				onClose={coa.closeDrawer}
				onSave={coa.saveAccount}
			/>
		</section>
	);
}
