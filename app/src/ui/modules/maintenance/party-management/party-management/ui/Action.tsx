"use client";

import { Suspense } from "react";
import { usePartyManagementAction } from "@/app/src/hooks/modules/maintenance/party-management/party-management/usePartyManagementAction";
import { PartyInformationActionHeader } from "./PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "./PartyInformationDetailsFields";
import { PartyInformationNotFound } from "./PartyInformationNotFound";

export function PartyManagementPartyManagementAction() {
	return (
		<Suspense fallback={null}>
			<PartyManagementPartyManagementActionInner />
		</Suspense>
	);
}

function PartyManagementPartyManagementActionInner() {
	const page = usePartyManagementAction();

	if (page.needsRecord && !page.existingRecord) {
		return <PartyInformationNotFound />;
	}

	return (
		<form onSubmit={page.handleSubmit} className="grid gap-5">
			<PartyInformationActionHeader
				cancelHref={page.cancelHref}
				editHref={page.editHref}
				isReadonly={page.isReadonly}
				isSubmittable={page.isSubmittable}
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
			/>
		</form>
	);
}
