"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { MainLayoutMockData } from "@/app/src/data/shared/main-layout/MainLayoutMockData";
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
