"use client";

import { TransactionTypeActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeActionPage";
import type { TransactionType, TransactionTypeActionMode } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { TransactionTypeForm } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeForm";

const formId = "transaction-type-drawer-form";

export function TransactionTypeDrawer({ isOpen, mode, onClose, transactionType }: { isOpen: boolean; mode: TransactionTypeActionMode; onClose: () => void; transactionType?: TransactionType }) {
	return <TransactionTypeDrawerPanel key={`${mode}-${transactionType?.id ?? "new"}`} isOpen={isOpen} mode={mode} onClose={onClose} transactionType={transactionType} />;
}

function TransactionTypeDrawerPanel({ isOpen, mode, onClose, transactionType }: { isOpen: boolean; mode: TransactionTypeActionMode; onClose: () => void; transactionType?: TransactionType }) {
	const page = useTransactionTypeActionPage({ existingTransactionType: transactionType, mode, onSaved: onClose });
	const copy = TransactionTypeActionCopy[mode];
	return <MaintenanceFormDrawer description={copy.description} eyebrow="Accounting master data" formId={formId} isOpen={isOpen} isSaving={page.isMutating} onClose={onClose} title={copy.title}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5"><TransactionTypeForm errors={page.errors} isReadonly={false} values={page.values} onInputChange={page.handleInputChange} /></form>
	</MaintenanceFormDrawer>;
}
