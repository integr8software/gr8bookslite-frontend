"use client";

import { useState } from "react";
import {
	CheckCircle2,
	CirclePause,
	Download,
	Layers3,
	ListTree,
	Network,
	Plus,
	Upload,
} from "lucide-react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsDrawer } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsDrawer";
import { ChartsOfAccountsFilters } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsFilters";
import { ChartsOfAccountsTable } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTable";
import { ChartsOfAccountsSpotlightTutorial } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorial";
import { Card } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function ChartsOfAccountsMain() {
  const coa = useChartsOfAccounts();
  const accountOptions = coa.flatAccounts.map((item) => item.account);
  const totalAccounts = coa.flatAccounts.length;
  const activeAccounts = coa.flatAccounts.filter(
    ({ account }) => account.status === "Active",
  ).length;
  const inactiveAccounts = totalAccounts - activeAccounts;
  const withSubmodules = coa.flatAccounts.filter(({ account }) =>
    Boolean(account.children?.length),
  ).length;
  const withoutSubmodules = totalAccounts - withSubmodules;
  const [pendingDeleteAccount, setPendingDeleteAccount] =
    useState<ChartAccount | null>(null);
  useMaintenanceAddDrawerSpotlight(coa.openAddDrawer);

  function handleConfirmDelete() {
    if (!pendingDeleteAccount) {
      return;
    }

    coa.deleteAccount(pendingDeleteAccount.id);
    setPendingDeleteAccount(null);
  }

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
      <ChartsOfAccountsSpotlightTutorial />
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          variant="plain"
          data-spotlight-id="charts-of-accounts-header"
          titleAs="h1"
          title="Chart of Accounts"
          description="Manage all company accounts and financial statement mapping."
          actions={
            <>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import
              </button>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export
              </button>
              <button
                type="button"
                className={moduleHeaderActionClassNames.primary}
                onClick={coa.openAddDrawer}
                data-spotlight-id="charts-of-accounts-add-account"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Account
              </button>
            </>
          }
        />

        <ModuleMetrics
          metrics={[
            {
              helper: "All accounts",
              icon: Layers3,
              label: "Total Accounts",
              value: totalAccounts,
            },
            {
              helper: `${getAccountPercentage(activeAccounts, totalAccounts)}% of total`,
              icon: CheckCircle2,
              label: "Active Accounts",
              tone: "emerald",
              value: activeAccounts,
            },
            {
              helper: `${getAccountPercentage(inactiveAccounts, totalAccounts)}% of total`,
              icon: CirclePause,
              label: "Inactive Accounts",
              tone: "amber",
              value: inactiveAccounts,
            },
            {
              helper: `${getAccountPercentage(withSubmodules, totalAccounts)}% of total`,
              icon: Network,
              label: "With Submodules",
              tone: "violet",
              value: withSubmodules,
            },
            {
              helper: `${getAccountPercentage(withoutSubmodules, totalAccounts)}% of total`,
              icon: ListTree,
              label: "Without Submodules",
              tone: "cyan",
              value: withoutSubmodules,
            },
          ]}
        />

        <Card className="overflow-hidden rounded-lg">
          <ChartsOfAccountsTable
            expandedIds={coa.expandedIds}
            isLoading={coa.isLoading}
            table={coa.table}
            toolbar={
              <ChartsOfAccountsFilters
                accountTypeFilter={coa.accountTypeFilter}
                activeTab={coa.activeTab}
                searchQuery={coa.searchQuery}
                statusFilter={coa.statusFilter}
                structureFilter={coa.structureFilter}
                onAccountTypeChange={coa.setAccountTypeFilter}
                onResetFilters={coa.resetFilters}
                onSearchChange={coa.setSearchQuery}
                onStatusChange={coa.setStatusFilter}
                onStructureChange={coa.setStructureFilter}
                onTabChange={coa.setActiveTab}
              />
            }
            onDelete={setPendingDeleteAccount}
            onEdit={coa.openEditDrawer}
            onReorderAccount={coa.reorderAccount}
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

function getAccountPercentage(count: number, total: number) {
	if (total === 0) {
		return 0;
	}

	return Math.round((count / total) * 100);
}
