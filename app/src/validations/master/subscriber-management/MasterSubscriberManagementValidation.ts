import { z } from "zod";
import {
	MasterSubscriberManagementBranchStatusOptions,
	MasterSubscriberManagementBranchTypeOptions,
	MasterSubscriberManagementStatusOptions,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import type {
	MasterSubscriberManagementBranchFormErrors,
	MasterSubscriberManagementBranchFormValues,
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

const MasterSubscriberManagementBranchFormSchema = z
	.object({
		address: RequiredText,
		contactNumber: RequiredText,
		email: z.string().trim().email("Enter a valid email."),
		isMain: z.boolean(),
		linkedMainBranchId: z.string(),
		name: RequiredText.min(2, "Branch name is too short."),
		status: z.enum(MasterSubscriberManagementBranchStatusOptions, {
			error: "Select a branch status.",
		}),
		tin: RequiredText,
		type: z.enum(MasterSubscriberManagementBranchTypeOptions, {
			error: "Select a branch type.",
		}),
	})
	.superRefine((values, context) => {
		if (values.type === "Satellite" && !values.linkedMainBranchId) {
			context.addIssue({
				code: "custom",
				message: "Select the main branch this satellite belongs to.",
				path: ["linkedMainBranchId"],
			});
		}
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

export function validateMasterSubscriberManagementBranchForm(
	values: MasterSubscriberManagementBranchFormValues,
): MasterSubscriberManagementBranchFormErrors {
	const result = MasterSubscriberManagementBranchFormSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<MasterSubscriberManagementBranchFormErrors>(
		(errors, issue) => {
			const field = String(
				issue.path[0] ?? "form",
			) as keyof MasterSubscriberManagementBranchFormErrors;

			if (!errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
}
