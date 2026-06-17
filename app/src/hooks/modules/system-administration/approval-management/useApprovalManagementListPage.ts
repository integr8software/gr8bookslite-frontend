"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ApprovalAmountConditionLimit,
	ApprovalManagementTableColumns,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import {
	ApprovalApproverOptions,
	type ApprovalManagementModuleOption,
	createAmountConditionApprovalRoutingRules,
	createApprovalManagementFormValues,
	createApprovalManagementInitialFormValues,
	createApprovalManagementRecord,
	createApprovalRoutingRule,
	createApprovalStagesForCount,
	createStandardApprovalRoutingRules,
	syncApprovalRoutingRulesForStages,
	updateApprovalManagementRecord,
} from "@/app/src/data/modules/system-administration/approval-management/ApprovalManagementData";
import {
	createApproverNameById,
	formatApprovalApproverNames,
	formatApprovalRoutingFlow,
	formatApprovalWorkflowFeatures,
	formatApprovalWorkflowUpdatedAt,
} from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import type {
	ApprovalManagementRecord,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementStatus,
	ApprovalManagementTableColumnKey,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalWorkflowFeatureKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import { validateApprovalManagementForm } from "@/app/src/validations/modules/system-administration/approval-management/ApprovalManagementValidation";
import { useApprovalManagementStore } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagement";
import { useTransactionNumberSetupStore } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetup";

export function useApprovalManagementListPage() {
	const {
		addWorkflow,
		inactivateWorkflow,
		isLoading,
		isMutating,
		updateWorkflow,
		workflows,
	} = useApprovalManagementStore();
	const {
		isLoading: isModuleLoading,
		setups: transactionNumberSetups,
	} = useTransactionNumberSetupStore();
	const moduleOptions = useMemo<ApprovalManagementModuleOption[]>(() => {
		const sourceOptions = transactionNumberSetups.length
			? transactionNumberSetups.map((setup) => ({
					code: setup.moduleCode,
					name: setup.moduleName,
				}))
			: workflows.map((workflow) => ({
					code: workflow.moduleCode,
					name: workflow.moduleName,
				}));

		return sourceOptions
			.filter(
				(option, index, options) =>
					options.findIndex((current) => current.code === option.code) ===
					index,
			)
			.sort((first, second) => first.name.localeCompare(second.name));
	}, [transactionNumberSetups, workflows]);
	const workflowByModuleCode = useMemo(
		() => new Map(workflows.map((workflow) => [workflow.moduleCode, workflow])),
		[workflows],
	);
	const workflowRecords = useMemo(
		() =>
			moduleOptions.map((option) => {
				const workflow = workflowByModuleCode.get(option.code);

				if (workflow) {
					return workflow;
				}

				const defaultWorkflow = createApprovalManagementRecord(
					{
						...createApprovalManagementInitialFormValues(),
						moduleCode: option.code,
					},
					moduleOptions,
				);

				return {
					...defaultWorkflow,
					id: `approval-${option.code}`,
				};
			}),
		[moduleOptions, workflowByModuleCode],
	);
	const activeWorkflowCount = workflowRecords.filter(
		(workflow) => workflow.status === "Active",
	).length;
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
		() => workflowRecords[0]?.id ?? null,
	);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		ApprovalManagementStatus | "any"
	>("any");
	const [pendingInactiveWorkflow, setPendingInactiveWorkflow] =
		useState<ApprovalManagementRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "moduleName", desc: false },
	]);
	const selectedWorkflow =
		workflowRecords.find((workflow) => workflow.id === selectedWorkflowId) ??
		workflowRecords[0];
	const [values, setValues] = useState<ApprovalManagementFormValues>(() =>
		selectedWorkflow
			? createApprovalManagementFormValues(selectedWorkflow)
			: createApprovalManagementInitialFormValues(),
	);
	const [errors, setErrors] = useState<ApprovalManagementFormErrors>({});
	const approverNameById = useMemo(
		() => createApproverNameById(ApprovalApproverOptions),
		[],
	);
	const filteredWorkflows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return workflowRecords.filter((workflow) => {
			if (statusFilter !== "any" && workflow.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				workflow.moduleName,
				workflow.moduleCode,
				workflow.status,
				workflow.description,
				formatApprovalRoutingFlow(workflow),
				formatApprovalWorkflowFeatures(workflow.workflowFeatures),
				workflow.stages
					.map((stage) =>
						formatApprovalApproverNames(stage.approverIds, approverNameById),
					)
					.join(" "),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [approverNameById, query, statusFilter, workflowRecords]);
	const columns = useMemo<ColumnDef<ApprovalManagementRecord>[]>(
		() =>
			ApprovalManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createApprovalManagementColumn({
					approverNameById,
					className: column.className,
					header: column.label,
					key: column.key,
				});
			}),
		[approverNameById],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredWorkflows,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	useEffect(() => {
		if (!selectedWorkflow && workflowRecords[0]) {
			setSelectedWorkflowId(workflowRecords[0].id);
			return;
		}

		if (!selectedWorkflow) {
			return;
		}

		setValues(createApprovalManagementFormValues(selectedWorkflow));
		setErrors({});
	}, [selectedWorkflow, workflowRecords]);

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: ApprovalManagementStatus | "any") {
		setStatusFilter(value);
		table.setPageIndex(0);
	}

	function handleSelectWorkflow(workflowId: string) {
		setSelectedWorkflowId(workflowId);
	}

	function updateField<TKey extends keyof ApprovalManagementFormValues>(
		field: TKey,
		value: ApprovalManagementFormValues[TKey],
	) {
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
		setValues((current) => ({
			...current,
			stages: current.stages.map((stage) =>
				stage.id === stageId ? { ...stage, [field]: value } : stage,
			),
		}));
		setErrors((current) => clearStageError(current, stageId, field));
	}

	function updateAmountConditionMode(hasAmountCondition: boolean) {
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

	function addAmountConditionRule() {
		setValues((current) => {
			const amountRules = current.routingRules.filter(
				(rule) => rule.basis === "amount",
			);

			if (amountRules.length >= ApprovalAmountConditionLimit) {
				return current;
			}

			const fallbackStageIds = current.stages.map((stage) => stage.id);
			const defaultRule =
				current.routingRules.find((rule) => rule.basis === "default") ??
				createApprovalRoutingRule(amountRules.length + 2, current.stages, {
					basis: "default",
					name: "Otherwise",
					stageIds: current.stages.slice(0, 1).map((stage) => stage.id),
				});
			const nextAmountRule = createApprovalRoutingRule(
				amountRules.length + 1,
				current.stages,
				{
					basis: "amount",
					amountValue: amountRules.length === 0 ? "5000" : "1000",
					name: `Payment Condition ${amountRules.length + 1}`,
					stageIds: fallbackStageIds.slice(
						0,
						Math.max(1, fallbackStageIds.length - amountRules.length),
					),
				},
			);

			return {
				...current,
				routingRules: syncApprovalRoutingRulesForStages(
					[...amountRules, nextAmountRule, defaultRule],
					current.stages,
				),
			};
		});
		setErrors((current) => ({
			...current,
			routingRules: undefined,
		}));
	}

	function removeAmountConditionRule(routingRuleId: string) {
		setValues((current) => {
			const nextRoutingRules = current.routingRules.filter(
				(rule) => rule.id !== routingRuleId,
			);
			const amountRuleCount = nextRoutingRules.filter(
				(rule) => rule.basis === "amount",
			).length;

			return {
				...current,
				routingRules:
					amountRuleCount > 0
						? syncApprovalRoutingRulesForStages(nextRoutingRules, current.stages)
						: createStandardApprovalRoutingRules(nextRoutingRules, current.stages),
			};
		});
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
		setValues((current) => ({
			...current,
			routingRules: current.routingRules.map((rule) =>
				rule.id === routingRuleId ? { ...rule, [field]: value } : rule,
			),
		}));
		setErrors((current) => clearRoutingRuleError(current, routingRuleId, field));
	}

	function toggleRoutingRuleStage(routingRuleId: string, stageId: string) {
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

		if (!selectedWorkflow) {
			return;
		}

		const existingWorkflow = workflowByModuleCode.get(selectedWorkflow.moduleCode);
		const nextErrors = validateApprovalManagementForm({
			currentRecordId: existingWorkflow?.id ?? selectedWorkflow.id,
			existingRecords: workflows,
			values,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const nextWorkflow = updateApprovalManagementRecord(
			existingWorkflow ?? selectedWorkflow,
			values,
			moduleOptions,
		);

		if (existingWorkflow) {
			updateWorkflow(nextWorkflow);
			return;
		}

		addWorkflow(nextWorkflow);
	}

	function handleConfirmInactive() {
		if (!pendingInactiveWorkflow) {
			return;
		}

		inactivateWorkflow(pendingInactiveWorkflow.id);
		setPendingInactiveWorkflow(null);
	}

	return {
		activeWorkflowCount,
		allApproverStageCount: workflowRecords
			.flatMap((workflow) => workflow.stages)
			.filter((stage) => stage.requirement === "all").length,
		approverNameById,
		conditionalRouteCount: workflowRecords
			.flatMap((workflow) => workflow.routingRules)
			.filter((rule) => rule.basis !== "default").length,
		addAmountConditionRule,
		approverOptions: ApprovalApproverOptions,
		errors,
		handleConfirmInactive,
		handleInputChange,
		handleModuleCodeChange,
		handleQueryChange,
		handleSelectWorkflow,
		handleStatusFilterChange,
		handleSubmit,
		inactiveWorkflowCount: workflowRecords.length - activeWorkflowCount,
		isLoading: isLoading || isModuleLoading,
		isMutating,
		moduleOptions,
		pendingInactiveWorkflow,
		query,
		selectedWorkflow,
		selectedWorkflowId: selectedWorkflow?.id ?? null,
		setPendingInactiveWorkflow,
		statusFilter,
		table,
		toggleRoutingRuleStage,
		totalStageCount: workflowRecords.reduce(
			(total, workflow) => total + workflow.stageCount,
			0,
		),
		updateAmountConditionMode,
		updateField,
		updateRoutingRuleField,
		removeAmountConditionRule,
		updateStageField,
		updateWorkflowFeature,
		values,
		workflows: filteredWorkflows,
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

	return {
		...errors,
		stages: {
			...errors.stages,
			[stageId]: {
				...errors.stages[stageId],
				[field]: undefined,
			},
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

	return {
		...errors,
		routingRules: {
			...errors.routingRules,
			[routingRuleId]: {
				...errors.routingRules[routingRuleId],
				[field]: undefined,
			},
		},
	};
}

function createApprovalManagementColumn({
	approverNameById,
	className,
	header,
	key,
}: {
	approverNameById: Map<string, string>;
	className: string;
	header: string;
	key: ApprovalManagementTableColumnKey;
}): ColumnDef<ApprovalManagementRecord> {
	if (key === "stageConditions") {
		return {
			id: key,
			header,
			accessorFn: (workflow) => formatApprovalRoutingFlow(workflow),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "approverSummary") {
		return {
			id: key,
			header,
			accessorFn: (workflow) =>
				workflow.stages
					.map((stage) =>
						formatApprovalApproverNames(stage.approverIds, approverNameById),
					)
					.join(" "),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "updatedAt") {
		return {
			id: key,
			header,
			accessorFn: (workflow) =>
				formatApprovalWorkflowUpdatedAt(workflow.updatedAt),
			sortingFn: "datetime",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
