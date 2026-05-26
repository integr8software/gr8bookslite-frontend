import { z } from "zod";
import {
	WarehouseAccessLevelOptions,
	WarehouseAccessPermissionOptions,
	WarehouseBranchAvailabilityOptions,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseAccessFormErrors,
	WarehouseAccessRecord,
	WarehouseFormErrors,
	WarehouseFormValues,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export const WarehouseFormValidationSchema = z.object({
	name: z.string().trim().min(1, "Enter a warehouse name."),
	branchName: z.string().trim().min(1, "Enter a branch."),
	availability: z.enum(WarehouseBranchAvailabilityOptions),
	availableBranches: z.array(z.string()).optional(),
	managerName: z.string().trim().min(1, "Enter a warehouse manager."),
	status: z.enum(["Active", "Inactive"]),
	address: z.string().trim().min(1, "Enter the warehouse address."),
	contactNo: z.string().trim().min(1, "Enter a contact number."),
	description: z.string().trim().optional(),
}).superRefine((values, context) => {
	if (
		values.availability === "Selected Branches" &&
		(!values.availableBranches || values.availableBranches.length === 0)
	) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Select at least one branch.",
			path: ["availableBranches"],
		});
	}
});

export const WarehouseAccessRecordValidationSchema = z.object({
	id: z.string(),
	userName: z.string().trim().min(1, "Enter a person."),
	role: z.string().trim().min(1, "Enter a role."),
	accessLevel: z.enum(WarehouseAccessLevelOptions),
	permissions: z
		.array(z.enum(WarehouseAccessPermissionOptions))
		.min(1, "Select at least one permission."),
	status: z.enum(["Active", "Inactive"]),
});

export function validateWarehouseForm(values: WarehouseFormValues) {
	const result = WarehouseFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<WarehouseFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof WarehouseFormErrors | undefined;

		if (field) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

export function validateWarehouseAccess(records: WarehouseAccessRecord[]) {
	const result = z.array(WarehouseAccessRecordValidationSchema).safeParse(records);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<WarehouseAccessFormErrors>(
		(errors, issue) => {
			const recordIndex = Number(issue.path[0]);
			const field = issue.path[1] as
				| keyof WarehouseAccessRecord
				| "permissions"
				| undefined;
			const record = records[recordIndex];

			if (!record || !field) {
				return errors;
			}

			errors[record.id] = {
				...errors[record.id],
				[field]: issue.message,
			};

			return errors;
		},
		{},
	);
}
