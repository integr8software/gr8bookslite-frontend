import { z } from "zod";
import {
	WarehouseAccessLevelOptions,
	WarehouseAccessPermissionOptions,
} from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import type {
	WarehouseAccessFormErrors,
	WarehouseAccessRecord,
} from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";

export const WarehouseAccessRecordValidationSchema = z.object({
	id: z.string(),
	userName: z.string().trim().min(1, "Enter a person."),
	accessLevel: z.enum(WarehouseAccessLevelOptions),
	permissions: z
		.array(z.enum(WarehouseAccessPermissionOptions))
		.min(1, "Select at least one permission."),
	status: z.enum(["Active", "Inactive"]),
});

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
