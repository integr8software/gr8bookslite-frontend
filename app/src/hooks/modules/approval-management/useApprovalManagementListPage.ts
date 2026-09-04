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
	ApprovalManagementActiveStatus,
	ApprovalManagementTableColumns,
} from "@/app/src/constants/modules/approval-management/ApprovalManagementConstants";
import {
	createAmountConditionApprovalRoutingRules,
	createApprovalManagementFormValues,
	createApprovalManagementInitialFormValues,
	createApprovalManagementRecord,
	createApprovalRoutingRule,
	createApprovalStagesForCount,
	createStandardApprovalRoutingRules,
	syncApprovalRoutingRulesForStages,
	updateApprovalManagementRecord,
} from "@/app/src/data/modules/approval-management/ApprovalManagementData";
import { useQuery } from "@tanstack/react-query";
import { GetApprovalManagementModules } from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import { FetchApproverSetups } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupApi";
import { ApproverSetupQueryKeys } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupQueryKeys";
import {
	createApproverNameById,
	formatApprovalApproverNames,
	formatApprovalRoutingFlow,
	formatApprovalWorkflowUpdatedAt,
} from "@/app/src/services/modules/approval-management/ApprovalManagementFormatters";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
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
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import type {
	ApproverAssignmentType,
	ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { validateApprovalManagementForm } from "@/app/src/validations/modules/system-administration/approval-management/ApprovalManagementValidation";
import { useApprovalManagementStore } from "@/app/src/hooks/modules/approval-management/useApprovalManagement";
import { useApprovalAlertStore } from "@/app/src/hooks/modules/approval-management/useApprovalAlertStore";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

export function useApprovalManagementListPage() {
	const activeCompanyId = useAppStore((state) => state.activeCompanyId);
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
		queryKey: ApprovalManagementQueryKeys.modules(activeCompanyId),
		queryFn: GetApprovalManagementModules,
		enabled: activeCompanyId !== null,
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
		(workflow) => workflow.status === ApprovalManagementActiveStatus,
	).length;
	const [selectedModuleCode, setSelectedModuleCode] =
		useState<ApprovalManagementModuleCode | null>(
			() => workflowRecords[0]?.moduleCode ?? null,
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
		workflowRecords.find(
			(workflow) => workflow.moduleCode === selectedModuleCode,
		) ??
		workflowRecords[0];
	const [values, setValues] = useState<ApprovalManagementFormValues>(() =>
		selectedWorkflow
			? createApprovalManagementFormValues(selectedWorkflow)
			: createApprovalManagementInitialFormValues(),
	);
	const [errors, setErrors] = useState<ApprovalManagementFormErrors>({});
	const hasWorkflowChanges = useMemo(() => {
		if (!selectedWorkflow) {
			return false;
		}

		return (
			JSON.stringify(createApprovalManagementFormValues(selectedWorkflow)) !==
			JSON.stringify(values)
		);
	}, [selectedWorkflow, values]);
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
	const approverNameById = useMemo(() => {
		const approvers = (approverSetupsQuery.data ?? []).flatMap((record: ApproverSetupRecord) =>
			(record.approverUsers ?? []).map((approver) => ({
				email: approver.email,
				id: approver.id,
				name: approver.name,
				role: "",
				status: ApprovalManagementActiveStatus,
			})),
		);

		return createApproverNameById(approvers);
	}, [approverSetupsQuery.data]);
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
			setSelectedModuleCode(workflowRecords[0].moduleCode);
			return;
		}

		if (!selectedWorkflow) {
			return;
		}

		setValues(createApprovalManagementFormValues(selectedWorkflow));
		setErrors({});
	}, [selectedWorkflow, workflowRecords]);

	useEffect(() => {
		if (!selectedWorkflow || approverSetupsQuery.isLoading) {
			return;
		}

		const sourceSetupIds = new Set(
			selectedWorkflow.stages
				.map((stage) =>
					stage.sourceApproverSetupId ?? getSourceApproverSetupId(stage.id),
				)
				.filter((setupId): setupId is string => Boolean(setupId)),
		);
		const sourceSetup = (approverSetupsQuery.data ?? []).find((record: ApproverSetupRecord) =>
			sourceSetupIds.has(record.id),
		);

		setSelectedApproverType(sourceSetup?.assignmentType ?? "");
	}, [
		approverSetupsQuery.data,
		approverSetupsQuery.isLoading,
		selectedWorkflow,
	]);

	useEffect(() => {
		if (!selectedApproverType) {
			return;
		}

		setValues((current) => {
			const stages = syncApprovalStagesForApproverSetups(
				current.stages,
				visibleApproverSetupRecords,
			);

			return {
				...current,
				stageCount: stages.length,
				stages,
				routingRules: current.routingRules.map((rule) => ({
					...rule,
					stageIds: stages.map((stage) => stage.id),
				})),
			};
		});
		setErrors((current) => ({ ...current, stageCount: undefined }));
	}, [selectedApproverType, visibleApproverSetupRecords]);

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: ApprovalManagementStatus | "any") {
		setStatusFilter(value);
		table.setPageIndex(0);
	}

	function handleSelectWorkflow(workflowId: string) {
		const workflow = workflowRecords.find((record) => record.id === workflowId);

		if (workflow) {
			setSelectedModuleCode(workflow.moduleCode);
		}
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

	function moveRoutingRuleStage(
		routingRuleId: string,
		stageId: string,
		direction: "down" | "up",
	) {
		setValues((current) => {
			const routingRule = current.routingRules.find(
				(rule) => rule.id === routingRuleId,
			);
			const currentIndex = routingRule?.stageIds.indexOf(stageId) ?? -1;
			const nextIndex =
				direction === "up" ? currentIndex - 1 : currentIndex + 1;

			if (
				!routingRule ||
				currentIndex < 0 ||
				nextIndex < 0 ||
				nextIndex >= routingRule.stageIds.length
			) {
				return current;
			}

			const nextStageIds = [...routingRule.stageIds];
			[nextStageIds[currentIndex], nextStageIds[nextIndex]] = [
				nextStageIds[nextIndex],
				nextStageIds[currentIndex],
			];
			const stageById = new Map(current.stages.map((stage) => [stage.id, stage]));
			const orderedStages = [
				...nextStageIds
					.map((currentStageId) => stageById.get(currentStageId))
					.filter((stage): stage is ApprovalStageFormValues => Boolean(stage)),
				...current.stages.filter((stage) => !nextStageIds.includes(stage.id)),
			].map((stage, index) => ({
				...stage,
				sequence: index + 1,
			}));
			const orderedStageIds = orderedStages.map((stage) => stage.id);

			return {
				...current,
				stages: orderedStages,
				routingRules: current.routingRules.map((rule) => ({
					...rule,
					stageIds: orderedStageIds,
				})),
			};
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedWorkflow) {
			return;
		}
		if (!selectedApproverType) {
			toast.error("Select an approver type before saving approval rules.");
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

		if (visibleApproverSetupRecords.length === 0) {
			toast.error(`${selectedWorkflow.moduleName} needs an approver setup first.`);
			useApprovalAlertStore.getState().setActiveTab("approver-setup");
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
		approverOptions: Array.from(approverNameById, ([id, name]) => ({
			email: "",
			id,
			name,
			role: "",
			status: ApprovalManagementActiveStatus,
		})),
		errors,
		handleConfirmInactive,
		handleModuleCodeChange,
		handleQueryChange,
		handleSelectWorkflow,
		handleStatusFilterChange,
		handleSubmit,
		hasWorkflowChanges,
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
		moveRoutingRuleStage,
		totalStageCount: workflowRecords.reduce(
			(total, workflow) => total + workflow.stageCount,
			0,
		),
		updateAmountConditionMode,
		updateField,
		updateRoutingRuleField,
		removeAmountConditionRule,
		updateStageField,
		values,
		visibleApproverSetupRecords,
		workflows: filteredWorkflows,
	};
}

function syncApprovalStagesForApproverSetups(
	currentStages: ApprovalStageFormValues[],
	records: ApproverSetupRecord[],
): ApprovalStageFormValues[] {
	return records
		.flatMap((record) =>
			record.userIds.map((userId) => {
				const stageKey = `${record.id}-${userId}`;
				const existingStage = currentStages.find(
					(stage) => stage.id === `approval-stage-${stageKey}`,
				);

				return {
					id: existingStage?.id ?? `approval-stage-${stageKey}`,
					name: record.levelName,
					approverIds: [userId],
					requirement: "all" as const,
					sourceApproverSetupId: record.id,
				};
			}),
		)
		.map((stage, index) => ({
			...stage,
			sequence: index + 1,
		}));
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
				record.status === ApprovalManagementActiveStatus &&
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

function getSourceApproverSetupId(stageId: string) {
	const match = stageId.match(
		/^approval-stage-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-/i,
	);

	return match?.[1];
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
