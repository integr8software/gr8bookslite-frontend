"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockApprovalManagementWorkflows } from "@/app/src/data/modules/system-administration/approval-management/ApprovalManagementData";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementQueryKeys";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

type ApprovalManagementState = {
	addWorkflow: (workflow: ApprovalManagementRecord) => void;
	inactivateWorkflow: (workflowId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
	updateWorkflow: (workflow: ApprovalManagementRecord) => void;
	workflows: ApprovalManagementRecord[];
};

export function useApprovalManagementStore<TSelected = ApprovalManagementState>(
	selector?: (state: ApprovalManagementState) => TSelected,
) {
	const queryClient = useQueryClient();
	const workflowsQuery = useQuery({
		queryKey: ApprovalManagementQueryKeys.workflows(),
		queryFn: async () => MockApprovalManagementWorkflows,
		initialData: MockApprovalManagementWorkflows,
	});

	function setWorkflows(
		updater: (
			workflows: ApprovalManagementRecord[],
		) => ApprovalManagementRecord[],
	) {
		queryClient.setQueryData<ApprovalManagementRecord[]>(
			ApprovalManagementQueryKeys.workflows(),
			(current = MockApprovalManagementWorkflows) => updater(current),
		);
	}

	const addWorkflowMutation = useMutation({
		mutationFn: async (workflow: ApprovalManagementRecord) => workflow,
		onSuccess: (workflow) => {
			setWorkflows((workflows) => [...workflows, workflow]);
			toast.success("Approval workflow created.");
		},
		onError: () => {
			toast.error("Could not create the approval workflow.");
		},
	});
	const updateWorkflowMutation = useMutation({
		mutationFn: async (workflow: ApprovalManagementRecord) => workflow,
		onSuccess: (workflow) => {
			setWorkflows((workflows) =>
				workflows.map((current) =>
					current.id === workflow.id ? workflow : current,
				),
			);
			toast.success("Approval workflow updated.");
		},
		onError: () => {
			toast.error("Could not update the approval workflow.");
		},
	});
	const inactivateWorkflowMutation = useMutation({
		mutationFn: async (workflowId: string) => workflowId,
		onSuccess: (workflowId) => {
			setWorkflows((workflows) =>
				workflows.map((workflow) =>
					workflow.id === workflowId
						? {
								...workflow,
								status: "Inactive",
								updatedAt: new Date().toISOString(),
							}
						: workflow,
				),
			);
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
			workflowsQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
