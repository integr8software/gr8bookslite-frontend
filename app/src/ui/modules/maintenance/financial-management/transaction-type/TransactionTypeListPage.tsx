"use client";

import { CheckCircle2, CirclePause, Receipt } from "lucide-react";
import { useTransactionTypeListPage } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { TransactionTypeFilters } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeFilters";
import { TransactionTypeHeaderActions } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeHeaderActions";
import { TransactionTypeTable } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeTable";
import { TransactionTypeDrawer } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeDrawer";
import { useState } from "react";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

type DrawerState = { mode: "add" | "edit"; transactionType?: TransactionType } | null;

export function TransactionTypeListPage() {
	const page = useTransactionTypeListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Transaction Type"
				description="Maintain transaction types used for posting, accounting, and reporting flows."
				eyebrow={
					<>
						<Receipt className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={<TransactionTypeHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
			/>

			<ModuleMetrics
				metrics={[
					{
						helper: "All transaction types",
						icon: Receipt,
						label: "Total Types",
						value: page.transactionTypes.length,
					},
					{
						helper: "Available for posting",
						icon: CheckCircle2,
						label: "Active Types",
						tone: "emerald",
						value: page.transactionTypes.filter(
							(type) => type.status === "Active",
						).length,
					},
					{
						helper: "Currently inactive",
						icon: CirclePause,
						label: "Inactive Types",
						tone: "amber",
						value: page.transactionTypes.filter(
							(type) => type.status === "Inactive",
						).length,
					},
				]}
			/>

			<TransactionTypeTable
				isLoading={page.isLoading}
				transactionTypes={page.filteredTransactionTypes}
				toolbar={
					<TransactionTypeFilters
						searchTerm={page.searchTerm}
						statusFilter={page.statusFilter}
						onSearchTermChange={page.setSearchTerm}
						onStatusFilterChange={page.setStatusFilter}
					/>
				}
				onEdit={(transactionType) => setDrawerState({ mode: "edit", transactionType })}
				onToggleStatus={page.toggleTransactionTypeStatus}
			/>
			<TransactionTypeDrawer isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} transactionType={drawerState?.transactionType} />
		</section>
	);
}
