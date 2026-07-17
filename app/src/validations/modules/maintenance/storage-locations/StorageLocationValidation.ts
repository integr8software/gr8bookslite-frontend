import { z } from "zod";
import { StorageLocationStatusOptions } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import type { StorageLocationFormValues } from "@/app/src/types/modules/maintenance/storage-locations/StorageLocationTypes";

export const StorageLocationFormValidationSchema = z.object({
	aisle: z.string().trim().min(1, "Enter an aisle."),
	binNo: z.string().trim().min(1, "Enter a bin number."),
	locationCode: z.string().trim().optional(),
	rackNo: z.string().trim().min(1, "Enter a rack number."),
	shelfNo: z.string().trim().min(1, "Enter a shelf number."),
	status: z.enum(StorageLocationStatusOptions),
	warehouseId: z.string().trim().min(1, "Select a warehouse."),
	zone: z.string().trim().min(1, "Enter a zone."),
});

export function validateStorageLocationForm(values: StorageLocationFormValues) {
	const result = StorageLocationFormValidationSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<
		Partial<Record<keyof StorageLocationFormValues, string>>
	>((errors, issue) => {
		const field = issue.path[0] as keyof StorageLocationFormValues | undefined;

		if (field) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
