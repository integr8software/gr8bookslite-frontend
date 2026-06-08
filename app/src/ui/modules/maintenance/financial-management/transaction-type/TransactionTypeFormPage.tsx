"use client";

import { Edit3 } from "lucide-react";
import { TransactionTypeActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeActionPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { TransactionTypeForm } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeForm";
import { TransactionTypeFormActions } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeFormActions";
import { TransactionTypeNotFound } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeNotFound";

export function TransactionTypeFormPage() {
	const page = useTransactionTypeActionPage();
	const copy = TransactionTypeActionCopy[page.mode];

	if (page.needsRecord && !page.existingTransactionType) {
		return <TransactionTypeNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<TransactionTypeFormActions
							isReadonly={page.isReadonly}
							mode={page.mode}
							transactionType={page.existingTransactionType}
						/>
					}
				/>

				<TransactionTypeForm
					accountOptions={page.accountOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					moduleOptions={page.moduleOptions}
					values={page.values}
					onAccountChange={page.handleAccountChange}
					onInputChange={page.handleInputChange}
					onModuleChange={page.handleModuleChange}
				/>
			</form>
		</>
	);
}
