"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MainBranch } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { MainLayoutMockData } from "@/app/src/data/shared/MainLayout/MainShellMockData";
import { BranchManagementQueryKeys } from "@/app/src/services/modules/system-administration/branch-management/BranchManagementQueryKeys";

type BranchManagementStoreState = {
  branches: MainBranch[];
  addBranch: (branch: MainBranch) => void;
  updateBranch: (branch: MainBranch) => void;
  deleteBranch: (branchId: string) => void;
  isLoading: boolean;
  isMutating: boolean;
};

export function useBranchManagementStore<TSelected = BranchManagementStoreState>(
  selector?: (state: BranchManagementStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    queryKey: BranchManagementQueryKeys.branches(),
    queryFn: async () => MainLayoutMockData.branches,
    initialData: MainLayoutMockData.branches,
  });

  function updateCachedBranches(
    updater: (branches: MainBranch[]) => MainBranch[],
  ) {
    queryClient.setQueryData<MainBranch[]>(
      BranchManagementQueryKeys.branches(),
      (currentBranches = MainLayoutMockData.branches) =>
        updater(currentBranches),
    );
  }

  const addBranchMutation = useMutation({
    mutationFn: async (branch: MainBranch) => branch,
    onSuccess: (branch) => {
      updateCachedBranches((branches) => [...branches, branch]);
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
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: string) => branchId,
    onSuccess: (branchId) => {
      updateCachedBranches((branches) =>
        branches.filter((branch) => branch.id !== branchId),
      );
    },
  });

  const state = useMemo<BranchManagementStoreState>(
    () => ({
      branches: branchesQuery.data,
      addBranch: (branch) => addBranchMutation.mutate(branch),
      updateBranch: (branch) => updateBranchMutation.mutate(branch),
      deleteBranch: (branchId) => deleteBranchMutation.mutate(branchId),
      isLoading: branchesQuery.isLoading,
      isMutating:
        addBranchMutation.isPending ||
        updateBranchMutation.isPending ||
        deleteBranchMutation.isPending,
    }),
    [
      addBranchMutation,
      branchesQuery.data,
      branchesQuery.isLoading,
      deleteBranchMutation,
      updateBranchMutation,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
