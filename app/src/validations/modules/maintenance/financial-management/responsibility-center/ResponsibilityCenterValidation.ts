import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

export function validateResponsibilityCenterForm(
	values: ResponsibilityCenterFormValues,
	centers: ResponsibilityCenter[],
	currentCenterId?: string,
) {
	const errors: ResponsibilityCenterFormErrors = {};
	const normalizedCode = normalizeResponsibilityCenterCode(values.code);
	const normalizedName = values.name.trim().toLowerCase();

	if (!normalizedCode) {
		errors.code = "Code is required.";
	}

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (!values.manager.trim()) {
		errors.manager = "Manager is required.";
	}

	if (values.parentId === currentCenterId) {
		errors.parentId = "A center cannot report to itself.";
	}

	if (
		normalizedCode &&
		centers.some(
			(center) =>
				center.id !== currentCenterId &&
				center.code.toUpperCase() === normalizedCode,
		)
	) {
		errors.code = "Code already exists.";
	}

	if (
		normalizedName &&
		centers.some(
			(center) =>
				center.id !== currentCenterId &&
				center.name.trim().toLowerCase() === normalizedName,
		)
	) {
		errors.name = "Name already exists.";
	}

	return errors;
}

function normalizeResponsibilityCenterCode(value: string) {
	return value.trim().replace(/\s+/g, "-").toUpperCase();
}
