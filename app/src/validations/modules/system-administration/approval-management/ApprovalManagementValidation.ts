import { z } from "zod";
import type {
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalStageFormErrors,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

const ApprovalStageSchema = z.object({
	id: z.string().min(1),
	sequence: z.number().int().positive(),
	name: z.string().trim().min(1, "Stage name is required."),
	approverIds: z.array(z.string()).min(1, "Select at least one approver."),
	requirement: z.enum(["any", "all"]),
});

export const ApprovalManagementFormSchema = z
	.object({
		moduleCode: z
			.string()
			.min(1, "Select module.")
			.pipe(z.enum(["DV", "CR", "JV", "PR", "PO", "RR"])),
		stageCount: z
			.number()
			.int("Stage count must be a whole number.")
			.min(1, "Choose at least one approval stage.")
			.max(5, "Approval stages cannot exceed five."),
		stages: z.array(ApprovalStageSchema),
		status: z.enum(["Active", "Inactive"]),
		description: z.string().trim().max(180, "Description is too long."),
	})
	.superRefine((values, context) => {
		if (values.stages.length !== values.stageCount) {
			context.addIssue({
				code: "custom",
				message: "Stage count must match the approval stages.",
				path: ["stageCount"],
			});
		}

		values.stages.forEach((stage, index) => {
			const uniqueApproverIds = new Set(stage.approverIds);

			if (uniqueApproverIds.size !== stage.approverIds.length) {
				context.addIssue({
					code: "custom",
					message: "Remove duplicate approvers in this stage.",
					path: ["stages", index, "approverIds"],
				});
			}
		});
	});

type ValidateApprovalManagementFormInput = {
	currentRecordId?: string;
	existingRecords: ApprovalManagementRecord[];
	values: ApprovalManagementFormValues;
};

export function validateApprovalManagementForm({
	currentRecordId,
	existingRecords,
	values,
}: ValidateApprovalManagementFormInput): ApprovalManagementFormErrors {
	const errors: ApprovalManagementFormErrors = {};
	const result = ApprovalManagementFormSchema.safeParse(values);

	if (!result.success) {
		for (const issue of result.error.issues) {
			mapIssueToApprovalErrors(errors, issue, values);
		}
	}

	if (
		values.moduleCode &&
		values.status === "Active" &&
		existingRecords.some(
			(record) =>
				record.id !== currentRecordId &&
				record.status === "Active" &&
				record.moduleCode === values.moduleCode,
		)
	) {
		errors.moduleCode = "An active approval workflow already exists for this module.";
	}

	return errors;
}

function mapIssueToApprovalErrors(
	errors: ApprovalManagementFormErrors,
	issue: z.ZodIssue,
	values: ApprovalManagementFormValues,
) {
	const [field, stageIndex, stageField] = issue.path;

	if (field === "stages" && typeof stageIndex === "number") {
		const stage = values.stages[stageIndex];
		const stageId = stage?.id ?? String(stageIndex);
		const key = stageField as keyof ApprovalStageFormErrors;

		errors.stages = {
			...errors.stages,
			[stageId]: {
				...errors.stages?.[stageId],
				[key]: issue.message,
			},
		};
		return;
	}

	if (
		field === "moduleCode" ||
		field === "stageCount" ||
		field === "status" ||
		field === "description"
	) {
		errors[field] = issue.message;
	}
}
