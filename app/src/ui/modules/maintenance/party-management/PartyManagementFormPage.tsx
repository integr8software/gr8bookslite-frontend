"use client";

import { Suspense } from "react";
import { getPartyDisplayName } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementAction } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementAction";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PartyInformationActionHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
import { PartyInformationNotFound } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationNotFound";

export function PartyManagementFormPage() {
	return (
		<Suspense fallback={null}>
			<PartyManagementFormPageInner />
		</Suspense>
	);
}

function PartyManagementFormPageInner() {
	const page = usePartyManagementAction();

	if (page.needsRecord && !page.existingRecord) {
		return <PartyInformationNotFound />;
	}

	const partyName = page.existingRecord
		? getPartyDisplayName(page.existingRecord)
		: undefined;

	return (
		<>
			<form onSubmit={page.handleSubmit} noValidate className="grid gap-5">
				<PartyInformationActionHeader
					canSave={page.canSave}
					cancelHref={page.cancelHref}
					editHref={page.editHref}
					isReadonly={page.isReadonly}
					mode={page.mode}
					nextStatus={page.existingRecord ? page.nextStatus : undefined}
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
				isOpen={page.isStatusDialogOpen}
				isPending={page.isMutating}
				title={`Set party as ${page.nextStatus.toLowerCase()}?`}
				description={`This will mark ${partyName ?? "the selected party"} as ${page.nextStatus.toLowerCase()}.`}
				confirmLabel={
					page.nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
				}
				tone={page.nextStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => page.setIsStatusDialogOpen(false)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</>
	);
}
