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
	const normalizedCode = normalizeResponsibilityCenterCode(
		values.code || values.name,
	);
	const normalizedName = values.name.trim().toLowerCase();

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (!values.category) {
		errors.category = "Category is required.";
	}

	if (!values.financialType) {
		errors.financialType = "Financial responsibility type is required.";
	}

	if (!values.manager.trim()) {
		errors.manager = "Manager is required.";
	}

	if (!values.status) {
		errors.status = "Status is required.";
	}

	if (values.parentId === currentCenterId) {
		errors.parentId = "A center cannot report to itself.";
	}

	if (
		currentCenterId &&
		values.parentId &&
		createsCircularHierarchy(values.parentId, centers, currentCenterId)
	) {
		errors.parentId = "Parent center creates a circular hierarchy.";
	}

	if (
		normalizedCode &&
		centers.some(
			(center) =>
				center.id !== currentCenterId &&
				center.code.toUpperCase() === normalizedCode,
		)
	) {
		errors.name = "Name creates a duplicate code.";
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

function createsCircularHierarchy(
	parentId: string,
	centers: ResponsibilityCenter[],
	currentCenterId: string,
) {
	const centerById = new Map(centers.map((center) => [center.id, center]));
	let nextParentId: string | undefined = parentId;
	const visited = new Set<string>();

	while (nextParentId) {
		if (nextParentId === currentCenterId || visited.has(nextParentId)) {
			return true;
		}

		visited.add(nextParentId);
		nextParentId = centerById.get(nextParentId)?.parentId;
	}

	return false;
}
