import { z } from "zod";
import type {
	WarehouseFormErrors,
	WarehouseFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export const WarehouseFormValidationSchema = z.object({
	code: z.string().trim().min(1, "Enter a warehouse code."),
	name: z.string().trim().min(1, "Enter a warehouse name."),
	availableBranches: z.array(z.string()).min(1, "Select at least one branch."),
	managerName: z.string().trim().min(1, "Enter a warehouse manager."),
	status: z.enum(["Active", "Inactive"]),
	address: z.string().trim().min(1, "Enter the warehouse address."),
	contactNo: z.string().trim().min(1, "Enter a contact number."),
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer.")
		.optional(),
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
