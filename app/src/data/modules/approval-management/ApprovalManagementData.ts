import type {
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementModuleOption,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";

export function createApprovalManagementInitialFormValues(): ApprovalManagementFormValues {
	return {
		moduleCode: "",
		stageCount: 0,
		stages: [],
		routingRules: [],
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
	return `Approval Level ${sequence}`;
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
		stageIds: Array.from(new Set(rule.stageIds)).filter((stageId) =>
			stageIdSet.has(stageId),
		),
	}));
}

