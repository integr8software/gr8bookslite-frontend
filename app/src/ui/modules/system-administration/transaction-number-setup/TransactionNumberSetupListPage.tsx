"use client";

import { ReceiptText } from "lucide-react";
import { useTransactionNumberSetupListPage } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetupListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { TransactionNumberSetupCatalog } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupCatalog";
import { TransactionNumberSetupEditor } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupEditor";

export function TransactionNumberSetupListPage() {
	const page = useTransactionNumberSetupListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Transaction Number Setup"
				description="Select a transaction module, then update how its document numbers are created."
				eyebrow={
					<>
						<ReceiptText
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						System administration
					</>
				}
			/>

			<div className="grid overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm xl:min-h-152 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.2fr)]">
				<TransactionNumberSetupCatalog
					isLoading={page.isLoading}
					query={page.query}
					scopeFilter={page.scopeFilter}
					selectedSetupId={page.selectedSetupId}
					setups={page.setups}
					onQueryChange={page.handleQueryChange}
					onScopeFilterChange={page.handleScopeFilterChange}
					onSelectSetup={page.handleSelectSetup}
				/>

				<TransactionNumberSetupEditor
					branchOptions={page.branchOptions}
					errors={page.errors}
					isLoading={page.isLoading}
					isMutating={page.isMutating}
					nextNumberPreview={page.nextNumberPreview}
					selectedSetup={page.selectedSetup}
					values={page.values}
					onInputChange={page.handleInputChange}
					onSubmit={page.handleSubmit}
					onToggleBranch={page.toggleBranch}
				/>
			</div>
		</section>
	);
}
