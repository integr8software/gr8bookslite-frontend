import { z } from "zod";
import { WarehouseTransferStatusOptions } from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import type { WarehouseTransferFormValues } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";

export const WarehouseTransferFormValidationSchema = z.object({
	approvedBy: z.string().trim().optional(),
	date: z.string().trim().min(1, "Enter a transfer date."),
	destinationWarehouse: z
		.string()
		.trim()
		.min(1, "Enter a destination warehouse."),
	referenceNumber: z.string().trim().min(1, "Enter a transfer number."),
	requestedBy: z.string().trim().min(1, "Enter the requester."),
	status: z.enum(WarehouseTransferStatusOptions),
	warehouseId: z.string().trim().min(1, "Select a source warehouse."),
});

export function validateWarehouseTransferForm(values: WarehouseTransferFormValues) {
	const result = WarehouseTransferFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<
		Partial<Record<keyof WarehouseTransferFormValues, string>>
	>((errors, issue) => {
		const field = issue.path[0] as keyof WarehouseTransferFormValues | undefined;

		if (field) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
