import { z } from "zod";
import { ApprovalAmountConditionLimit } from "@/app/src/constants/modules/approval-management/ApprovalManagementConstants";
import type {
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormErrors,
	ApprovalStageFormErrors,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";

const ApprovalStageSchema = z.object({
	id: z.string().min(1),
	sequence: z.number().int().positive(),
	name: z.string().trim().min(1, "Level name is required."),
	approverIds: z.array(z.string()).min(1, "Select at least one approver."),
	requirement: z.enum(["any", "all"]),
});

const ApprovalRoutingRuleSchema = z
	.object({
		id: z.string().min(1),
		sequence: z.number().int().positive(),
		name: z.string().trim().min(1, "Route name is required."),
		basis: z.enum(["default", "amount"]),
		amountOperator: z.enum([
			"greaterThan",
			"greaterThanOrEqual",
			"lessThan",
			"lessThanOrEqual",
		]),
		amountValue: z.string(),
		stageIds: z.array(z.string()).min(1, "Choose at least one level for this route."),
	})
	.superRefine((rule, context) => {
		if (rule.basis === "amount") {
			const amount = parseCurrencyAmount(rule.amountValue);

			if (!amount || amount <= 0) {
				context.addIssue({
					code: "custom",
					message: "Enter a transaction amount greater than zero.",
					path: ["amountValue"],
				});
			}

		}
	});

export const ApprovalManagementFormSchema = z
	.object({
		moduleCode: z
			.string()
			.trim()
			.min(1, "Select module."),
		stageCount: z
			.number()
			.int("Stage count must be a whole number.")
			.min(1, "Choose at least one approval stage.")
			.max(5, "Approval stages cannot exceed five."),
		stages: z.array(ApprovalStageSchema),
		routingRules: z
			.array(ApprovalRoutingRuleSchema)
			.min(1, "Add at least one routing rule."),
		status: z.enum(["Active", "Inactive"]),
		description: z.string().trim().max(180, "Description is too long."),
	})
	.superRefine((values, context) => {
		if (values.stages.length !== values.stageCount) {
			context.addIssue({
				code: "custom",
				message: "Level count must match the approval levels.",
				path: ["stageCount"],
			});
		}

		values.stages.forEach((stage, index) => {
			const uniqueApproverIds = new Set(stage.approverIds);

			if (uniqueApproverIds.size !== stage.approverIds.length) {
				context.addIssue({
					code: "custom",
				message: "Remove duplicate approvers in this level.",
					path: ["stages", index, "approverIds"],
				});
			}
		});

		const amountRuleCount = values.routingRules.filter(
			(rule) => rule.basis === "amount",
		).length;

		if (amountRuleCount > ApprovalAmountConditionLimit) {
			context.addIssue({
				code: "custom",
				message: `Amount conditions cannot exceed ${ApprovalAmountConditionLimit}.`,
				path: ["routingRules", 0, "basis"],
			});
		}

		const amountRules = values.routingRules
			.map((rule, index) => ({ index, rule }))
			.filter(({ rule }) => rule.basis === "amount");
		amountRules.forEach(({ index, rule }, ruleIndex) => {
			const amount = parseCurrencyAmount(rule.amountValue);

			if (!amount || amount <= 0) {
				return;
			}

			const previousRule = amountRules[ruleIndex - 1]?.rule;
			const previousAmount = previousRule
				? parseCurrencyAmount(previousRule.amountValue)
				: 0;

			if (previousRule && previousAmount > 0 && amount >= previousAmount) {
				context.addIssue({
					code: "custom",
					message: `Amount must be less than ${previousRule.name || `Condition ${previousRule.sequence}`} (${formatCurrencyAmount(previousAmount)}).`,
					path: ["routingRules", index, "amountValue"],
				});
			}
		});

		const stageIds = new Set(values.stages.map((stage) => stage.id));

		values.routingRules.forEach((rule, index) => {
			const uniqueStageIds = new Set(rule.stageIds);

			if (uniqueStageIds.size !== rule.stageIds.length) {
				context.addIssue({
					code: "custom",
				message: "Remove duplicate levels from this route.",
					path: ["routingRules", index, "stageIds"],
				});
			}

			if (rule.stageIds.some((stageId) => !stageIds.has(stageId))) {
				context.addIssue({
					code: "custom",
				message: "Choose levels that still exist in this workflow.",
					path: ["routingRules", index, "stageIds"],
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
	const [field, itemIndex, itemField] = issue.path;

	if (field === "stages" && typeof itemIndex === "number") {
		const stage = values.stages[itemIndex];
		const stageId = stage?.id ?? String(itemIndex);
		const key = itemField as keyof ApprovalStageFormErrors;

		errors.stages = {
			...errors.stages,
			[stageId]: {
				...errors.stages?.[stageId],
				[key]: issue.message,
			},
		};
		return;
	}

	if (field === "routingRules" && typeof itemIndex === "number") {
		const routingRule = values.routingRules[itemIndex];
		const routingRuleId = routingRule?.id ?? String(itemIndex);
		const key = itemField as keyof ApprovalRoutingRuleFormErrors;

		errors.routingRules = {
			...errors.routingRules,
			[routingRuleId]: {
				...errors.routingRules?.[routingRuleId],
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

function parseCurrencyAmount(value: string) {
	const amount = Number(value.replaceAll(",", "").trim());

	return Number.isFinite(amount) ? amount : 0;
}

function formatCurrencyAmount(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(amount);
}
