"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import toast from "react-hot-toast";
import {
	ApprovalManagementEditFromParam,
	ApprovalManagementEditFromViewQuery,
	ApprovalManagementEditFromViewValue,
	ApprovalManagementHref,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import {
	ApprovalApproverOptions,
	createAmountConditionApprovalRoutingRules,
	createApprovalManagementFormValues,
	createApprovalManagementInitialFormValues,
	createApprovalManagementRecord,
	createApprovalStagesForCount,
	createStandardApprovalRoutingRules,
	syncApprovalRoutingRulesForStages,
	updateApprovalManagementRecord,
} from "@/app/src/data/modules/system-administration/approval-management/ApprovalManagementData";
import type {
	ApprovalManagementActionMode,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalWorkflowFeatureKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import { validateApprovalManagementForm } from "@/app/src/validations/modules/system-administration/approval-management/ApprovalManagementValidation";
import { useApprovalManagementStore } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagement";

export function useApprovalManagementFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		addWorkflow,
		inactivateWorkflow,
		isMutating,
		updateWorkflow,
		workflows,
	} = useApprovalManagementStore();
	const mode = getActionMode(pathname);
	const existingWorkflow = workflows.find(
		(workflow) => workflow.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ApprovalManagementFormValues>(() =>
		existingWorkflow
			? createApprovalManagementFormValues(existingWorkflow)
			: createApprovalManagementInitialFormValues(),
	);
	const [errors, setErrors] = useState<ApprovalManagementFormErrors>({});
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(ApprovalManagementEditFromParam) ===
			ApprovalManagementEditFromViewValue;
	const viewHref = existingWorkflow
		? `${ApprovalManagementHref}/view/${existingWorkflow.id}`
		: ApprovalManagementHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : ApprovalManagementHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : ApprovalManagementHref;
	const editHref = existingWorkflow
		? `${ApprovalManagementHref}/edit/${existingWorkflow.id}?${ApprovalManagementEditFromViewQuery}`
		: undefined;

	function updateField<TKey extends keyof ApprovalManagementFormValues>(
		field: TKey,
		value: ApprovalManagementFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			if (field === "stageCount") {
				const stageCount = Number(value);
				const stages = createApprovalStagesForCount(current.stages, stageCount);

				return {
					...current,
					stageCount,
					stages,
					routingRules: syncApprovalRoutingRulesForStages(
						current.routingRules,
						stages,
					),
				};
			}

			return {
				...current,
				[field]: value,
			};
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, value } = event.target;

		if (name === "stageCount") {
			updateField("stageCount", Number(value));
			return;
		}

		updateField(name as keyof ApprovalManagementFormValues, value as never);
	}

	function handleModuleCodeChange(moduleCode: ApprovalManagementModuleCode) {
		updateField("moduleCode", moduleCode);
	}

	function updateStageField<TKey extends keyof ApprovalStageFormValues>(
		stageId: string,
		field: TKey,
		value: ApprovalStageFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			stages: current.stages.map((stage) =>
				stage.id === stageId ? { ...stage, [field]: value } : stage,
			),
		}));
		setErrors((current) => clearStageError(current, stageId, field));
	}

	function updateAmountConditionMode(hasAmountCondition: boolean) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			routingRules: hasAmountCondition
				? createAmountConditionApprovalRoutingRules(
						current.routingRules,
						current.stages,
					)
				: createStandardApprovalRoutingRules(
						current.routingRules,
						current.stages,
					),
		}));
		setErrors((current) => ({
			...current,
			routingRules: undefined,
		}));
	}

	function updateRoutingRuleField<
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextValues = {
				...current,
				routingRules: current.routingRules.map((rule) => {
					if (rule.id !== routingRuleId) {
						return rule;
					}

					if (field === "basis" && value === "default") {
						return rule;
					}

					return { ...rule, [field]: value };
				}),
			};

			setErrors(
				validateApprovalManagementForm({
					currentRecordId: existingWorkflow?.id,
					existingRecords: workflows,
					values: nextValues,
				}),
			);

			return nextValues;
		});
	}

	function toggleRoutingRuleStage(routingRuleId: string, stageId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			routingRules: current.routingRules.map((rule) => {
				if (rule.id !== routingRuleId) {
					return rule;
				}

				const hasStage = rule.stageIds.includes(stageId);

				return {
					...rule,
					stageIds: hasStage
						? rule.stageIds.filter((currentStageId) => currentStageId !== stageId)
						: [...rule.stageIds, stageId],
				};
			}),
		}));
		setErrors((current) =>
			clearRoutingRuleError(current, routingRuleId, "stageIds"),
		);
	}

	function updateWorkflowFeature(
		feature: ApprovalWorkflowFeatureKey,
		enabled: boolean,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			workflowFeatures: {
				...current.workflowFeatures,
				[feature]: enabled,
			},
		}));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateApprovalManagementForm({
			currentRecordId: existingWorkflow?.id,
			existingRecords: workflows,
			values,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted approval workflow fields.");
			return;
		}

		if (mode === "edit" && existingWorkflow) {
			updateWorkflow(updateApprovalManagementRecord(existingWorkflow, values));
			router.push(submitHref);
			return;
		}

		addWorkflow(createApprovalManagementRecord(values));
		router.push(ApprovalManagementHref);
	}

	function handleStatusChange() {
		if (!existingWorkflow) {
			return;
		}

		inactivateWorkflow(existingWorkflow.id);
		router.push(ApprovalManagementHref);
	}

	return {
		approverOptions: ApprovalApproverOptions,
		cancelHref,
		editHref,
		errors,
		existingWorkflow,
		hasAmountCondition: values.routingRules.some(
			(rule) => rule.basis === "amount",
		),
		handleInputChange,
		handleModuleCodeChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		toggleRoutingRuleStage,
		updateAmountConditionMode,
		updateField,
		updateRoutingRuleField,
		updateStageField,
		updateWorkflowFeature,
		values,
	};
}

function clearStageError<TKey extends keyof ApprovalStageFormValues>(
	errors: ApprovalManagementFormErrors,
	stageId: string,
	field: TKey,
): ApprovalManagementFormErrors {
	if (!errors.stages?.[stageId]) {
		return errors;
	}

	const nextStageErrors = {
		...errors.stages[stageId],
		[field]: undefined,
	};

	return {
		...errors,
		stages: {
			...errors.stages,
			[stageId]: nextStageErrors,
		},
	};
}

function clearRoutingRuleError<TKey extends keyof ApprovalRoutingRuleFormValues>(
	errors: ApprovalManagementFormErrors,
	routingRuleId: string,
	field: TKey,
): ApprovalManagementFormErrors {
	if (!errors.routingRules?.[routingRuleId]) {
		return errors;
	}

	const nextRoutingRuleErrors = {
		...errors.routingRules[routingRuleId],
		[field]: undefined,
	};

	return {
		...errors,
		routingRules: {
			...errors.routingRules,
			[routingRuleId]: nextRoutingRuleErrors,
		},
	};
}

function getActionMode(pathname: string): ApprovalManagementActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
