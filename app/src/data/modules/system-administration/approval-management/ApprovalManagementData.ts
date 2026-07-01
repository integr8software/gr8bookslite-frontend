import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementModuleOption,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalWorkflowFeatures,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

export const ApprovalApproverOptions: ApprovalApproverOption[] =
	UserListMockData.filter((user) => user.status === "Active").map((user) => ({
		email: user.email,
		id: user.id,
		name: user.name,
		role: user.userRole,
		status: user.status,
	}));

const DefaultApprovalWorkflowFeatures: ApprovalWorkflowFeatures = {
	autoReminders: true,
	escalationRules: false,
	makerCheckerApproval: true,
	multiLevelApproval: true,
	slaMonitoring: false,
};

const DefaultApprovalLevelNames = [
	"Preparer Review",
	"Finance Review",
	"Management Approval",
	"Executive Approval",
	"Board Approval",
];

export const MockApprovalManagementWorkflows: ApprovalManagementRecord[] = [
	{
		id: "approval-dv",
		moduleCode: "DV",
		moduleName: "Disbursement Voucher",
		stageCount: 2,
		stages: [
			{
				id: "approval-dv-stage-1",
				sequence: 1,
				name: "Finance Review",
				approverIds: ["usr-003", "usr-009"],
				requirement: "any",
			},
			{
				id: "approval-dv-stage-2",
				sequence: 2,
				name: "Management Approval",
				approverIds: ["usr-001"],
				requirement: "all",
			},
		],
		routingRules: [
			{
				id: "approval-dv-route-1",
				sequence: 1,
				name: "Standard vouchers",
				basis: "default",
				amountOperator: "greaterThan",
				amountValue: "",
				amountValueTo: "",
				stageIds: ["approval-dv-stage-1"],
			},
			{
				id: "approval-dv-route-2",
				sequence: 2,
				name: "High value vouchers",
				basis: "amount",
				amountOperator: "greaterThan",
				amountValue: "100000",
				amountValueTo: "",
				stageIds: ["approval-dv-stage-1", "approval-dv-stage-2"],
			},
		],
		workflowFeatures: {
			...DefaultApprovalWorkflowFeatures,
			escalationRules: true,
			slaMonitoring: true,
		},
		status: "Active",
		description:
			"Disbursement vouchers use finance review by default and add management approval above the transaction limit.",
		updatedAt: "2026-05-22T08:35:00.000Z",
	},
	{
		id: "approval-pr",
		moduleCode: "PR",
		moduleName: "Purchase Request",
		stageCount: 3,
		stages: [
			{
				id: "approval-pr-stage-1",
				sequence: 1,
				name: "Department Review",
				approverIds: ["usr-002", "usr-008"],
				requirement: "any",
			},
			{
				id: "approval-pr-stage-2",
				sequence: 2,
				name: "Budget Check",
				approverIds: ["usr-003", "usr-009"],
				requirement: "all",
			},
			{
				id: "approval-pr-stage-3",
				sequence: 3,
				name: "Final Approval",
				approverIds: ["usr-001"],
				requirement: "all",
			},
		],
		routingRules: [
			{
				id: "approval-pr-route-1",
				sequence: 1,
				name: "Standard purchase request",
				basis: "default",
				amountOperator: "greaterThan",
				amountValue: "",
				amountValueTo: "",
				stageIds: ["approval-pr-stage-1", "approval-pr-stage-2"],
			},
			{
				id: "approval-pr-route-2",
				sequence: 2,
				name: "PO over 100k",
				basis: "amount",
				amountOperator: "greaterThan",
				amountValue: "100000",
				amountValueTo: "",
				stageIds: [
					"approval-pr-stage-1",
					"approval-pr-stage-2",
					"approval-pr-stage-3",
				],
			},
		],
		workflowFeatures: {
			...DefaultApprovalWorkflowFeatures,
			escalationRules: true,
		},
		status: "Active",
		description:
			"Purchase requests pass through request and budget review, with final approval for amounts over 100k.",
		updatedAt: "2026-05-21T15:10:00.000Z",
	},
	{
		id: "approval-jv",
		moduleCode: "JV",
		moduleName: "Journal Voucher",
		stageCount: 1,
		stages: [
			{
				id: "approval-jv-stage-1",
				sequence: 1,
				name: "Accounting Approval",
				approverIds: ["usr-003", "usr-009"],
				requirement: "any",
			},
		],
		routingRules: [
			{
				id: "approval-jv-route-1",
				sequence: 1,
				name: "Standard journal voucher",
				basis: "default",
				amountOperator: "greaterThan",
				amountValue: "",
				amountValueTo: "",
				stageIds: ["approval-jv-stage-1"],
			},
		],
		workflowFeatures: {
			...DefaultApprovalWorkflowFeatures,
			escalationRules: false,
			multiLevelApproval: false,
			slaMonitoring: false,
		},
		status: "Inactive",
		description: "Previous journal voucher approval rule.",
		updatedAt: "2026-05-18T11:42:00.000Z",
	},
];

export function createApprovalManagementInitialFormValues(): ApprovalManagementFormValues {
	const stageCount = 2;
	const stages = createApprovalStagesForCount([], stageCount);

	return {
		moduleCode: "",
		stageCount,
		stages,
		routingRules: createDefaultApprovalRoutingRules(stages),
		workflowFeatures: createDefaultApprovalWorkflowFeatures(),
		status: "Active",
		description: "",
	};
}

export function createApprovalManagementFormValues(
	record: ApprovalManagementRecord,
): ApprovalManagementFormValues {
	const stages = record.stages.map((stage) => ({
		...stage,
		name: normalizeApprovalLevelName(stage.name, stage.sequence),
	}));

	return {
		moduleCode: record.moduleCode,
		stageCount: record.stageCount,
		stages,
		routingRules: syncApprovalRoutingRulesForStages(
			record.routingRules.map((rule) => ({
				...rule,
				stageIds: [...rule.stageIds],
			})),
			stages,
		),
		workflowFeatures: {
			...createDefaultApprovalWorkflowFeatures(),
			...record.workflowFeatures,
		},
		status: record.status,
		description: record.description,
	};
}

export function createApprovalStagesForCount(
	currentStages: ApprovalStageFormValues[],
	stageCount: number,
): ApprovalStageFormValues[] {
	return Array.from({ length: stageCount }, (_, index) => {
		const existingStage = currentStages[index];

		if (existingStage) {
			return {
				...existingStage,
				sequence: index + 1,
				name: normalizeApprovalLevelName(existingStage.name, index + 1),
			};
		}

		return createApprovalStage(index + 1);
	});
}

export function createApprovalRoutingRule(
	sequence: number,
	stages: ApprovalStageFormValues[],
	overrides: Partial<ApprovalRoutingRuleFormValues> = {},
): ApprovalRoutingRuleFormValues {
	const basis = overrides.basis ?? (sequence === 1 ? "default" : "amount");
	const isDefaultRoute = basis === "default";

	return {
		id: `approval-route-${Date.now()}-${sequence}`,
		sequence,
		name: isDefaultRoute ? "Otherwise" : `Condition ${sequence}`,
		basis,
		amountOperator: "greaterThan",
		amountValue: isDefaultRoute ? "" : "",
		amountValueTo: "",
		stageIds: stages.map((stage) => stage.id),
		...overrides,
	};
}

export function createDefaultApprovalRoutingRules(
	stages: ApprovalStageFormValues[],
) {
	return [
		createApprovalRoutingRule(1, stages, {
			basis: "default",
			name: "Otherwise",
		}),
	];
}

export function createStandardApprovalRoutingRules(
	routingRules: ApprovalRoutingRuleFormValues[],
	stages: ApprovalStageFormValues[],
) {
	const defaultRule =
		routingRules.find((rule) => rule.basis === "default") ??
		createApprovalRoutingRule(1, stages, {
			basis: "default",
			name: "Otherwise",
		});

	return syncApprovalRoutingRulesForStages(
		[
			{
				...defaultRule,
				amountValue: "",
				amountValueTo: "",
				basis: "default",
				name: defaultRule.name || "Otherwise",
			},
		],
		stages,
	);
}

export function createAmountConditionApprovalRoutingRules(
	routingRules: ApprovalRoutingRuleFormValues[],
	stages: ApprovalStageFormValues[],
) {
	const amountRules = routingRules.filter((rule) => rule.basis === "amount");

	if (!amountRules.length) {
		return syncApprovalRoutingRulesForStages(
			[
				createApprovalRoutingRule(1, stages, {
					basis: "amount",
					name: "Condition 1",
				}),
			],
			stages,
		);
	}

	return syncApprovalRoutingRulesForStages(
		amountRules.map((amountRule, index) => ({
			...amountRule,
			basis: "amount" as const,
			name: amountRule.name || `Condition ${index + 1}`,
		})),
		stages,
	);
}

export function syncApprovalRoutingRulesForStages(
	routingRules: ApprovalRoutingRuleFormValues[],
	stages: ApprovalStageFormValues[],
): ApprovalRoutingRuleFormValues[] {
	const stageIdSet = new Set(stages.map((stage) => stage.id));
	const fallbackStageIds = stages.slice(0, 1).map((stage) => stage.id);
	const rules = routingRules.length
		? routingRules
		: createDefaultApprovalRoutingRules(stages);

	return resequenceApprovalRoutingRules(
		rules.map((rule) => {
			const stageIds = rule.stageIds.filter((stageId) => stageIdSet.has(stageId));

			return {
				...rule,
				stageIds: stageIds.length ? stageIds : fallbackStageIds,
			};
		}).sort((first, second) => {
			if (first.basis === second.basis) {
				return first.sequence - second.sequence;
			}

			return first.basis === "default" ? 1 : -1;
		}),
	);
}

export function resequenceApprovalRoutingRules(
	routingRules: ApprovalRoutingRuleFormValues[],
) {
	return routingRules.map((rule, index) => ({
		...rule,
		sequence: index + 1,
		name:
			rule.name.trim() ||
			(rule.basis === "default" ? "Otherwise" : `Condition ${index + 1}`),
	}));
}

export function createApprovalManagementRecord(
	values: ApprovalManagementFormValues,
	moduleOptions: ApprovalManagementModuleOption[] = [],
): ApprovalManagementRecord {
	const moduleCode = values.moduleCode || "DV";
	const stages = normalizeApprovalStages(values.stages);

	return {
		id: `approval-${Date.now()}`,
		moduleCode,
		moduleName: getApprovalManagementModuleName(moduleCode, moduleOptions),
		stageCount: values.stageCount,
		stages,
		routingRules: normalizeApprovalRoutingRules(values.routingRules, stages),
		workflowFeatures: normalizeApprovalWorkflowFeatures(values.workflowFeatures),
		status: values.status,
		description: values.description.trim(),
		updatedAt: new Date().toISOString(),
	};
}

export function updateApprovalManagementRecord(
	record: ApprovalManagementRecord,
	values: ApprovalManagementFormValues,
	moduleOptions: ApprovalManagementModuleOption[] = [],
): ApprovalManagementRecord {
	const moduleCode = values.moduleCode || record.moduleCode;
	const stages = normalizeApprovalStages(values.stages);

	return {
		...record,
		moduleCode,
		moduleName: getApprovalManagementModuleName(moduleCode, moduleOptions),
		stageCount: values.stageCount,
		stages,
		routingRules: normalizeApprovalRoutingRules(values.routingRules, stages),
		workflowFeatures: normalizeApprovalWorkflowFeatures(values.workflowFeatures),
		status: values.status,
		description: values.description.trim(),
		updatedAt: new Date().toISOString(),
	};
}

export function getApprovalManagementModuleName(
	moduleCode: ApprovalManagementModuleCode,
	moduleOptions: ApprovalManagementModuleOption[] = [],
) {
	return (
		moduleOptions.find((option) => option.code === moduleCode)
			?.name ?? moduleCode
	);
}

function createDefaultApprovalWorkflowFeatures(): ApprovalWorkflowFeatures {
	return { ...DefaultApprovalWorkflowFeatures };
}

function createApprovalStage(sequence: number): ApprovalStageFormValues {
	return {
		id: `approval-stage-${Date.now()}-${sequence}`,
		sequence,
		name: getDefaultApprovalLevelName(sequence),
		approverIds: [],
		requirement: "any",
	};
}

function normalizeApprovalStages(stages: ApprovalStageFormValues[]) {
	return stages.map((stage, index) => ({
		...stage,
		sequence: index + 1,
		name: normalizeApprovalLevelName(stage.name, index + 1),
		approverIds: Array.from(new Set(stage.approverIds)),
	}));
}

function getDefaultApprovalLevelName(sequence: number) {
	return DefaultApprovalLevelNames[sequence - 1] ?? `Approval Level ${sequence}`;
}

function normalizeApprovalLevelName(name: string, sequence: number) {
	const trimmedName = name.trim();

	if (!trimmedName || /^stage\s+\d+$/i.test(trimmedName)) {
		return getDefaultApprovalLevelName(sequence);
	}

	return trimmedName;
}

function normalizeApprovalRoutingRules(
	routingRules: ApprovalRoutingRuleFormValues[],
	stages: ApprovalStageFormValues[],
) {
	const stageIdSet = new Set(stages.map((stage) => stage.id));

	return resequenceApprovalRoutingRules(routingRules).map((rule) => ({
		...rule,
		name: rule.name.trim(),
		amountValue: rule.amountValue.trim(),
		amountValueTo: rule.amountValueTo.trim(),
		stageIds: Array.from(new Set(rule.stageIds)).filter((stageId) =>
			stageIdSet.has(stageId),
		),
	}));
}

function normalizeApprovalWorkflowFeatures(
	workflowFeatures: ApprovalWorkflowFeatures,
) {
	return {
		...createDefaultApprovalWorkflowFeatures(),
		...workflowFeatures,
	};
}
