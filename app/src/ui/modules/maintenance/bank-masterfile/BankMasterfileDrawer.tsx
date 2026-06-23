"use client";

import {
	BankMasterfileActionCopy,
	BankMasterfileTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import { useBankMasterfileFormPage } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfileFormPage";
import type {
	BankMasterfile,
	BankMasterfileActionMode,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { BankMasterfileFields } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileFields";

const formId = "bank-masterfile-drawer-form";

export function BankMasterfileDrawer({
	bank,
	isOpen,
	mode,
	onClose,
}: {
	bank?: BankMasterfile;
	isOpen: boolean;
	mode: BankMasterfileActionMode;
	onClose: () => void;
}) {
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
	mode: BankMasterfileActionMode;
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
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow={BankMasterfileTitle}
			formId={formId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isSubmitting}
			onClose={onClose}
			savingLabel={mode === "edit" ? "Updating Bank..." : "Saving Bank..."}
			submitLabel={mode === "edit" ? "Update Bank" : "Save Bank"}
			title={copy.title}
		>
			<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5">
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
		</MaintenanceFormDrawer>
	);
}