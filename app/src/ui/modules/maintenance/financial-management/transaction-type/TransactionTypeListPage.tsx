"use client";

import { Receipt } from "lucide-react";
import { useTransactionTypeListPage } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { TransactionTypeFilters } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeFilters";
import { TransactionTypeHeaderActions } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeHeaderActions";
import { TransactionTypeTable } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeTable";

export function TransactionTypeListPage() {
	const page = useTransactionTypeListPage();

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
				actions={<TransactionTypeHeaderActions />}
			/>

			<TransactionTypeFilters
				searchTerm={page.searchTerm}
				statusFilter={page.statusFilter}
				onSearchTermChange={page.setSearchTerm}
				onStatusFilterChange={page.setStatusFilter}
			/>

			<TransactionTypeTable
				isLoading={page.isLoading}
				transactionTypes={page.filteredTransactionTypes}
				onDelete={page.setPendingDeleteTransactionType}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDeleteTransactionType)}
				isPending={page.isMutating}
				title="Delete transaction type?"
				description={`This will remove ${page.pendingDeleteTransactionType?.description ?? "the selected transaction type"}.`}
				confirmLabel="Delete Transaction Type"
				tone="danger"
				onCancel={() => page.setPendingDeleteTransactionType(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
