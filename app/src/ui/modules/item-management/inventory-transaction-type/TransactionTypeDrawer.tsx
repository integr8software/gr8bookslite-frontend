"use client";

import {
	TransactionTypeActionCopy,
	TransactionTypeDrawerFormId,
	TransactionTypeParentLabel,
} from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import { useTransactionTypeActionPage } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionTypeActionPage";
import type { TransactionTypeDrawerProps } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { TransactionTypeForm } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeForm";

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
		<ModuleDrawer
			description={copy.description}
			eyebrow={TransactionTypeParentLabel}
			formId={TransactionTypeDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isMutating}
			onBeforeSaveConfirm={page.validateBeforeSubmit}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(mode)}
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
					onStatusChange={page.handleStatusChange}
				/>
			</form>
		</ModuleDrawer>
	);
}


