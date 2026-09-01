"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  mapWorkspaceCompaniesToBranchManagementBranches,
} from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import type { MainBranch } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import { BranchManagementQueryKeys } from "@/app/src/services/modules/system-administration/branch-management/BranchManagementQueryKeys";
import {
  GetWorkspaceCompanies,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";

type BranchManagementStoreState = {
  branches: MainBranch[];
  addBranch: (branch: MainBranch) => void;
  updateBranch: (branch: MainBranch) => void;
  deleteBranch: (branchId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

export function useBranchManagementStore<TSelected = BranchManagementStoreState>(
  selector?: (state: BranchManagementStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    queryKey: BranchManagementQueryKeys.branches(),
    queryFn: async () =>
      mapWorkspaceCompaniesToBranchManagementBranches(
        await GetWorkspaceCompanies(),
      ),
  });

  function updateCachedBranches(
    updater: (branches: MainBranch[]) => MainBranch[],
  ) {
    queryClient.setQueryData<MainBranch[]>(
      BranchManagementQueryKeys.branches(),
      (currentBranches = []) => updater(currentBranches),
    );
  }

  const addBranchMutation = useMutation({
    mutationFn: async (branch: MainBranch) => branch,
    onSuccess: (branch) => {
      updateCachedBranches((branches) => [...branches, branch]);
      toast.success("Branch created.");
    },
    onError: () => {
      toast.error("Could not create branch. Please try again.");
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async (branch: MainBranch) => branch,
    onSuccess: (branch) => {
      updateCachedBranches((branches) =>
        branches.map((currentBranch) =>
          currentBranch.id === branch.id ? branch : currentBranch,
        ),
      );
      toast.success("Branch updated.");
    },
    onError: () => {
      toast.error("Could not update branch. Please try again.");
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: string) => branchId,
    onSuccess: (branchId) => {
      updateCachedBranches((branches) =>
        branches.filter((branch) => branch.id !== branchId),
      );
      toast.success("Branch deleted.");
    },
    onError: () => {
      toast.error("Could not delete branch. Please try again.");
    },
  });

  const state = useMemo<BranchManagementStoreState>(
    () => ({
      branches: branchesQuery.data ?? [],
      addBranch: (branch) => addBranchMutation.mutate(branch),
      updateBranch: (branch) => updateBranchMutation.mutate(branch),
      deleteBranch: (branchId) => deleteBranchMutation.mutate(branchId),
      isLoading: branchesQuery.isLoading,
      lastSyncedAt: branchesQuery.dataUpdatedAt,
      isMutating:
        addBranchMutation.isPending ||
        updateBranchMutation.isPending ||
        deleteBranchMutation.isPending,
    }),
    [
      addBranchMutation,
      branchesQuery.data,
      branchesQuery.dataUpdatedAt,
      branchesQuery.isLoading,
      deleteBranchMutation,
      updateBranchMutation,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
