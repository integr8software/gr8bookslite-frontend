import { z } from "zod";
import { MasterSubscriberManagementStatusOptions } from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import type {
	MasterSubscriberManagementFormErrors,
	MasterSubscriberManagementFormValues,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";

const RequiredText = z.string().trim().min(1, "Required.");

const MasterSubscriberManagementFormSchema = z.object({
	contactNumber: RequiredText,
	email: z.string().trim().email("Enter a valid email."),
	name: RequiredText.min(2, "Subscriber name is too short."),
	status: z.enum(MasterSubscriberManagementStatusOptions, {
		error: "Select a subscriber status.",
	}),
});

export function validateMasterSubscriberManagementForm(
	values: MasterSubscriberManagementFormValues,
): MasterSubscriberManagementFormErrors {
	const result = MasterSubscriberManagementFormSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<MasterSubscriberManagementFormErrors>(
		(errors, issue) => {
			const field = String(
				issue.path[0] ?? "form",
			) as keyof MasterSubscriberManagementFormErrors;

			if (!errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
}
