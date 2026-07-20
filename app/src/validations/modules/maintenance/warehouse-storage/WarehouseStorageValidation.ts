import { z } from "zod";
import { WarehouseStorageStatusOptions } from "@/app/src/constants/modules/maintenance/warehouse-storage/WarehouseStorageConstants";
import type {
	WarehouseStorageFormValues,
	WarehouseStorageSetup,
} from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";

export const WarehouseStorageFormValidationSchema = z.object({
	aisle: z.string().trim().optional(),
	binNo: z.string().trim().optional(),
	capacity: z.string().trim().optional(),
	capacityUom: z.string().trim().optional(),
	locationCode: z.string().trim().optional(),
	locationName: z.string().trim().optional(),
	locationType: z.string().trim().optional(),
	notes: z.string().trim().optional(),
	rackNo: z.string().trim().optional(),
	room: z.string().trim().optional(),
	shelfNo: z.string().trim().optional(),
	status: z.enum(WarehouseStorageStatusOptions),
	temperatureZone: z.string().trim().optional(),
	warehouseId: z.string().trim().min(1, "Select a warehouse."),
	zone: z.string().trim().optional(),
});

export function validateWarehouseStorageForm(
	values: WarehouseStorageFormValues,
	options?: {
		existingCodes?: string[];
		setup?: WarehouseStorageSetup;
	},
) {
	const result = WarehouseStorageFormValidationSchema.safeParse(values);
	const errors: Partial<Record<keyof WarehouseStorageFormValues, string>> = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as keyof WarehouseStorageFormValues | undefined;

			if (field) {
				errors[field] = issue.message;
			}
		});
	}

	if (!values.locationCode?.trim() && !values.locationName?.trim()) {
		errors.locationCode = "Enter a storage code or location name.";
		errors.locationName = "Enter a location name or storage code.";
	}

	options?.setup?.requiredFields.forEach((field) => {
		if (!values[field]?.trim()) {
			errors[field] = `Enter ${getStructureFieldLabel(field).toLowerCase()}.`;
		}
	});

	const normalizedCode = values.locationCode?.trim().toLowerCase();

	if (normalizedCode && options?.existingCodes?.some((code) => code.trim().toLowerCase() === normalizedCode)) {
		errors.locationCode = "Storage code already exists in this warehouse.";
	}

	return errors;
}

function getStructureFieldLabel(field: keyof WarehouseStorageFormValues) {
	switch (field) {
		case "rackNo":
			return "rack";
		case "shelfNo":
			return "level or shelf";
		case "binNo":
			return "bin";
		case "temperatureZone":
			return "temperature zone";
		default:
			return field;
	}
}
