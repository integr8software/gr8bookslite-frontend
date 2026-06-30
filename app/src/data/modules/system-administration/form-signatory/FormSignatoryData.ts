import { FormSignatoryLabelOptions } from "@/app/src/constants/modules/system-administration/form-signatory/FormSignatoryConstants";
import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

export function createDefaultFormSignatoryRows(): FormSignatoryRow[] {
	return [createEmptyFormSignatoryRow(0)];
}

export function createEmptyFormSignatoryRow(index: number): FormSignatoryRow {
	const label =
		FormSignatoryLabelOptions[index]?.value ?? `Signatory ${index + 1}`;

	return createSignatoryRow(
		`signatory-${Date.now().toString(36)}-${index + 1}`,
		label,
	);
}

function createSignatoryRow(
	id: string,
	label: string,
	name = "",
	position = "",
	signatureName = "",
	signaturePreview = "",
	signatureValidUntil = "",
	isThisTemporary: boolean | null = null,
): FormSignatoryRow {
	return {
		id,
		label,
		isThisTemporary,
		name,
		position,
		signatureName,
		signaturePreview,
		signatureValidUntil,
	};
}

