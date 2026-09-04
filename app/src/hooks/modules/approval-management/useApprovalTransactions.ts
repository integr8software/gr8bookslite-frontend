import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
  ApproveApprovalTransaction,
  DisapproveApprovalTransaction,
  GetApprovalManagementModules,
  GetApprovalTransactions,
  type ApprovalTransactionActionPayload,
} from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
import {
  AllApproversFilter,
  AllModulesFilter,
  AllRulesFilter,
} from "@/app/src/constants/modules/approval-management/ApprovalTransactionConstants";
import {
  ApprovalTransactionColumns,
  createApproverOptions,
  createModuleOptions,
  createRuleOptions,
  mapApprovalTransactionRow,
  matchesTransactionFilters,
} from "@/app/src/data/modules/approval-management/ApprovalTransactionData";
import type {
  ApprovalTransactionApiRecord,
  ApprovalTransactionRow,
} from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

type ApprovalTransactionAction = "approve" | "disapprove";

export type ApprovalTransactionActionDialogState = {
  action: ApprovalTransactionAction;
  record: ApprovalTransactionRow;
  remarks: string;
};

export function useApprovalTransactions() {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const [query, setQuery] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState(AllModulesFilter);
  const [selectedRuleId, setSelectedRuleId] = useState(AllRulesFilter);
  const [selectedApproverId, setSelectedApproverId] = useState(AllApproversFilter);
  const [previewTransaction, setPreviewTransaction] = useState<ApprovalTransactionRow | null>(null);
  const [actionDialog, setActionDialog] = useState<ApprovalTransactionActionDialogState | null>(null);
  const modulesQuery = useQuery({
    queryKey: ApprovalManagementQueryKeys.modules(activeCompanyId),
    queryFn: GetApprovalManagementModules,
    enabled: activeCompanyId !== null,
    placeholderData: [],
  });
  const transactionsQuery = useQuery({
    queryKey: ApprovalManagementQueryKeys.transactions(activeCompanyId),
    queryFn: GetApprovalTransactions,
    enabled: activeCompanyId !== null,
    placeholderData: [],
  });
  const rows = useMemo(() => (transactionsQuery.data ?? []).map(mapApprovalTransactionRow), [transactionsQuery.data]);
  const moduleOptions = useMemo(() => createModuleOptions(rows, modulesQuery.data ?? []), [modulesQuery.data, rows]);
  const ruleOptions = useMemo(() => createRuleOptions(rows, selectedModuleCode), [rows, selectedModuleCode]);
  const approverOptions = useMemo(
    () => createApproverOptions(rows, selectedModuleCode, selectedRuleId),
    [rows, selectedModuleCode, selectedRuleId],
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        matchesTransactionFilters(row, {
          approverId: selectedApproverId,
          moduleCode: selectedModuleCode,
          query,
          ruleId: selectedRuleId,
        }),
      ),
    [query, rows, selectedApproverId, selectedModuleCode, selectedRuleId],
  );
  const approveMutation = useTransactionStatusMutation("approve", ApproveApprovalTransaction, closeActionSurfaces);
  const disapproveMutation = useTransactionStatusMutation("disapprove", DisapproveApprovalTransaction, closeActionSurfaces);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    columns: ApprovalTransactionColumns,
    data: filteredRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  useEffect(() => {
    if (selectedRuleId !== AllRulesFilter && !ruleOptions.some(({ value }) => value === selectedRuleId)) {
      setSelectedRuleId(AllRulesFilter);
    }
  }, [ruleOptions, selectedRuleId]);

  useEffect(() => {
    if (selectedApproverId !== AllApproversFilter && !approverOptions.some(({ value }) => value === selectedApproverId)) {
      setSelectedApproverId(AllApproversFilter);
    }
  }, [approverOptions, selectedApproverId]);

  return {
    actionDialog,
    approveMutation,
    approverOptions,
    cancelActionDialog,
    confirmActionDialog,
    disapproveMutation,
    moduleOptions,
    openActionDialog,
    previewTransaction,
    query,
    ruleOptions,
    selectedApproverId,
    selectedModuleCode,
    selectedRuleId,
    setPreviewTransaction,
    setQuery,
    setSelectedApproverId,
    setSelectedModuleCode,
    setSelectedRuleId,
    table,
    transactionsQuery,
    updateActionRemarks,
  };

  function useTransactionStatusMutation(
    action: ApprovalTransactionAction,
    mutationFn: (payload: ApprovalTransactionActionPayload) => Promise<ApprovalTransactionApiRecord>,
    onDone: () => void,
  ) {
    return useMutation({
      mutationFn,
      onSuccess: (updatedTransaction) => {
        queryClient.setQueryData<ApprovalTransactionApiRecord[]>(ApprovalManagementQueryKeys.transactions(activeCompanyId), (transactions = []) =>
          transactions.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction)),
        );
        toast.success(`Transaction ${action === "approve" ? "approved" : "disapproved"}.`);
        onDone();
      },
      onError: () => toast.error(`Could not ${action} this transaction.`),
    });
  }

  function openActionDialog(action: ApprovalTransactionAction, record: ApprovalTransactionRow) {
    setActionDialog({ action, record, remarks: "" });
  }

  function updateActionRemarks(remarks: string) {
    setActionDialog((current) => (current ? { ...current, remarks } : current));
  }

  function cancelActionDialog() {
    if (approveMutation.isPending || disapproveMutation.isPending) {
      return;
    }

    setActionDialog(null);
  }

  function confirmActionDialog() {
    if (!actionDialog) {
      return;
    }

    const payload = {
      remarks: actionDialog.remarks.trim() || null,
      transactionId: actionDialog.record.id,
    };

    if (actionDialog.action === "approve") {
      approveMutation.mutate(payload);
      return;
    }

    disapproveMutation.mutate(payload);
  }

  function closeActionSurfaces() {
    setPreviewTransaction(null);
    setActionDialog(null);
  }
}
