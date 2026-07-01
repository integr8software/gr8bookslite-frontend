"use client";

import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CirclePause, Landmark } from "lucide-react";
import { useBankMasterfileListPage } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfileListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type {
	BankMasterfile,
	BankMasterfileActionMode,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { BankMasterfileDrawer } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileDrawer";
import { BankMasterfileHeader } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileHeader";
import { BankMasterfileImportDialog } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileImportDialog";
import { BankMasterfileTable } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileTable";

type DrawerState =
	| { mode: BankMasterfileActionMode; bank?: BankMasterfile }
	| null;

export function BankMasterfileListPage() {
	const page = useBankMasterfileListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [isImportOpen, setIsImportOpen] = useState(false);
	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				setDrawerState({ mode: "add" });
			}
		},
		() => setDrawerState(null),
	);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Landmark,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Banks",
				summary: "All bank records",
				value: page.statistics.totalBanks,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Banks",
				summary: "Available for transactions",
				value: page.statistics.activeBanks,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Banks",
				summary: "Hidden from new transactions",
				value: page.statistics.inactiveBanks,
			},
			{
				icon: Banknote,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Default Banks",
				summary: "Marked as default",
				value: page.statistics.defaultBanks,
			},
		],
		[page.statistics],
	);
	const hasActiveFilters =
		page.query.trim().length > 0 || page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<BankMasterfileHeader
				onAdd={() => setDrawerState({ mode: "add" })}
				onImport={() => setIsImportOpen(true)}
				permissions={page.permissions}
			/>
			<ModuleStatisticCards
				items={statisticCards}
				isLoading={page.isLoading}
				className="xl:grid-cols-4"
			/>

			<BankMasterfileTable
				banks={page.banks}
				filteredBanks={page.filteredBanks}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				query={page.query}
				statusFilter={page.statusFilter}
				onEditBank={(bank) => setDrawerState({ mode: "edit", bank })}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshBanks}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusBank}
				onViewBank={(bank) => setDrawerState({ mode: "view", bank })}
			/>
			<BankMasterfileDrawer
				bank={drawerState?.bank}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={() => setDrawerState(null)}
			/>
			{page.permissions.canImport ? (
				<BankMasterfileImportDialog
					existingBanks={page.banks}
					isOpen={isImportOpen}
					onClose={() => setIsImportOpen(false)}
					onImportBanks={page.addBanks}
				/>
			) : null}
			<AppDialog
				isOpen={Boolean(page.pendingStatusBank)}
				isPending={page.isMutating}
				title={
					page.pendingStatusBank?.status === "Active"
						? "Inactivate bank?"
						: "Activate bank?"
				}
				description={
					page.pendingStatusBank?.status === "Active"
						? `${page.pendingStatusBank.bankName} will remain in history, but will no longer be active for new transactions.`
						: `${page.pendingStatusBank?.bankName ?? "This bank"} will be available for transactions again.`
				}
				confirmLabel={
					page.pendingStatusBank?.status === "Active" ? "Inactivate" : "Activate"
				}
				tone={page.pendingStatusBank?.status === "Active" ? "danger" : "success"}
				onCancel={() => page.setPendingStatusBank(null)}
				onConfirm={page.confirmBankStatusChange}
			/>
		</section>
	);
}
