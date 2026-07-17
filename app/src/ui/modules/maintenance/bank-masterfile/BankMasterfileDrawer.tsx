"use client";

import {
	BankMasterfileActionCopy,
	BankMasterfileDrawerFormId,
	BankMasterfileTitle,
} from "@/app/src/constants/modules/maintenance/bank-masterfile/BankMasterfileConstants";
import { useBankMasterfileFormPage } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfileFormPage";
import type {
	BankMasterfile,
	BankMasterfileDrawerProps,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { BankMasterfileFields } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileFields";

export function BankMasterfileDrawer({
	bank,
	isOpen,
	mode,
	onClose,
}: BankMasterfileDrawerProps) {
	return (
		<BankMasterfileDrawerPanel
			key={`${mode}-${bank?.id ?? "new"}`}
			bank={bank}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
		/>
	);
}

function BankMasterfileDrawerPanel({
	bank,
	isOpen,
	mode,
	onClose,
}: {
	bank?: BankMasterfile;
	isOpen: boolean;
	mode: BankMasterfileDrawerProps["mode"];
	onClose: () => void;
}) {
	const page = useBankMasterfileFormPage({
		existingBank: bank,
		mode,
		onSaved: onClose,
	});
	const copy = BankMasterfileActionCopy[mode];
	const accountCode = mode === "add" ? page.nextAccountCode : (bank?.accountCode ?? "");

	return (
		<ModuleDrawer
			description={copy.description}
			eyebrow={BankMasterfileTitle}
			formId={BankMasterfileDrawerFormId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isSubmitting}
			onBeforeSaveConfirm={page.validateBeforeSubmit}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(mode)}
			submitLabel={mode === "edit" ? "Update Bank" : "Save Bank"}
			title={copy.title}
		>
			<form id={BankMasterfileDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
				<BankMasterfileFields
					accountCode={accountCode}
					errors={page.errors}
					isAccountCodeLoading={page.isNextAccountCodeLoading}
					isReadonly={page.isReadonly}
					mode={mode}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>
		</ModuleDrawer>
	);
}



