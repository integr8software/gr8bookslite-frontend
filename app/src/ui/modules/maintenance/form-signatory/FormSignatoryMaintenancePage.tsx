"use client";

import { useFormSignatoryMaintenancePage } from "@/app/src/hooks/modules/maintenance/form-signatory/useFormSignatoryMaintenancePage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { FormSignatoryHeader } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryHeader";
import { FormSignatoryMetrics } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryMetrics";
import { FormSignatoryNotFound } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryNotFound";
import { FormSignatorySignatureMaker } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatorySignatureMaker";
import { FormSignatoryTable } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryTable";

export function FormSignatoryMaintenancePage() {
	const page = useFormSignatoryMaintenancePage();

	if (page.isRecordMissing) {
		return <FormSignatoryNotFound />;
	}

	return (
		<section className="grid gap-5">
			<FormSignatoryHeader
				isEditing={page.isEditing}
				isSaving={page.isSaving}
				onClose={page.handleClose}
				onNew={page.handleNew}
				onSave={page.handleSave}
			/>
			<FormSignatoryMetrics
				eSignatureCount={page.visibleESignatureCount}
				signatoryCount={page.visibleSignatoryCount}
				signatureImageCount={page.visibleSignatureImageCount}
			/>
			<FormSignatoryTable
				branch={page.branch}
				branchOptions={page.branchOptions}
				currentSetupId={page.currentSetupId}
				deletingRowId={page.deletingRowId}
				handleAddRow={page.handleAddRow}
				handleDeleteRow={page.handleDeleteRow}
				handleReset={page.handleReset}
				handleSignatureFile={page.handleSignatureFile}
				isEditing={page.isEditing}
				isLoading={page.isLoading}
				isScopedRowEdit={page.isScopedRowEdit}
				maxRows={page.maxRows}
				module={page.module}
				moduleOptions={page.moduleOptions}
				rows={page.rows}
				setBranch={page.setBranch}
				setModule={page.setModule}
				setSignatoryFilterLabel={page.setSignatoryFilterLabel}
				setPendingClearSignatureRow={page.setPendingClearSignatureRow}
				setSignatureMakerRow={page.setSignatureMakerRow}
				showSignatureValidityColumn={page.showSignatureValidityColumn}
				signatoryFilterLabel={page.signatoryFilterLabel}
				table={page.table}
				updateRow={page.updateRow}
			/>
			<FormSignatorySignatureMaker
				row={page.signatureMakerRow}
				onClose={() => page.setSignatureMakerRow(null)}
				onSave={page.handleSignatureMade}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingClearSignatureRow)}
				title="Clear signature image?"
				description={`This will remove the uploaded signature for ${page.pendingClearSignatureRow?.label ?? "this signatory"}.`}
				confirmLabel="Clear Signature"
				tone="danger"
				onCancel={() => page.setPendingClearSignatureRow(null)}
				onConfirm={page.confirmClearSignature}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingDeleteRow)}
				title="Delete signatory row?"
				description={`This will delete ${page.pendingDeleteRow?.name || page.pendingDeleteRow?.label || "this signatory row"}.`}
				confirmLabel="Delete Row"
				pendingLabel="Deleting..."
				isPending={Boolean(page.deletingRowId)}
				tone="danger"
				onCancel={() => page.setPendingDeleteRow(null)}
				onConfirm={page.confirmDeleteRow}
			/>
		</section>
	);
}
