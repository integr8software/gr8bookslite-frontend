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
				onClose={page.handleClose}
				onNew={page.handleNew}
				onSave={page.handleSave}
			/>
			<FormSignatoryMetrics
				signatureImageCount={page.signatureImageCount}
				signatoryCount={page.rows.length}
			/>
			<FormSignatoryTable
				branch={page.branch}
				currentSetupId={page.currentSetupId}
				handleAddRow={page.handleAddRow}
				handleRemoveRow={page.handleRemoveRow}
				handleReset={page.handleReset}
				handleSignatureFile={page.handleSignatureFile}
				isEditing={page.isEditing}
				maxRows={page.maxRows}
				mode={page.mode}
				module={page.module}
				rows={page.rows}
				setBranch={page.setBranch}
				setModule={page.setModule}
				setPendingClearSignatureRow={page.setPendingClearSignatureRow}
				setSignatureMakerRow={page.setSignatureMakerRow}
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
		</section>
	);
}
