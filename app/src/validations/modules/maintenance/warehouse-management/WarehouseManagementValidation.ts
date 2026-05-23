import { z } from "zod";
import type {
	WarehouseFormErrors,
	WarehouseFormValues,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export const WarehouseFormValidationSchema = z.object({
	code: z.string().trim().min(1, "Enter a warehouse code."),
	name: z.string().trim().min(1, "Enter a warehouse name."),
	branchName: z.string().trim().min(1, "Enter a branch."),
	managerName: z.string().trim().min(1, "Enter a warehouse manager."),
	status: z.enum(["Active", "Inactive"]),
	address: z.string().trim().min(1, "Enter the warehouse address."),
	contactNo: z.string().trim().min(1, "Enter a contact number."),
	description: z.string().trim().optional(),
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

