"use client";

import { Suspense } from "react";
import { usePartyManagementAction } from "@/app/src/hooks/modules/maintenance/party-management/party-management/usePartyManagementAction";
import { PartyInformationActionHeader } from "./PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "./PartyInformationDetailsFields";
import { PartyInformationNotFound } from "./PartyInformationNotFound";
import { PartyInformationPreview } from "./PartyInformationPreview";

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
				atcOptions={page.atcOptions}
				atcQuery={page.atcQuery}
				errors={page.errors}
				isClassificationSelected={page.isClassificationSelected}
				isReadonly={page.isReadonly}
				partyTypeOptions={page.partyTypeOptions}
				partyTypeQuery={page.partyTypeQuery}
				selectedAtcOption={page.selectedAtcOption}
				values={page.values}
				onAddressInputChange={page.handleAddressInputChange}
				onAtcQueryChange={page.handleAtcQueryChange}
				onInputChange={page.handleInputChange}
				onPartyTypeQueryChange={page.handlePartyTypeQueryChange}
				onRemovePartyType={page.removePartyType}
				onSelectAtcCode={page.selectAtcCode}
				onTogglePartyType={page.togglePartyType}
			/>
			<PartyInformationPreview
				submitPayload={page.submitPayload}
				values={page.values}
			/>
		</form>
	);
}
