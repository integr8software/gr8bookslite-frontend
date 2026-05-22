import { getPartyAtcCodeOptionsByClassification } from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import type {
	PartyInformationFormErrors,
	PartyInformationFormValues,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

export function validatePartyInformationForm(
	values: PartyInformationFormValues,
): PartyInformationFormErrors {
	const errors: PartyInformationFormErrors = {};

	if (!values.classification) {
		errors.classification = "Select a party classification first.";
	}

	if (values.classification && values.partyTypes.length === 0) {
		errors.partyTypes = "Select at least one party type.";
	}

	if (
		values.classification === "Non-Individual" &&
		!values.partyName.trim()
	) {
		errors.partyName = "Party name is required.";
	}

	if (values.classification === "Individual") {
		if (!values.firstName.trim()) {
			errors.firstName = "First name is required.";
		}

		if (!values.lastName.trim()) {
			errors.lastName = "Last name is required.";
		}
	}

	if (
		values.classification &&
		!isKnownAtcCodeForClassification(values.atcCode, values.classification)
	) {
		errors.atcCode = "Select a valid BIR ATC code from the list.";
	}

	if (values.email.trim() && !isValidEmail(values.email)) {
		errors.email = "Enter a valid email address.";
	}

	return errors;
}

export function isPartyInformationFormSubmittable(
	values: PartyInformationFormValues,
) {
	return Object.keys(validatePartyInformationForm(values)).length === 0;
}

function isKnownAtcCodeForClassification(
	value: string,
	classification: PartyInformationFormValues["classification"],
) {
	return getPartyAtcCodeOptionsByClassification(classification).some(
		(option) => option.code === value,
	);
}

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
