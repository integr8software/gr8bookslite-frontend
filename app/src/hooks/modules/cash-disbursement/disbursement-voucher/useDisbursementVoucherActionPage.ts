"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  DisbursementVoucherBankAccounts,
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherDefaultAccounts,
  applyCopyFromRecordsToDisbursementVoucherForm,
  createBlankDisbursementLineEntry,
  createDisbursementTransactionFromForm,
  createDisbursementVoucherFromForm,
  createDisbursementVoucherStatusHistoryEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
  updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { clearAccountingGridSession } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import {
  canUpdateDisbursementVoucherStatus,
  createInitialDisbursementVoucherFormValues,
  createManualDisbursementTransactionId,
  createVoucherActionReturnHref,
  getDisbursementVoucherActionMode,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionData";
import {
  createAutomaticAccountingEntries,
  hasNonZeroAccountingAmount,
  isGeneratedAccountingEntry,
  normalizeDisbursementLineEntryFields,
  shouldSyncDisbursementEntryParty,
  syncDisbursementLineEntryTaxDetails,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import {
  DisbursementVoucherHref,
  DisbursementVoucherStatuses,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  DisbursementLineEntry,
  DisbursementVoucherActionTab,
  DisbursementVoucherBankAccount,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
  clearDisbursementEntryRows,
  createDisbursementEntryRows,
  duplicateDisbursementEntryRow,
  insertDisbursementEntryRow,
  moveDisbursementEntryRow,
  removeDisbursementEntryRow,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/utils/DisbursementVoucherEntryRowUtils";

export function useDisbursementVoucherActionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const mode = getDisbursementVoucherActionMode(pathname);
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const addTransaction = useDisbursementVoucherStore((state) => state.addTransaction);
  const updateTransaction = useDisbursementVoucherStore((state) => state.updateTransaction);
  const addVoucher = useDisbursementVoucherStore((state) => state.addVoucher);
  const updateVoucher = useDisbursementVoucherStore((state) => state.updateVoucher);
  const routeTransactionId = mode === "add" ? (searchParams.get("transactionId") ?? "") : (params.recordId ?? "");
  const routeTransaction = transactions.find((transaction) => transaction.id === routeTransactionId);
  const routeVoucher = vouchers.find((voucher) => voucher.transactionId === routeTransactionId);
  const returnHref = createVoucherActionReturnHref(searchParams.get("from"), routeTransactionId);
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createInitialDisbursementVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: routeVoucher,
    }),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [activeTab, setActiveTab] = useState<DisbursementVoucherActionTab>("details");
  const [isBankMasterfileDrawerOpen, setIsBankMasterfileDrawerOpen] = useState(false);
  const [isDefaultAccountDrawerOpen, setIsDefaultAccountDrawerOpen] = useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
  const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const bankMasterfileStore = useBankMasterfileStore();
  const defaultAccountStore = useDefaultAccountStore();
  const paymentTypeStore = usePaymentTypeStore();
  const partyStore = usePartyManagementStore();
  const bankAccounts = DisbursementVoucherBankAccounts;
  const defaultAccounts = DisbursementVoucherDefaultAccounts;
  const selectedTransaction = transactions.find((transaction) => transaction.id === values.transactionId);
  const existingVoucher = vouchers.find((voucher) => voucher.transactionId === values.transactionId);
  const currentStatus = existingVoucher?.status ?? selectedTransaction?.status ?? values.status;
  const isReadonly = mode === "view" || (mode === "edit" && !canEditDisbursementVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const selectedBankAccount = bankAccounts.find((account) => account.accountCode === values.paymentDetails.bankAccountCode) ?? null;
  const selectedPaymentTypeRecord = paymentTypeStore.paymentTypes.find((record) => record.paymentType === values.paymentMethod) ?? null;
  const isRecordMissing = (!selectedTransaction && mode !== "add") || (mode === "edit" && !existingVoucher);

  useEffect(() => {
    clearAccountingGridSession();
  }, []);

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(field: TKey, value: DisbursementVoucherFormValues[TKey]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updatePaymentDetails(nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>) {
    updateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
  }

  function createAutomaticEntriesForPayment(
    entries: DisbursementLineEntry[],
    overrides: {
      bankAccount?: DisbursementVoucherBankAccount | null;
      paymentMethod?: string;
    } = {},
  ) {
    const nextPaymentMethod = overrides.paymentMethod ?? values.paymentMethod;
    const paymentTypeRecord = paymentTypeStore.paymentTypes.find((record) => record.paymentType === nextPaymentMethod) ?? null;
    const isCashPayment = paymentTypeRecord?.type === "Cash" || nextPaymentMethod.trim().toLowerCase() === "cash";
    const bankAccount = overrides.bankAccount !== undefined ? overrides.bankAccount : selectedBankAccount;

    return createAutomaticAccountingEntries(entries, {
      bankAccount,
      isCashPayment,
      paymentMethod: nextPaymentMethod,
    });
  }

  function handlePartyChange(partyCode: string, partyName: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const previousPartyCode = current.partyCode;
      const previousPartyName = current.partyName;

      return {
        ...current,
        partyCode,
        partyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: partyName,
        },
        lineEntries: current.lineEntries.map((entry) =>
          shouldSyncDisbursementEntryParty(entry, previousPartyCode, previousPartyName)
            ? {
                ...entry,
                partyCode,
                partyName,
              }
            : entry,
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
    }));
  }

  function syncCashEntriesForPaymentType(paymentMethod: string) {
    const paymentTypeRecord = paymentTypeStore.paymentTypes.find((record) => record.paymentType === paymentMethod) ?? null;
    const isCashPayment = paymentTypeRecord?.type === "Cash" || paymentMethod.trim().toLowerCase() === "cash";

    updateField(
      "lineEntries",
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount: isCashPayment ? null : selectedBankAccount,
        paymentMethod,
      }),
    );
  }

  function handlePaymentTypeChange(paymentMethod: string) {
    updateField("paymentMethod", paymentMethod);
    updatePaymentDetails({
      checkStatus: "",
      commission: "",
      isMultiCheckNumber: false,
      payee: values.partyName,
      paymentReferenceNo: "",
      transferAccountName: "",
      transferAccountNo: "",
      transferTo: "",
      transferToBank: "",
    });
    syncCashEntriesForPaymentType(paymentMethod);
  }

  function handleBankAccountChange(accountCode: string) {
    const bankAccount = bankAccounts.find((account) => account.accountCode === accountCode) ?? null;

    if (!bankAccount) {
      updatePaymentDetails({
        bankAccountCode: "",
        bankAccountName: "",
        bankAccountNo: "",
        bankAccountTitle: "",
        bankBranch: "",
        bankName: "",
      });
      updateField(
        "lineEntries",
        createAutomaticEntriesForPayment(values.lineEntries, {
          bankAccount: null,
        }),
      );
      return;
    }

    updatePaymentDetails({
      bankAccountCode: bankAccount.accountCode,
      bankAccountName: bankAccount.accountName,
      bankAccountNo: bankAccount.accountNo,
      bankAccountTitle: bankAccount.accountTitle,
      bankBranch: bankAccount.branch,
      bankName: bankAccount.bankName,
    });
    updateField(
      "lineEntries",
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount,
      }),
    );
  }

  function createBlankEntry(): DisbursementLineEntry {
    const refId = values.voucherReferenceNo || selectedTransaction?.transactionNo || values.transactionId;
    const responsibilityCenter = values.costCenter || selectedTransaction?.costCenter || "";

    return createBlankDisbursementLineEntry({
      partyCode: values.partyCode,
      partyName: values.partyName,
      refId,
      responsibilityCenter,
      taxDetails: {
        ...createTaxDetails(0, "0%"),
        refId,
        responsibilityCenter,
      },
    });
  }

  function replaceEntriesWithAutomaticRows(nextEntries: DisbursementLineEntry[]) {
    updateField("lineEntries", createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]));
  }

  function handleAddEntries(count = 1) {
    updateField("lineEntries", [...values.lineEntries, ...createDisbursementEntryRows(count, createBlankEntry)]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    replaceEntriesWithAutomaticRows(removeDisbursementEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof DisbursementLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<DisbursementLineEntry>) {
    updateField(
      "lineEntries",
      values.lineEntries.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }

        const nextEntry = normalizeDisbursementLineEntryFields({
          ...entry,
          ...updates,
        });

        if (Number(nextEntry.debit || 0) > 0) {
          nextEntry.credit = 0;
        }

        if (Number(nextEntry.credit || 0) > 0) {
          nextEntry.debit = 0;
        }

        return syncDisbursementLineEntryTaxDetails(nextEntry);
      }),
    );
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    updateField("lineEntries", insertDisbursementEntryRow(values.lineEntries, entryId, position, createBlankEntry));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    updateField(
      "lineEntries",
      duplicateDisbursementEntryRow(values.lineEntries, entryId, () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    updateField("lineEntries", moveDisbursementEntryRow(values.lineEntries, fromEntryId, toEntryId));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    replaceEntriesWithAutomaticRows(clearDisbursementEntryRows(values.lineEntries, action));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: DisbursementLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails.amount || 0), 0);

    updateField("lineEntries", nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField("taxDetails", syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate));
  }

  function submitDisbursementVoucher(status: DisbursementVoucherStatus) {
    if (isReadonly) {
      return;
    }

    const valuesForSubmit = {
      ...values,
      status,
      transactionId: values.transactionId.trim() || createManualDisbursementTransactionId(),
    };
    const detailsErrors = validateDisbursementVoucherDetails(valuesForSubmit);
    const entryErrors = validateDisbursementVoucherEntries(valuesForSubmit);
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      return;
    }

    setValues(valuesForSubmit);

    if (mode === "edit" && existingVoucher) {
      updateVoucher(updateDisbursementVoucherFromForm(existingVoucher, valuesForSubmit));
    } else {
      if (!selectedTransaction) {
        addTransaction(createDisbursementTransactionFromForm(valuesForSubmit));
      }
      addVoucher(createDisbursementVoucherFromForm(valuesForSubmit));
    }

    router.push(returnHref);
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    submitDisbursementVoucher(DisbursementVoucherStatuses.forApproval);
  }

  function handleUpdateStatus(status: DisbursementVoucherStatus) {
    if (!canUpdateDisbursementVoucherStatus(currentStatus, status)) {
      return;
    }

    const updatedAt = new Date().toISOString();

    setValues((currentValues) => ({ ...currentValues, status }));

    if (existingVoucher) {
      updateVoucher({
        ...existingVoucher,
        status,
        updatedBy: "Current User",
        updatedAt,
        history: [...(existingVoucher.history ?? []), createDisbursementVoucherStatusHistoryEntry(status, existingVoucher.voucherNo)],
      });
      return;
    }

    if (selectedTransaction) {
      updateTransaction({
        ...selectedTransaction,
        status,
        updatedBy: "Current User",
        updatedAt,
      });
    }
  }

  function handleCopyFrom(recordIds: string[]) {
    const selectedRecords = recordIds
      .map((recordId) => DisbursementVoucherCopyFromRecords.find((candidate) => candidate.id === recordId))
      .filter((record): record is (typeof DisbursementVoucherCopyFromRecords)[number] => Boolean(record));

    if (selectedRecords.length === 0) {
      return;
    }

    setValues((currentValues) => applyCopyFromRecordsToDisbursementVoucherForm(currentValues, selectedRecords));
    setErrors({});
  }

  function handleCreateParty(record: Parameters<typeof getPartyDisplayName>[0]) {
    const partyName = getPartyDisplayName(record);

    handlePartyChange(record.partyCodeNo, partyName);
    setIsPartyNameDrawerOpen(false);
  }

  return {
    activeTab,
    bankAccounts,
    currentStatus,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isBankMasterfileDrawerOpen,
    isDefaultAccountDrawerOpen,
    isPartyNameDrawerOpen,
    isPaymentTypeDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    mode,
    partyStore,
    paymentTypeStore,
    returnHref: isRecordMissing ? DisbursementVoucherHref : returnHref,
    selectedBankAccount,
    selectedPaymentTypeRecord,
    selectedTransaction,
    totalCredit,
    totalDebit,
    values,
    bankMasterfileStore,
    handleAddEntries,
    handleBankAccountChange,
    handleClearEntries,
    handleCopyFrom,
    handleCreateParty,
    handleDuplicateEntry,
    handleInsertEntry,
    handleMoveEntry,
    handlePaymentTypeChange,
    handlePartyChange,
    handleRemoveEntry,
    handleReplaceLineEntries,
    handleSubmit,
    handleUpdateEntry,
    handleUpdateEntryFields,
    handleUpdateStatus,
    setActiveTab,
    setIsBankMasterfileDrawerOpen,
    setIsDefaultAccountDrawerOpen,
    setIsPartyNameDrawerOpen,
    setIsPaymentTypeDrawerOpen,
    setIsReportPreviewOpen,
    submitDisbursementVoucher,
    updateField,
    updatePaymentDetails,
  };
}
