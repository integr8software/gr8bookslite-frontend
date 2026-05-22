"use client";

import { Suspense } from "react";
import { usePartyManagementAction } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementAction";
import { PartyInformationActionHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationDetailsFields";
import { PartyInformationNotFound } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationNotFound";

export function PartyManagementAction() {
	return (
		<Suspense fallback={null}>
			<PartyManagementActionInner />
		</Suspense>
	);
}

function PartyManagementActionInner() {
	const page = usePartyManagementAction();

	if (page.needsRecord && !page.existingRecord) {
		return <PartyInformationNotFound />;
	}

	return (
		<form onSubmit={page.handleSubmit} noValidate className="grid gap-5">
			<PartyInformationActionHeader
				cancelHref={page.cancelHref}
				editHref={page.editHref}
				isReadonly={page.isReadonly}
				mode={page.mode}
			/>
			<PartyInformationDetailsFields
				addressOptions={page.addressOptions}
				atcOptions={page.atcOptions}
				errors={page.errors}
				isClassificationSelected={page.isClassificationSelected}
				isReadonly={page.isReadonly}
				partyTypeOptions={page.partyTypeOptions}
				values={page.values}
				onAddressInputChange={page.handleAddressInputChange}
				onInputChange={page.handleInputChange}
				onPartyTypesChange={page.handlePartyTypesChange}
				onSelectBarangay={page.selectBarangay}
				onSelectAtcCode={page.selectAtcCode}
				onSelectCityMunicipality={page.selectCityMunicipality}
				onSelectProvince={page.selectProvince}
				onSelectRegion={page.selectRegion}
				onUpdateField={page.updateField}
			/>
		</form>
	);
}
