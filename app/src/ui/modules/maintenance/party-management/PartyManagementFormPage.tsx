"use client";

import { Suspense, useState } from "react";
import { getPartyDisplayName } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementAction } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementAction";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PartyInformationActionHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
import { PartyInformationNotFound } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationNotFound";

const PartyManagementFormId = "party-management-form";

export function PartyManagementFormPage() {
	return (
		<Suspense fallback={null}>
			<PartyManagementFormPageInner />
		</Suspense>
	);
}

function PartyManagementFormPageInner() {
	const page = usePartyManagementAction();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: PartyManagementFormId,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: page.isMutating,
		onDialogOpenChange: setIsSaveDialogOpen,
	});

	if (page.needsRecord && !page.existingRecord) {
		return <PartyInformationNotFound />;
	}

	const partyName = page.existingRecord
		? getPartyDisplayName(page.existingRecord)
		: undefined;

	return (
		<>
			<form
				id={PartyManagementFormId}
				onSubmit={page.handleSubmit}
				noValidate
				className="grid gap-5"
			>
				<PartyInformationActionHeader
					canSave={page.canSave}
					cancelHref={page.cancelHref}
					editHref={page.editHref}
					isReadonly={page.isReadonly}
					mode={page.mode}
					nextStatus={page.existingRecord ? page.nextStatus : undefined}
					onSave={() => {
						if (page.validateBeforeSubmit()) {
							setIsSaveDialogOpen(true);
						}
					}}
					onStatusChange={
						page.existingRecord
							? () => page.setIsStatusDialogOpen(true)
							: undefined
					}
				/>
				<PartyInformationDetailsFields
					accountOptions={page.accountOptions}
					atcOptions={page.atcOptions}
					errors={page.errors}
					isClassificationSelected={page.isClassificationSelected}
					isPartyCodeReadonly={page.isPartyCodeReadonly}
					isReadonly={page.isReadonly}
					partyTypeOptions={page.partyTypeOptions}
					taxMaintenanceOptions={page.taxMaintenanceOptions}
					termOptions={page.termOptions}
					values={page.values}
					syncedAddressSources={page.syncedAddressSources}
					onAddressInputChange={page.handleAddressInputChange}
					onCopyAddress={page.copyAddress}
					onInputChange={page.handleInputChange}
					onPartyTypesChange={page.handlePartyTypesChange}
					onSelectBarangay={page.selectBarangay}
					onSelectAtcCode={page.selectAtcCode}
					onSelectVatRegistrationType={page.selectVatRegistrationType}
					onSelectAutocompleteAddress={page.selectAutocompleteAddress}
					onSyncAutocompleteAddressDetails={page.syncAutocompleteAddressDetails}
					onSelectCityMunicipality={page.selectCityMunicipality}
					onSelectProvince={page.selectProvince}
					onSelectTerm={page.selectTerm}
					onUpdateField={page.updateField}
				/>
			</form>

			<AppDialog
				confirmLabel="Confirm"
				description={
					page.mode === "edit"
						? "This will update the selected party with your latest changes."
						: "This will create a new party using the details you entered."
				}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title={page.mode === "edit" ? "Save party changes?" : "Save this party?"}
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>

			<AppDialog
				isOpen={page.isStatusDialogOpen}
				isPending={page.isMutating}
				title={`Set party as ${page.nextStatus.toLowerCase()}?`}
				description={`This will mark ${partyName ?? "the selected party"} as ${page.nextStatus.toLowerCase()}.`}
				confirmLabel={
					page.nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
				}
				tone={page.nextStatus === "Inactive" ? "deactivate" : "activate"}
				onCancel={() => page.setIsStatusDialogOpen(false)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</>
	);
}


