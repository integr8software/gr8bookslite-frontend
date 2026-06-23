import { SidebarModuleNavigationSections } from "@/app/src/data/shared/main-layout/sidebar/SidebarModuleRegistry";
import { FormSignatoryLabelOptions } from "@/app/src/constants/modules/system-administration/form-signatory/FormSignatoryConstants";
import type {
	FormSignatoryModuleOption,
	FormSignatoryRow,
} from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

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

export function getFallbackFormSignatoryModuleOptions(): FormSignatoryModuleOption[] {
	const options = new Map<string, FormSignatoryModuleOption>();

	for (const section of SidebarModuleNavigationSections) {
		collectModuleOptions(section.items, options);
	}

	return [...options.values()].sort((left, right) =>
		left.label.localeCompare(right.label),
	);
}

function collectModuleOptions(
	items: (typeof SidebarModuleNavigationSections)[number]["items"],
	options: Map<string, FormSignatoryModuleOption>,
) {
	for (const item of items) {
		if (item.module && item.key !== "system-administration-form-signatory") {
			options.set(item.key, {
				label: item.label,
				value: item.key,
			});
		}

		if (item.children) {
			collectModuleOptions(item.children, options);
		}
	}
}
