"use client";

import {
	TransactionTypeActionCopy,
	TransactionTypeDrawerFormId,
	TransactionTypeParentLabel,
} from "@/app/src/constants/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeConstants";
import { useTransactionTypeActionPage } from "@/app/src/hooks/modules/maintenance/item-management/inventory-transaction-type/useTransactionTypeActionPage";
import type { TransactionTypeDrawerProps } from "@/app/src/types/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { TransactionTypeForm } from "@/app/src/ui/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeForm";

export function TransactionTypeDrawer(props: TransactionTypeDrawerProps) {
	return (
		<TransactionTypeDrawerPanel
			key={`${props.mode}-${props.transactionType?.id ?? "new"}`}
			{...props}
		/>
	);
}

function TransactionTypeDrawerPanel({
	isOpen,
	mode,
	onClose,
	transactionType,
}: TransactionTypeDrawerProps) {
	const page = useTransactionTypeActionPage({
		existingTransactionType: transactionType,
		mode,
		onSaved: onClose,
	});
	const copy = TransactionTypeActionCopy[mode];

	return (
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow={TransactionTypeParentLabel}
			formId={TransactionTypeDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isMutating}
			onClose={onClose}
			title={copy.title}
		>
			<form
				id={TransactionTypeDrawerFormId}
				onSubmit={page.handleSubmit}
				className="px-6 py-5"
			>
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
		</MaintenanceFormDrawer>
	);
}
