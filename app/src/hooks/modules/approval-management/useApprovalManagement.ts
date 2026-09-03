"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	GetApprovalManagementWorkflows,
	InactivateApprovalManagementWorkflow,
	UpsertApprovalManagementWorkflow,
} from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
import { ApproverSetupQueryKeys } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import type { ApproverSetupRecord } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";

	type ApprovalManagementState = {
	addWorkflow: (workflow: ApprovalManagementRecord) => void;
	inactivateWorkflow: (workflowId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	updateWorkflow: (workflow: ApprovalManagementRecord) => void;
	workflows: ApprovalManagementRecord[];
};

const EmptyApprovalManagementWorkflows: ApprovalManagementRecord[] = [];

export function useApprovalManagementStore<TSelected = ApprovalManagementState>(
	selector?: (state: ApprovalManagementState) => TSelected,
) {
	const queryClient = useQueryClient();
	const activeCompanyId = useAppStore((state) => state.activeCompanyId);
	const workflowsQuery = useQuery({
		queryKey: ApprovalManagementQueryKeys.workflows(activeCompanyId),
		queryFn: GetApprovalManagementWorkflows,
		enabled: activeCompanyId !== null,
		initialData: EmptyApprovalManagementWorkflows,
	});

	function setSavedWorkflow(workflow: ApprovalManagementRecord) {
		queryClient.setQueryData<ApprovalManagementRecord[]>(
			ApprovalManagementQueryKeys.workflows(activeCompanyId),
			(workflows = EmptyApprovalManagementWorkflows) => [
				...workflows.filter(
					(current) => current.moduleCode !== workflow.moduleCode,
				),
				workflow,
			],
		);
	}

	function syncSavedApproverOrder(workflow: ApprovalManagementRecord) {
		const orderBySetupAndUser = new Map(
			workflow.stages.map((stage, index) => [
				`${stage.sourceApproverSetupId ?? ""}:${stage.approverIds[0] ?? ""}`,
				index,
			]),
		);

		queryClient.setQueryData<ApproverSetupRecord[]>(
			ApproverSetupQueryKeys.records(),
			(records = []) =>
				records.map((record) => {
					const position = (userId: string) =>
						orderBySetupAndUser.get(`${record.id}:${userId}`) ??
						Number.MAX_SAFE_INTEGER;
					const userIds = [...record.userIds].sort(
						(first, second) => position(first) - position(second),
					);
					const approverUsers = record.approverUsers
						? [...record.approverUsers].sort(
							(first, second) => position(first.id) - position(second.id),
						)
						: undefined;

					return { ...record, approverUsers, userIds };
				}),
		);
		void queryClient.invalidateQueries({
			queryKey: ApproverSetupQueryKeys.records(),
		});
	}

	const addWorkflowMutation = useMutation({
		mutationFn: UpsertApprovalManagementWorkflow,
		onSuccess: (workflow) => {
			syncSavedApproverOrder(workflow);
			setSavedWorkflow(workflow);
			toast.success("Approval workflow saved.");
		},
		onError: () => {
			toast.error("Could not create the approval workflow.");
		},
	});
	const updateWorkflowMutation = useMutation({
		mutationFn: UpsertApprovalManagementWorkflow,
		onSuccess: (workflow) => {
			syncSavedApproverOrder(workflow);
			setSavedWorkflow(workflow);
			toast.success("Approval workflow updated.");
		},
		onError: () => {
			toast.error("Could not update the approval workflow.");
		},
	});
	const inactivateWorkflowMutation = useMutation({
		mutationFn: InactivateApprovalManagementWorkflow,
		onSuccess: (workflow) => {
			setSavedWorkflow(workflow);
			toast.success("Approval workflow set as inactive.");
		},
		onError: () => {
			toast.error("Could not update the workflow status.");
		},
	});
	const state = useMemo<ApprovalManagementState>(
		() => ({
			addWorkflow: (workflow) => addWorkflowMutation.mutate(workflow),
			inactivateWorkflow: (workflowId) =>
				inactivateWorkflowMutation.mutate(workflowId),
			isLoading: workflowsQuery.isLoading,
			lastSyncedAt: workflowsQuery.dataUpdatedAt,
			isMutating:
				addWorkflowMutation.isPending ||
				updateWorkflowMutation.isPending ||
				inactivateWorkflowMutation.isPending,
			updateWorkflow: (workflow) => updateWorkflowMutation.mutate(workflow),
			workflows: workflowsQuery.data,
		}),
		[
			addWorkflowMutation,
			inactivateWorkflowMutation,
			updateWorkflowMutation,
			workflowsQuery.data,
			workflowsQuery.dataUpdatedAt,
			workflowsQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
