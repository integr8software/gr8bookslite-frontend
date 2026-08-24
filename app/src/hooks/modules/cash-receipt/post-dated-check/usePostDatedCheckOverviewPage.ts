"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  listPostDatedChecks,
  updatePostDatedCheckStatus,
} from "@/app/src/services/modules/cash-receipt/post-dated-check/PostDatedCheckService";
import { PostDatedCheckQueryKeys } from "@/app/src/services/modules/cash-receipt/post-dated-check/PostDatedCheckQueryKeys";
import type { PostDatedCheckStatus } from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";

export function usePostDatedCheckOverviewPage() {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const recordsQuery = useQuery({
    queryKey: PostDatedCheckQueryKeys.list(activeCompanyId, activeBranchId),
    queryFn: () => listPostDatedChecks(activeBranchId),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostDatedCheckStatus }) => updatePostDatedCheckStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PostDatedCheckQueryKeys.all });
      toast.success("Registry status updated.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update status."),
  });
  const records = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (recordsQuery.data?.registries ?? []).filter((record) =>
      [
        record.registryNo,
        record.partyCode,
        record.partyName,
        record.remarks,
        ...record.details.flatMap((line) => [line.pdcBank, line.pdcNo, line.referenceNo]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [recordsQuery.data?.registries, search]);

  return {
    error: recordsQuery.error,
    isLoading: recordsQuery.isLoading,
    isStatusPending: statusMutation.isPending,
    records,
    search,
    setSearch,
    statistics: recordsQuery.data?.statistics,
    updateStatus: (id: string, status: PostDatedCheckStatus) => statusMutation.mutate({ id, status }),
  };
}
