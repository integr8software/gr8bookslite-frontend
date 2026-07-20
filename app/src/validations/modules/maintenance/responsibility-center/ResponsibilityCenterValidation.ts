import { z } from "zod";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { normalizeCodeWithHyphens } from "@/app/src/utils/string.util";

const ResponsibilityCenterCategorySchema = z.enum(
	[
		"Corporate",
		"Division",
		"Department",
		"Section",
		"Team",
		"Branch",
		"Building",
		"Project",
		"Business Unit",
		"Region",
		"Salesman",
		"Warehouse",
		"Outlet",
		"Sales Territory",
		"Fleet",
	],
	{ message: "Type is required." },
);

const ResponsibilityCenterFinancialTypeSchema = z.enum(
	[
		"Cost Center",
		"Revenue Center",
		"Profit Center",
		"Investment Center",
	],
	{ message: "Classification is required." },
);

const ResponsibilityCenterStatusSchema = z.enum(["Active", "Inactive"], {
	message: "Status is required.",
});

export const ResponsibilityCenterFormValidationSchema = z.object({
	code: z.string(),
	name: z.string().trim().min(1, "Name is required."),
	classificationId: z.string().trim().min(1, "Classification is required."),
	typeId: z.string().trim().min(1, "Type is required."),
	category: ResponsibilityCenterCategorySchema,
	financialType: ResponsibilityCenterFinancialTypeSchema,
	manager: z.string(),
	parentId: z.string(),
	status: ResponsibilityCenterStatusSchema,
	description: z.string(),
});

export function validateResponsibilityCenterForm(
	values: ResponsibilityCenterFormValues,
	centers: ResponsibilityCenter[],
	currentCenterId?: string,
) {
	const result = ResponsibilityCenterFormValidationSchema.safeParse(values);
	const errors: ResponsibilityCenterFormErrors = result.success
		? {}
		: mapResponsibilityCenterIssues(result.error.issues);
	const normalizedCode = normalizeCodeWithHyphens(values.code, {
		case: "upper",
	});
	const normalizedName = values.name.trim().toLowerCase();

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

function mapResponsibilityCenterIssues(issues: z.ZodIssue[]) {
	return issues.reduce<ResponsibilityCenterFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof ResponsibilityCenterFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
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
