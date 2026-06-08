"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ApprovalManagementTableColumns } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import { ApprovalApproverOptions } from "@/app/src/data/modules/system-administration/approval-management/ApprovalManagementData";
import {
	createApproverNameById,
	formatApprovalApproverNames,
	formatApprovalRoutingFlow,
	formatApprovalWorkflowFeatures,
	formatApprovalWorkflowUpdatedAt,
} from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import type {
	ApprovalManagementRecord,
	ApprovalManagementStatus,
	ApprovalManagementTableColumnKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import { useApprovalManagementStore } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagement";

export function useApprovalManagementListPage() {
	const {
		inactivateWorkflow,
		isLoading,
		isMutating,
		workflows,
	} = useApprovalManagementStore();
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
	const approverNameById = useMemo(
		() => createApproverNameById(ApprovalApproverOptions),
		[],
	);
	const filteredWorkflows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return workflows.filter((workflow) => {
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
	}, [approverNameById, query, statusFilter, workflows]);
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

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: ApprovalManagementStatus | "any") {
		setStatusFilter(value);
		table.setPageIndex(0);
	}

	function handleConfirmInactive() {
		if (!pendingInactiveWorkflow) {
			return;
		}

		inactivateWorkflow(pendingInactiveWorkflow.id);
		setPendingInactiveWorkflow(null);
	}

	return {
		activeWorkflowCount: workflows.filter(
			(workflow) => workflow.status === "Active",
		).length,
		allApproverStageCount: workflows
			.flatMap((workflow) => workflow.stages)
			.filter((stage) => stage.requirement === "all").length,
		approverNameById,
		conditionalRouteCount: workflows
			.flatMap((workflow) => workflow.routingRules)
			.filter((rule) => rule.basis !== "default").length,
		handleConfirmInactive,
		handleQueryChange,
		handleStatusFilterChange,
		isLoading,
		isMutating,
		pendingInactiveWorkflow,
		query,
		setPendingInactiveWorkflow,
		statusFilter,
		table,
		totalStageCount: workflows.reduce(
			(total, workflow) => total + workflow.stageCount,
			0,
		),
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
