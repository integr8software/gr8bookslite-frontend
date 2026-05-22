"use client";

import { useState } from "react";
import { Download, Home, Plus, Sparkles, Upload } from "lucide-react";
import { ChartsOfAccountsSpotlightTutorialOpenEvent } from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsDrawer } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsDrawer";
import { ChartsOfAccountsFilters } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsFilters";
import { ChartsOfAccountsTable } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTable";
import { ChartsOfAccountsSpotlightTutorial } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorial";
import { Button, Card } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";

export function ChartsOfAccountsMain() {
	const coa = useChartsOfAccounts();
	const accountOptions = coa.flatAccounts.map((item) => item.account);
	const [pendingDeleteAccount, setPendingDeleteAccount] =
		useState<ChartAccount | null>(null);

	function openSpotlightTutorial() {
		window.dispatchEvent(new Event(ChartsOfAccountsSpotlightTutorialOpenEvent));
	}

	function handleConfirmDelete() {
		if (!pendingDeleteAccount) {
			return;
		}

		coa.deleteAccount(pendingDeleteAccount.id);
		setPendingDeleteAccount(null);
	}

	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
			<ChartsOfAccountsSpotlightTutorial />
			<main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
				<ModuleHeader
					variant="panel"
					data-spotlight-id="charts-of-accounts-header"
					titleAs="h1"
					title="Chart of Accounts"
					description="Manage all company accounts and financial statement mapping"
					eyebrow={
						<>
							<Home className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<>
							<Button variant="secondary" onClick={openSpotlightTutorial}>
								<Sparkles className="h-4 w-4" aria-hidden="true" />
								Quick Tour
							</Button>
							<Button variant="secondary">
								<Upload className="h-4 w-4" aria-hidden="true" />
								Import
							</Button>
							<Button variant="secondary">
								<Download className="h-4 w-4" aria-hidden="true" />
								Export
							</Button>
							<Button
								onClick={coa.openAddDrawer}
								data-spotlight-id="charts-of-accounts-add-account"
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add Account
							</Button>
						</>
					}
				/>

				<Card className="overflow-hidden">
					<ChartsOfAccountsFilters
						accountTypeFilter={coa.accountTypeFilter}
						activeTab={coa.activeTab}
						searchQuery={coa.searchQuery}
						statusFilter={coa.statusFilter}
						onAccountTypeChange={coa.setAccountTypeFilter}
						onSearchChange={coa.setSearchQuery}
						onStatusChange={coa.setStatusFilter}
						onTabChange={coa.setActiveTab}
					/>

					<ChartsOfAccountsTable
						expandedIds={coa.expandedIds}
						isLoading={coa.isLoading}
						table={coa.table}
						onDelete={setPendingDeleteAccount}
						onEdit={coa.openEditDrawer}
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
			<AppDialog
				isOpen={Boolean(pendingDeleteAccount)}
				title="Delete chart account?"
				description={`This will remove ${pendingDeleteAccount?.accountName ?? "the selected account"} (${pendingDeleteAccount?.accountNumber ?? ""}).`}
				confirmLabel="Delete Account"
				tone="danger"
				onCancel={() => setPendingDeleteAccount(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
