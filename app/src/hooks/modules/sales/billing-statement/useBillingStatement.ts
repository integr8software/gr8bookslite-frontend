"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  fetchBillingStatements,
  updateBillingStatementStatus,
} from "@/app/src/services/modules/sales/billing-statement/BillingStatementApi";
import { BillingStatementQueryKeys } from "@/app/src/services/modules/sales/billing-statement/BillingStatementQueryKeys";
import type {
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

type BillingStatementStoreState = {
  statements: BillingStatementRecord[];
  addStatement: (statement: BillingStatementRecord) => void;
  updateStatement: (statement: BillingStatementRecord) => void;
  updateStatementStatus: (
    statement: BillingStatementRecord,
    status: BillingStatementStatus,
  ) => void;
  deleteStatement: (statementId: string) => void;
  lastSyncedAt: number;
  isMutating: boolean;
};

export function useBillingStatementStore<TSelected = BillingStatementStoreState>(
  selector?: (state: BillingStatementStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const [optimisticStatements, setOptimisticStatements] = useState<BillingStatementRecord[] | null>(null);
  const recordsQuery = useQuery({
    enabled: activeCompanyId !== null && activeBranchId !== null,
    queryFn: () =>
      fetchBillingStatements({
        branchUnitId: activeBranchId,
        limit: 500,
        sortBy: "documentDate",
        sortDirection: "desc",
      }),
    queryKey: BillingStatementQueryKeys.records(activeCompanyId, activeBranchId),
    retry: false,
  });

  const statements = useMemo(
    () =>
      optimisticStatements ??
      recordsQuery.data?.invoices.map((invoice) => ({
        id: invoice.id,
        ...invoiceToRecord(invoice),
      })) ??
      [],
    [optimisticStatements, recordsQuery.data?.invoices],
  );

  function refreshRecords() {
    setOptimisticStatements(null);
    void queryClient.invalidateQueries({
      queryKey: BillingStatementQueryKeys.all(activeCompanyId, activeBranchId),
    });
  }

  const statusMutation = useMutation({
    mutationFn: ({
      recordId,
      status,
    }: {
      recordId: string;
      status: BillingStatementStatus;
    }) => updateBillingStatementStatus({ recordId, status }),
    onSuccess: (record) => {
      refreshRecords();
      void queryClient.invalidateQueries({
        queryKey: BillingStatementQueryKeys.detail(
          activeCompanyId,
          activeBranchId,
          record.id,
        ),
      });
      toast.success(`Billing statement marked as ${record.status}.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update billing statement status.",
      );
    },
  });

  const state = useMemo<BillingStatementStoreState>(
    () => ({
      statements,
      addStatement: (statement) => setOptimisticStatements([statement, ...statements]),
      updateStatement: (statement) =>
        setOptimisticStatements(
          statements.map((currentStatement) =>
            currentStatement.id === statement.id ? statement : currentStatement,
          ),
        ),
      updateStatementStatus: (statement, status) =>
        statusMutation.mutate({ recordId: statement.id, status }),
      deleteStatement: (statementId) =>
        setOptimisticStatements(statements.filter((statement) => statement.id !== statementId)),
      lastSyncedAt: recordsQuery.dataUpdatedAt,
      isMutating: statusMutation.isPending || recordsQuery.isLoading,
    }),
    [recordsQuery.dataUpdatedAt, recordsQuery.isLoading, statements, statusMutation],
  );

  return selector ? selector(state) : (state as TSelected);
}

function invoiceToRecord(
  invoice: Awaited<ReturnType<typeof fetchBillingStatements>>["invoices"][number],
): Omit<BillingStatementRecord, "id"> {
  return {
    accountingEntries: invoice.journalEntries.map((entry) => ({
      accountCode: entry.accountCode,
      accountTitle: entry.accountTitle,
      atcCode: entry.atcCode ?? "",
      credit: entry.credit,
      debit: entry.debit,
      id: entry.id,
      partyCode: entry.partyCode ?? "",
      partyName: entry.partyName ?? "",
      particulars: entry.particulars ?? "",
      refNo: entry.refNo ?? "",
      responsibilityCenter: entry.responsibilityCenter ?? "",
      vatType: entry.vatType ?? "",
    })),
    attachments: [],
    businessStyle: invoice.address ?? invoice.businessStyle ?? "",
    code: invoice.customerCode,
    contactPerson: invoice.contactPerson ?? "",
    currency: invoice.currency,
    defaultAccount: invoice.receivableAccountTitle,
    description: invoice.details[0]?.description ?? "",
    discountAmount: invoice.discountAmount,
    donation: 0,
    documentDate: invoice.documentDate,
    dueDate: invoice.dueDate,
    ewtAmount: invoice.ewtAmount,
    exchangeRate: invoice.exchangeRate,
    expirationDate: invoice.dueDate,
    grossAmount: invoice.grossAmount,
    invoiceNo: invoice.invoiceNo ?? "",
    items: invoice.details.map((detail) => {
      const derivedAmounts = getDerivedBillingStatementDetailAmounts(detail);

      return {
        amount: detail.amount,
        description: detail.description,
        discountAmount: detail.discountAmount,
        discountPercent: detail.discountPercent.toString(),
        ewtAmount: detail.ewtAmount,
        ewtType: detail.ewtType ?? "",
        grossAmount: detail.grossAmount,
        grossAfterDiscount: derivedAmounts.grossAfterDiscount,
        id: detail.id,
        netAmount: detail.netAmount,
        netOfVatAmount: derivedAmounts.netOfVatAmount,
        particulars: detail.particulars ?? "",
        quantity: detail.quantity,
        responsibilityCenter: detail.responsibilityCenter ?? "",
        vatAmount: detail.vatAmount,
        vatInclusive: detail.vatInclusive ? "True" : "False",
        vatable: detail.vatable ? "True" : "False",
        vatType: detail.vatType ?? "",
        withEwt: detail.withEwt ? "True" : "False",
        withWvat: detail.withWvat ? "True" : "False",
        wvatAmount: detail.wvatAmount,
        wvatType: detail.wvatType ?? "",
      };
    }),
    joNo: "",
    name: invoice.customerName,
    netAmount: invoice.netAmount,
    poNo: "",
    projectName: invoice.projectName ?? "",
    projectRef: invoice.projectRef ?? "",
    recoupment: 0,
    refNo: invoice.referenceNo ?? "",
    remarks: invoice.remarks ?? "",
    resCustomer: "",
    resCustomerCode: invoice.details[0]?.responsibilityCenter ?? "",
    retention: 0,
    salesAssociate: invoice.salesAssociate ?? "",
    sjNo: "",
    sqNo: "",
    startDate: invoice.documentDate,
    status: mapApiStatus(invoice.status),
    teamAssigned: invoice.teamAssigned ?? "",
    terms: invoice.terms ?? invoice.termId ?? "",
    transNo: invoice.transactionNo,
    vatAmount: invoice.vatAmount,
    wvatAmount: invoice.wvatAmount,
  };
}

function getDerivedBillingStatementDetailAmounts(
  detail: Awaited<ReturnType<typeof fetchBillingStatements>>["invoices"][number]["details"][number],
) {
  const grossAmount = detail.amount * Math.max(detail.quantity, 0);
  const discountAmount = grossAmount * (Math.max(detail.discountPercent, 0) / 100);
  const grossAfterDiscount = Math.max(grossAmount - discountAmount, 0);
  const netOfVatAmount =
    detail.vatable && detail.vatInclusive
      ? Math.max(grossAfterDiscount - detail.vatAmount, 0)
      : grossAfterDiscount;

  return { grossAfterDiscount, netOfVatAmount };
}

function mapApiStatus(status: string): BillingStatementStatus {
  const statusMap: Record<string, BillingStatementStatus> = {
    CANCELLED: "Cancelled",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? "Draft";
}
