"use client";

import { ClipboardCheck } from "lucide-react";
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
        onApprove={(record) => transactions.approveMutation.mutate(record.id)}
        onClose={() => transactions.setPreviewTransaction(null)}
        onDisapprove={(record) => transactions.disapproveMutation.mutate(record.id)}
      />
    </section>
  );
}
