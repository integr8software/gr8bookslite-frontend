"use client";

import { ClipboardCheck } from "lucide-react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ApprovalTransactionPreview } from "./ApprovalTransactionPreview";
import { ApprovalTransactionTableRow } from "./ApprovalTransactionTableRow";
import { ApprovalTransactionsToolbar } from "./ApprovalTransactionsToolbar";
import { useApprovalTransactions } from "@/app/src/hooks/modules/approval-management/useApprovalTransactions";
import type { ApprovalTransactionRow } from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";

export function ApprovalTransactions() {
  const transactions = useApprovalTransactions();

  return (
    <section className="grid min-h-0 gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Approval Transactions"
        description="Review approval transactions by module, rule, and approver."
        eyebrow={
          <>
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Approval management
          </>
        }
      />

      <ModuleTable<ApprovalTransactionRow>
        emptyDescription="Select a module, rule, or approver with available approval transactions."
        emptyIcon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No approval transactions found"
        isLoading={transactions.transactionsQuery.isLoading}
        isSyncing={transactions.transactionsQuery.isFetching}
        lastSyncedAt={transactions.transactionsQuery.dataUpdatedAt || null}
        maxHeightClassName="max-h-[38rem]"
        minWidthClassName="min-w-[92rem]"
        pageSizeOptions={[5, 10, 15, 20]}
        paginationLabel="transactions"
        paginationStorageKey="approval-transactions"
        table={transactions.table}
        tableTitle="Module Transactions"
        toolbar={
          <ApprovalTransactionsToolbar
            approverOptions={transactions.approverOptions}
            isRefreshing={transactions.transactionsQuery.isFetching}
            moduleOptions={transactions.moduleOptions}
            query={transactions.query}
            ruleOptions={transactions.ruleOptions}
            selectedApproverId={transactions.selectedApproverId}
            selectedModuleCode={transactions.selectedModuleCode}
            selectedRuleId={transactions.selectedRuleId}
            onApproverChange={transactions.setSelectedApproverId}
            onModuleChange={transactions.setSelectedModuleCode}
            onQueryChange={transactions.setQuery}
            onRefresh={() => void transactions.transactionsQuery.refetch()}
            onRuleChange={transactions.setSelectedRuleId}
          />
        }
        renderRow={(row) => (
          <ApprovalTransactionTableRow key={row.id} record={row.original} onPreview={transactions.setPreviewTransaction} />
        )}
      />

      <ApprovalTransactionPreview
        isApproving={transactions.approveMutation.isPending}
        isDisapproving={transactions.disapproveMutation.isPending}
        record={transactions.previewTransaction}
        onApprove={(record) => transactions.openActionDialog("approve", record)}
        onClose={() => transactions.setPreviewTransaction(null)}
        onDisapprove={(record) => transactions.openActionDialog("disapprove", record)}
      />

      <AppDialog
        cancelLabel="Cancel"
        confirmLabel={transactions.actionDialog?.action === "disapprove" ? "Disapprove" : "Approve"}
        description={
          transactions.actionDialog?.action === "disapprove"
            ? "Are you sure you want to disapprove this transaction?"
            : "Are you sure you want to approve this transaction?"
        }
        iconTone={transactions.actionDialog?.action === "disapprove" ? "disapprove" : "approve"}
        isOpen={Boolean(transactions.actionDialog)}
        isPending={transactions.approveMutation.isPending || transactions.disapproveMutation.isPending}
        pendingLabel={transactions.actionDialog?.action === "disapprove" ? "Disapproving..." : "Approving..."}
        title={transactions.actionDialog?.record ? `${transactions.actionDialog.record.referenceNo}` : "Approval Transaction"}
        tone={transactions.actionDialog?.action === "disapprove" ? "danger" : "success"}
        content={
          transactions.actionDialog ? (
            <label className="block text-left">
              <span className="text-sm font-semibold text-darknavy">Remarks</span>
              <AppLimitedTextarea
                id="approval-transaction-action-remarks"
                value={transactions.actionDialog.remarks}
                rows={4}
                placeholder="Add remarks for this action"
                disabled={transactions.approveMutation.isPending || transactions.disapproveMutation.isPending}
                className="mt-2 min-h-24 w-full resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/28 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
                onChange={(event) => transactions.updateActionRemarks(event.target.value)}
              />
            </label>
          ) : null
        }
        onCancel={transactions.cancelActionDialog}
        onConfirm={transactions.confirmActionDialog}
      />
    </section>
  );
}
