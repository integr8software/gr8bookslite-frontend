import { z } from "zod";
import type {
	MasterBranchFormValues,
	MasterCompanyFormValues,
	MasterSubscriberFormValues,
	MasterTenantAccessFormErrors,
	MasterUserFormValues,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";

const RequiredText = z.string().trim().min(1, "Required.");
const OptionalText = z.string().trim();
const Email = z.string().trim().email("Enter a valid email.");

const MasterSubscriberSchema = z.object({
	contactNumber: RequiredText,
	initialCompanyEmail: Email,
	initialCompanyName: RequiredText.min(2, "Company name is too short."),
	initialCompanyTin: RequiredText,
	name: RequiredText.min(2, "Subscriber name is too short."),
	notes: OptionalText,
	ownerEmail: Email,
	ownerName: RequiredText.min(2, "Owner name is too short."),
	planName: RequiredText,
	status: RequiredText,
});

const MasterCompanySchema = z.object({
	address: RequiredText,
	contactNumber: RequiredText,
	defaultBranchName: RequiredText,
	email: Email,
	legalName: RequiredText.min(2, "Company name is too short."),
	planName: RequiredText,
	status: RequiredText,
	subscriberId: RequiredText,
	taxId: RequiredText,
	tradeName: OptionalText,
});

const MasterBranchSchema = z
	.object({
		address: RequiredText,
		branchType: RequiredText,
		companyId: RequiredText,
		contactNumber: RequiredText,
		email: Email,
		isMain: z.boolean(),
		linkedMainBranchId: OptionalText,
		name: RequiredText.min(2, "Branch name is too short."),
		status: RequiredText,
		tin: RequiredText,
	})
	.superRefine((values, context) => {
		if (values.branchType === "Satellite" && !values.linkedMainBranchId) {
			context.addIssue({
				code: "custom",
				message: "Select the main branch this satellite belongs to.",
				path: ["linkedMainBranchId"],
			});
		}
	});

const MasterUserSchema = z.object({
	assignments: z
		.array(
			z.object({
				branchIds: z.array(z.string()),
				companyId: RequiredText,
				role: RequiredText,
			}),
		)
		.min(1, "Assign at least one company."),
	contactNumber: RequiredText,
	email: Email,
	name: RequiredText.min(2, "User name is too short."),
	status: RequiredText,
	subscriberId: RequiredText,
});

export function validateMasterSubscriberForm(
	values: MasterSubscriberFormValues,
) {
	return mapZodIssues(MasterSubscriberSchema.safeParse(values));
}

export function validateMasterCompanyForm(values: MasterCompanyFormValues) {
	return mapZodIssues(MasterCompanySchema.safeParse(values));
}

export function validateMasterBranchForm(values: MasterBranchFormValues) {
	return mapZodIssues(MasterBranchSchema.safeParse(values));
}

export function validateMasterUserForm(values: MasterUserFormValues) {
	const errors = mapZodIssues(MasterUserSchema.safeParse(values));

	if (!errors.assignments) {
		const missingBranches = values.assignments.find(
			(assignment) => assignment.branchIds.length === 0,
		);

		if (missingBranches) {
			errors.assignments = "Select at least one branch for each company.";
		}
	}

	return errors;
}

function mapZodIssues(
	result: { success: true } | { error: z.ZodError; success: false },
): MasterTenantAccessFormErrors {
	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<MasterTenantAccessFormErrors>(
		(errors, issue) => {
			const field = String(issue.path[0] ?? "form");

			if (!errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
}
