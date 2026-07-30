"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
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
import { useQuery } from "@tanstack/react-query";
import { GetApprovalManagementModules } from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementApi";
import { FetchApproverSetups } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupApi";
import { ApproverSetupQueryKeys } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupQueryKeys";
import {
	createApproverNameById,
	formatApprovalApproverNames,
	formatApprovalRoutingFlow,
	formatApprovalWorkflowFeatures,
	formatApprovalWorkflowUpdatedAt,
} from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementQueryKeys";
import type {
	ApprovalManagementRecord,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementModuleOption,
	ApprovalManagementStatus,
	ApprovalManagementTableColumnKey,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalWorkflowFeatureKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import type {
	ApproverAssignmentType,
	ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { validateApprovalManagementForm } from "@/app/src/validations/modules/system-administration/approval-management/ApprovalManagementValidation";
import { useApprovalManagementStore } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagement";

export function useApprovalManagementListPage() {
	const {
		addWorkflow,
		inactivateWorkflow,
		isLoading,
		isMutating,
		lastSyncedAt,
		updateWorkflow,
		workflows,
	} = useApprovalManagementStore();
	const modulesQuery = useQuery({
		queryKey: ApprovalManagementQueryKeys.modules(),
		queryFn: GetApprovalManagementModules,
		placeholderData: [],
	});
	const approverSetupsQuery = useQuery({
		queryKey: ApproverSetupQueryKeys.records(),
		queryFn: FetchApproverSetups,
	});
	const moduleOptions = useMemo<ApprovalManagementModuleOption[]>(() => {
		const sourceOptions = modulesQuery.data ?? [];

		return sourceOptions
			.filter(
				(option, index, options) =>
					options.findIndex((current) => current.code === option.code) ===
					index,
			)
			.sort((first, second) => first.name.localeCompare(second.name));
	}, [modulesQuery.data]);
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
	const [selectedApproverType, setSelectedApproverType] = useState<
		ApproverAssignmentType | ""
	>("");
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
	const visibleApproverSetupRecords = useMemo(
		() =>
			selectedWorkflow && selectedApproverType
				? getVisibleApproverSetupRecords({
						moduleCode: selectedWorkflow.moduleCode,
						moduleName: selectedWorkflow.moduleName,
						records: approverSetupsQuery.data ?? [],
						selectedApproverType,
					})
				: [],
		[
			approverSetupsQuery.data,
			selectedApproverType,
			selectedWorkflow,
		],
	);
	const derivedApprovalLevelCount = useMemo(
		() => getApprovalLevelCount(visibleApproverSetupRecords),
		[visibleApproverSetupRecords],
	);
	const displayedApprovalLevelCount = selectedApproverType
		? derivedApprovalLevelCount
		: null;
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

	useEffect(() => {
		if (!selectedApproverType) {
			return;
		}

		setValues((current) => {
			if (current.stageCount === derivedApprovalLevelCount) {
				return current;
			}

			const stages = createApprovalStagesForCount(
				current.stages,
				derivedApprovalLevelCount,
			);

			return {
				...current,
				stageCount: derivedApprovalLevelCount,
				stages,
				routingRules: syncApprovalRoutingRulesForStages(
					current.routingRules,
					stages,
				),
			};
		});
		setErrors((current) => ({ ...current, stageCount: undefined }));
	}, [derivedApprovalLevelCount, selectedApproverType]);

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

			const nextAmountRule = createApprovalRoutingRule(
				amountRules.length + 1,
				current.stages,
				{
					basis: "amount",
					name: `Condition ${amountRules.length + 1}`,
					amountValue: "",
					stageIds: current.stages.map((stage) => stage.id),
				},
			);

			return {
				...current,
				routingRules: syncApprovalRoutingRulesForStages(
					[...amountRules, nextAmountRule],
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
						: [],
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
		setValues((current) => {
			const nextValues = {
				...current,
				routingRules: current.routingRules.map((rule) =>
					rule.id === routingRuleId ? { ...rule, [field]: value } : rule,
				),
			};

			setErrors(
				validateApprovalManagementForm({
					currentRecordId: selectedWorkflow?.id,
					existingRecords: workflows,
					values: nextValues,
				}),
			);

			return nextValues;
		});
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
			toast.error("Please fix the highlighted approval workflow fields.");
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
		handleModuleCodeChange,
		handleQueryChange,
		handleSelectWorkflow,
		handleStatusFilterChange,
		handleSubmit,
		inactiveWorkflowCount: workflowRecords.length - activeWorkflowCount,
		isApproverSetupsLoading: approverSetupsQuery.isLoading,
		derivedApprovalLevelCount: displayedApprovalLevelCount,
		isLoading: isLoading || modulesQuery.isLoading,
		isMutating,
		lastSyncedAt: Math.max(
			lastSyncedAt,
			modulesQuery.dataUpdatedAt,
			approverSetupsQuery.dataUpdatedAt,
		),
		moduleOptions,
		pendingInactiveWorkflow,
		query,
		selectedApproverType,
		selectedWorkflow,
		selectedWorkflowId: selectedWorkflow?.id ?? null,
		setSelectedApproverType,
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
		visibleApproverSetupRecords,
		workflows: filteredWorkflows,
	};
}

function getVisibleApproverSetupRecords({
	moduleCode,
	moduleName,
	records,
	selectedApproverType,
}: {
	moduleCode: string;
	moduleName: string;
	records: ApproverSetupRecord[];
	selectedApproverType: ApproverAssignmentType;
}): ApproverSetupRecord[] {
	const normalizedModuleCode = normalizeModuleScope(moduleCode);
	const normalizedModuleName = normalizeModuleScope(moduleName);

	return records
		.filter((record) => {
			const normalizedModuleScope = normalizeModuleScope(record.moduleScope);

			return (
				record.assignmentType === selectedApproverType &&
				record.status === "Active" &&
				(normalizedModuleScope === normalizedModuleCode ||
					normalizedModuleScope === normalizedModuleName)
			);
		})
		.sort((first, second) => first.sequence - second.sequence);
}

function getApprovalLevelCount(records: ApproverSetupRecord[]) {
	return records.reduce(
		(maxSequence, record) => Math.max(maxSequence, record.sequence),
		0,
	);
}

function normalizeModuleScope(value: string) {
	return value.trim().toLowerCase();
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
