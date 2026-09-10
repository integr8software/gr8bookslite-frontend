"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  applyMissingPartyTaxDefaultsToEntries,
  applyPartyTaxDefaults,
  createBlankDisbursementLineEntry,
  createTaxDetails,
  findPartyTaxCode,
  getDisbursementVoucherDetailNumber,
  getDisbursementVoucherDetailString,
  getHydratedDisbursementVoucherGrossAmount,
  roundHydratedDisbursementVoucherAmount,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  canUpdateDisbursementVoucherStatus,
  createInitialDisbursementVoucherFormValues,
  createVoucherActionReturnLink,
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
  DisbursementVoucherActionModes,
  DisbursementVoucherLink,
  DisbursementVoucherStatuses,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  CashDisbursementAccountingGridSessionStorageKey,
  DisbursementVoucherLineEntriesField,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { BankMasterfileStatuses } from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { useDisbursementTypeStore } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementType";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefaultAccountOptionGroups } from "@/app/src/hooks/shared/tax/useTaxOptions";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/data/shared/tax/TaxData";
import type {
  DisbursementLineEntry,
  DisbursementVoucherActionMode,
  DisbursementVoucherActionTab,
  DisbursementVoucherBankAccount,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherStatus,
  DisbursementVoucherRecord,
  VoucherCurrency,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { mergeUniqueTextValues } from "@/app/src/utils/string.util";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { GeneratedAccountingAccount } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { TaxDefaultAccountOption } from "@/app/src/types/shared/tax/TaxTypes";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { DisbursementVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherQueryKeys";
import { FetchChartAccountsTree } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useDisbursementVoucherDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucherDetailsLookups";
import {
  fetchAccountsPayableVoucherCopyFromCandidates,
  type AccountsPayableVoucherCopyFromCandidate,
} from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherApi";
import { AccountsPayableVoucherQueryKeys } from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherQueryKeys";
import {
  fetchAdvanceToSupplierCopyFromCandidates,
  type AdvanceToSupplierCopyFromCandidate,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersApi";
import { AdvancesToSuppliersQueryKeys } from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersQueryKeys";
import {
  fetchCashAdvanceCopyFromCandidates,
  type CashAdvanceCopyFromCandidate,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { CashAdvanceQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceQueryKeys";
import {
  fetchPettyCashReplenishmentCopyFromCandidates,
  type PettyCashReplenishmentCopyFromCandidate,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import { PettyCashReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentQueryKeys";
import {
  fetchRevolvingFundReplenishmentCopyFromCandidates,
  type RevolvingFundReplenishmentCopyFromCandidate,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import { RevolvingFundReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentQueryKeys";
import {
  fetchJournalVoucherCopyFromCandidates,
  type JournalVoucherCopyFromCandidate,
} from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherService";
import { JournalVoucherQueryKeys } from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherQueryKeys";
import {
  createDisbursementVoucherApi,
  fetchDisbursementVoucherById,
  fetchNextDisbursementVoucherTransactionNo,
  updateDisbursementVoucherApi,
  updateDisbursementVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherApi";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  clearDisbursementEntryRows,
  createDisbursementEntryRows,
  duplicateDisbursementEntryRow,
  insertDisbursementEntryRow,
  moveDisbursementEntryRow,
  removeDisbursementEntryRow,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherEntryRowData";
import {
  buildPaymentVoucherCopyFromRecords,
  findPaymentVoucherCopyCandidates,
  getEditablePaymentVoucherCopyEntries,
  getPaymentVoucherCopiedDisburseAmount,
  getPaymentVoucherCopyRatio,
  PaymentVoucherCopyPrefixes,
  scalePaymentVoucherCopyAmount,
  validatePaymentVoucherCopySelection,
} from "@/app/src/data/modules/cash-disbursement/shared/PaymentVoucherCopyFromData";

export function useDisbursementVoucherActionPage(mode: DisbursementVoucherActionMode) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const routeTransactionId =
    mode === DisbursementVoucherActionModes.Add ? (searchParams.get("transactionId") ?? "") : (params.recordId ?? "");
  const routeTransaction = transactions.find((transaction) => transaction.id === routeTransactionId);
  const listVoucher = vouchers.find((voucher) => voucher.id === routeTransactionId || voucher.transactionId === routeTransactionId);
  const recordQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.record(routeTransactionId, activeCompanyId, activeBranchId),
    queryFn: () => fetchDisbursementVoucherById(routeTransactionId),
    enabled: Boolean(routeTransactionId && mode !== DisbursementVoucherActionModes.Add),
  });
  const accountOptionsQuery = usePostingAccountLookup();
  const chartAccountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(activeCompanyId),
    queryFn: FetchChartAccountsTree,
    enabled: activeCompanyId !== null,
    staleTime: 60_000,
  });
  const routeVoucher = recordQuery.data ?? listVoucher;
  const returnLink = createVoucherActionReturnLink(searchParams.get("from"), routeTransactionId);
  const transactionCurrency = useTransactionCurrency();
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createInitialDisbursementVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: routeVoucher,
    }),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [pendingSubmitValues, setPendingSubmitValues] = useState<DisbursementVoucherFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<DisbursementVoucherActionTab>("details");
  const [isBankMasterfileDrawerOpen, setIsBankMasterfileDrawerOpen] = useState(false);
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] = useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
  const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
  const [isProjectNameDrawerOpen, setIsProjectNameDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterEntryId, setPendingResponsibilityCenterEntryId] = useState<string | null>(null);
  const blankRemarksEntryIdsRef = useRef(new Set<string>());
  const generatedRemarksOverridesRef = useRef<Record<string, string>>({});
  const hasEditedCurrencyRef = useRef(false);
  const hydratedPartyTaxDefaultsRecordIdRef = useRef("");
  const isSubmittingRef = useRef(false);
  const submitLockReleaseRef = useRef<null | (() => void)>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bankMasterfileStore = useBankMasterfileStore();
  const defaultAccountStore = useDisbursementTypeStore(undefined, { kind: "disbursement" });
  const paymentTypeStore = usePaymentTypeStore();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const defaultAccounts = defaultAccountStore.disbursementTypes;
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxDefaultAccountOptionsQuery = useTaxDefaultAccountOptionGroups();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const inputVatAccountsByTaxCode = useMemo(
    () =>
      createGeneratedAccountingAccountMap(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "input-purchases")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );
  const withholdingTaxAccountsByCode = useMemo(
    () =>
      createGeneratedAccountingAccountMap(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "purchase-ewt")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );
  const copyFromPartyName = values.partyName.trim();
  const copyFromPartyCode = copyFromPartyName ? values.partyCode.trim() : "";
  const copyFromCandidatesQuery = useQuery({
    queryKey: AccountsPayableVoucherQueryKeys.copyFromCandidates(
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ),
    queryFn: () =>
      fetchAccountsPayableVoucherCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const apvCopyFromCandidates = useMemo(() => copyFromCandidatesQuery.data ?? [], [copyFromCandidatesQuery.data]);
  const advanceToSupplierCopyFromCandidatesQuery = useQuery({
    queryKey: AdvancesToSuppliersQueryKeys.copyFromCandidates(
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ),
    queryFn: () =>
      fetchAdvanceToSupplierCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const atsCopyFromCandidates = useMemo(
    () => advanceToSupplierCopyFromCandidatesQuery.data ?? [],
    [advanceToSupplierCopyFromCandidatesQuery.data],
  );
  const cashAdvanceCopyFromCandidatesQuery = useQuery({
    queryKey: CashAdvanceQueryKeys.copyFromCandidates(
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ),
    queryFn: () =>
      fetchCashAdvanceCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const cashAdvanceCopyFromCandidates = useMemo(
    () => cashAdvanceCopyFromCandidatesQuery.data ?? [],
    [cashAdvanceCopyFromCandidatesQuery.data],
  );
  const pettyCashReplenishmentCopyFromCandidatesQuery = useQuery({
    queryKey: [
      ...PettyCashReplenishmentQueryKeys.all,
      "copy-from",
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ],
    queryFn: () =>
      fetchPettyCashReplenishmentCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const pcrCopyFromCandidates = useMemo(
    () => pettyCashReplenishmentCopyFromCandidatesQuery.data ?? [],
    [pettyCashReplenishmentCopyFromCandidatesQuery.data],
  );
  const revolvingFundReplenishmentCopyFromCandidatesQuery = useQuery({
    queryKey: [
      ...RevolvingFundReplenishmentQueryKeys.all,
      "copy-from",
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ],
    queryFn: () =>
      fetchRevolvingFundReplenishmentCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const rfrCopyFromCandidates = useMemo(
    () => revolvingFundReplenishmentCopyFromCandidatesQuery.data ?? [],
    [revolvingFundReplenishmentCopyFromCandidatesQuery.data],
  );
  const copiedApvReferences = useMemo(
    () =>
      new Set(
        values.lineEntries
          .filter((entry) => !isGeneratedAccountingEntry(entry))
          .map((entry) => entry.refId?.trim())
          .filter((refId): refId is string => Boolean(refId)),
      ),
    [values.lineEntries],
  );
  const journalVoucherCopyFromCandidatesQuery = useQuery({
    queryKey: JournalVoucherQueryKeys.copyFromCandidates(
      "disbursement-voucher",
      activeCompanyId,
      activeBranchId,
      copyFromPartyCode,
      copyFromPartyName,
    ),
    queryFn: () =>
      fetchJournalVoucherCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: copyFromPartyCode,
        partyName: copyFromPartyName,
        target: "disbursement-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const journalVoucherCopyFromCandidates = useMemo(
    () => journalVoucherCopyFromCandidatesQuery.data ?? [],
    [journalVoucherCopyFromCandidatesQuery.data],
  );
  const copyFromRecords = useMemo(
    () =>
      buildPaymentVoucherCopyFromRecords({
        accountsPayableVouchers: apvCopyFromCandidates,
        advancesToSuppliers: atsCopyFromCandidates,
        cashAdvances: cashAdvanceCopyFromCandidates,
        copiedReferences: copiedApvReferences,
        journalVouchers: journalVoucherCopyFromCandidates,
        pettyCashReplenishments: pcrCopyFromCandidates,
        revolvingFundReplenishments: rfrCopyFromCandidates,
      }),
    [
      apvCopyFromCandidates,
      atsCopyFromCandidates,
      cashAdvanceCopyFromCandidates,
      copiedApvReferences,
      journalVoucherCopyFromCandidates,
      pcrCopyFromCandidates,
      rfrCopyFromCandidates,
    ],
  );
  const { partyOptions, paymentTypeRecords, projectOptions, responsibilityCenterOptions } = useDisbursementVoucherDetailsLookups(values);

  const bankAccounts = useMemo(
    () =>
      bankMasterfileStore.banks
        .filter((bank) => bank.status === BankMasterfileStatuses.Active)
        .map((bank) => ({
          id: bank.id,
          accountCode: bank.accountCode,
          accountTitle: bank.accountTitle,
          bankName: bank.bankName,
          branch: bank.branch,
          accountName: bank.accountName,
          accountNo: bank.accountNumber,
        })),
    [bankMasterfileStore.banks],
  );
  const selectedTransaction = transactions.find((transaction) => transaction.id === values.transactionId);
  const existingVoucher = routeVoucher ?? vouchers.find((voucher) => voucher.transactionId === values.transactionId);
  const currentStatus = existingVoucher?.status ?? selectedTransaction?.status ?? values.status;
  const isReadonly =
    mode === DisbursementVoucherActionModes.View ||
    (mode === DisbursementVoucherActionModes.Edit && !canEditDisbursementVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const selectedBankAccount = bankAccounts.find((account) => account.accountCode === values.paymentDetails.bankAccountCode) ?? null;
  const selectedPaymentTypeRecord = paymentTypeRecords.find((record) => record.paymentType === values.paymentMethod) ?? null;
  const routePaymentMethod = existingVoucher?.paymentMethod ?? selectedTransaction?.paymentMethod ?? "";
  const isCashVoucherRoute = (mode !== DisbursementVoucherActionModes.Add || Boolean(routeTransactionId)) && routePaymentMethod === "Cash";
  const isRecordMissing = (mode !== DisbursementVoucherActionModes.Add && !recordQuery.isLoading && !existingVoucher) || isCashVoucherRoute;
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === DisbursementVoucherActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["voucherNo"]) : rawIsDirty;
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:disbursement-voucher", recordId: params.recordId }),
    setValues,
    values,
  });
  const refreshNextTransactionNo = useCallback(async () => {
    try {
      const nextTransactionNo = await fetchNextDisbursementVoucherTransactionNo(activeBranchId ?? undefined);
      if (!nextTransactionNo) return;

      setValues((current) => ({ ...current, voucherNo: nextTransactionNo, transactionId: nextTransactionNo }));
      setInitialValues((current) => ({ ...current, voucherNo: nextTransactionNo, transactionId: nextTransactionNo }));
    } catch {
      // Keep the current add form while transaction-number setup is unavailable.
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (!existingVoucher || mode === DisbursementVoucherActionModes.Add) return;

    const rawRecord = existingVoucher as DisbursementVoucherRecord & {
      details?: Array<Record<string, unknown>>;
      detailsEntries?: Array<Record<string, unknown>>;
      lineEntries?: Array<Record<string, unknown>>;
    };
    const rawDetails: Array<Record<string, unknown>> = (
      rawRecord.lineEntries && rawRecord.lineEntries.length > 0
        ? rawRecord.lineEntries
        : rawRecord.details || rawRecord.detailsEntries || []
    ) as Array<Record<string, unknown>>;

    const mappedEntries: DisbursementLineEntry[] = rawDetails.map((d, index) => {
      const grossAmount = getHydratedDisbursementVoucherGrossAmount(d);
      const vatPercent = getDisbursementVoucherDetailNumber(d, "vatPercent");
      const ewtPercent = getDisbursementVoucherDetailNumber(d, "ewtPercent");
      const taxDetails = syncTaxDetailsAmount(
        {
          ...createTaxDetails(grossAmount, "0%"),
          vatType: (d.vatType as string) || "",
          vatCode: getDisbursementVoucherDetailString(d, "vatCode"),
          vatPercent,
          ewtCode: getDisbursementVoucherDetailString(d, "ewtCode"),
          ewtPercent,
          refId: (d.refId as string) || existingVoucher.voucherNo,
          responsibilityCenter: (d.responsibilityCenter as string) || existingVoucher.costCenter || "",
        },
        grossAmount,
        "0%",
      );

      return {
        id: d.id ? String(d.id) : `entry-${index + 1}`,
        accountCode: (d.accountCode as string) || "",
        accountName: (d.accountTitle as string) || (d.accountName as string) || "",
        particulars: (d.particulars as string) || (d.remarks as string) || "",
        remarks: (d.remarks as string) || "",
        debit: Number(d.debit || 0),
        credit: Number(d.credit || 0),
        taxRate: vatPercent > 0 ? `${vatPercent}%` : "0%",
        taxDetails,
        partyCode: (d.partyCode as string) || existingVoucher.partyCode,
        partyName: (d.partyName as string) || existingVoucher.partyName,
        responsibilityCenter: (d.responsibilityCenter as string) || existingVoucher.costCenter || "",
        refId: (d.refId as string) || existingVoucher.voucherNo,
        checkDate: (d.checkDate as string) || "",
        checkNo: (d.checkNo as string) || "",
        checkStatus: (d.checkStatus as string) || "",
        status: "Balanced",
      };
    });

    const voucherGrossAmount =
      mappedEntries
        .filter((entry) => !isGeneratedAccountingEntry(entry))
        .reduce((sum, entry) => sum + Number(entry.taxDetails.grossAmount || 0), 0) ||
      existingVoucher.amount ||
      0;

    queueMicrotask(() => {
      const nextValues: DisbursementVoucherFormValues = {
        transactionId: existingVoucher.id,
        voucherNo: existingVoucher.voucherNo,
        voucherDate: existingVoucher.voucherDate,
        paymentDueDate: existingVoucher.paymentDueDate || existingVoucher.voucherDate,
        paymentMethod: existingVoucher.paymentMethod || "",
        disbursementType: existingVoucher.disbursementType || "Vendor Payment",
        currency: existingVoucher.currency || "PHP",
        fxRate: String(existingVoucher.fxRate ?? "1.00"),
        costCenter: existingVoucher.projectCode || existingVoucher.costCenter || "",
        projectCode: existingVoucher.projectCode || existingVoucher.costCenter || "",
        projectName: existingVoucher.projectName || "",
        partyCode: existingVoucher.partyCode || "",
        partyName: existingVoucher.partyName || "",
        amount: String(voucherGrossAmount),
        taxRate: "0%",
        taxDetails: createTaxDetails(voucherGrossAmount, "0%"),
        remarks: existingVoucher.remarks || "",
        referenceModule: existingVoucher.referenceModule || "",
        voucherReferenceNo: existingVoucher.voucherReferenceNo || "",
        invoiceReferenceNo: existingVoucher.invoiceReferenceNo || "",
        paymentDetails: existingVoucher.paymentDetails || {
          bankAccountCode: "",
          bankAccountName: "",
          bankAccountNo: "",
          bankAccountTitle: "",
          bankBranch: "",
          bankName: "",
          checkDate: "",
          checkNo: "",
          checkStatus: "",
          isMultiCheckNumber: false,
          payee: existingVoucher.partyName || "",
          paymentReferenceNo: "",
          transferAccountName: "",
          transferAccountNo: "",
          transferToBank: "",
          transferTo: "",
        },
        preparedBy: existingVoucher.preparedBy || "",
        status: existingVoucher.status || "Draft",
        lineEntries: mappedEntries.length > 0 ? mappedEntries : createInitialDisbursementVoucherFormValues({ mode }).lineEntries,
        attachments: existingVoucher.attachments || [],
      };
      setValues(nextValues);
      setInitialValues(nextValues);
    });
  }, [existingVoucher, mode, routeTransaction]);

  useEffect(() => {
    if (!existingVoucher || mode === DisbursementVoucherActionModes.Add || partyOptions.length === 0 || taxCodes.length === 0) {
      return;
    }

    if (hydratedPartyTaxDefaultsRecordIdRef.current === existingVoucher.id) {
      return;
    }

    const { changed, entries: nextEntries } = applyMissingPartyTaxDefaultsToEntries(values.lineEntries, partyOptions, taxCodes);

    if (!changed) {
      hydratedPartyTaxDefaultsRecordIdRef.current = existingVoucher.id;
      return;
    }

    hydratedPartyTaxDefaultsRecordIdRef.current = existingVoucher.id;
    setValues((current) => {
      const bankAccount = bankAccounts.find((account) => account.accountCode === current.paymentDetails.bankAccountCode) ?? null;
      return {
        ...current,
        lineEntries: createAutomaticAccountingEntries(nextEntries, {
          bankAccount,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          paymentMethod: current.paymentMethod,
          withholdingTaxAccountsByCode,
        }),
      };
    });
  }, [
    bankAccounts,
    existingVoucher,
    inputVatAccountsByTaxCode,
    mode,
    partyOptions,
    taxCodes,
    values.lineEntries,
    withholdingTaxAccountsByCode,
  ]);

  useEffect(() => {
    if (mode !== DisbursementVoucherActionModes.Add) return;

    queueMicrotask(() => {
      void refreshNextTransactionNo();
    });
  }, [mode, refreshNextTransactionNo]);

  useEffect(() => {
    clearAccountingGridSession();
  }, []);

  useEffect(() => {
    if (mode !== DisbursementVoucherActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
    setInitialValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(field: TKey, value: DisbursementVoucherFormValues[TKey]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextValues = { ...current, [field]: value };

      if (field !== "remarks") {
        return nextValues;
      }

      const nextRemarks = String(value ?? "");
      const editableEntries = current.lineEntries
        .filter((entry) => !isGeneratedAccountingEntry(entry))
        .map((entry) =>
          !blankRemarksEntryIdsRef.current.has(entry.id) && shouldEntryRemarksFollowHeader(entry, current.remarks)
            ? { ...entry, particulars: nextRemarks, remarks: nextRemarks }
            : entry,
        );
      const bankAccount = bankAccounts.find((account) => account.accountCode === current.paymentDetails.bankAccountCode) ?? null;

      return {
        ...nextValues,
        lineEntries: createAutomaticAccountingEntries(editableEntries, {
          bankAccount,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          paymentMethod: current.paymentMethod,
          withholdingTaxAccountsByCode,
        }),
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updatePaymentDetails(nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>) {
    updateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
    setErrors((current) => {
      const nextErrors = { ...current };

      for (const field of Object.keys(nextDetails) as Array<keyof typeof nextDetails>) {
        if (field in nextErrors) {
          delete nextErrors[field as keyof typeof nextErrors];
        }
      }

      return nextErrors;
    });
  }

  async function handleCurrencyChange(currencyCode: string) {
    if (isReadonly) {
      return;
    }

    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, fxRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);

      if (exchangeRate != null) {
        updateField("fxRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      setErrors((current) => ({ ...current, fxRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function createAutomaticEntriesForPayment(
    entries: DisbursementLineEntry[],
    overrides: {
      bankAccount?: DisbursementVoucherBankAccount | null;
      paymentMethod?: string;
    } = {},
  ) {
    const nextPaymentMethod = overrides.paymentMethod ?? values.paymentMethod;
    const bankAccount = overrides.bankAccount !== undefined ? overrides.bankAccount : selectedBankAccount;

    return createAutomaticAccountingEntries(entries, {
      bankAccount,
      blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
      generatedRemarksOverrides: generatedRemarksOverridesRef.current,
      inputVatAccountsByTaxCode,
      paymentMethod: nextPaymentMethod,
      withholdingTaxAccountsByCode,
    });
  }

  function handlePartyChange(partyCode: string, partyName: string) {
    if (isReadonly) {
      return;
    }

    const selectedParty =
      partyOptions.find(
        (opt) => opt.value === partyCode || opt.label === partyCode || opt.name.trim().toLowerCase() === partyName.trim().toLowerCase(),
      ) ??
      partyStore.records.find(
        (record) => record.partyCodeNo === partyCode || getPartyDisplayName(record).trim().toLowerCase() === partyName.trim().toLowerCase(),
      );
    const defaultVatCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseInputVatTaxSourceKey, "VAT");
    const defaultEwtCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseEwtTaxSourceKey, "EWT");
    const nextTaxRate = defaultVatCode ? getVatRateFromCode(defaultVatCode, taxCodes) : "0%";
    const vatPercent = defaultVatCode ? getVatPercentFromRate(nextTaxRate) : 0;
    const ewtPercent = defaultEwtCode ? getEwtPercentFromCode(defaultEwtCode, taxCodes) : 0;

    setValues((current) => {
      const previousPartyCode = current.partyCode;
      const previousPartyName = current.partyName;
      const bankAccount = bankAccounts.find((account) => account.accountCode === current.paymentDetails.bankAccountCode) ?? null;

      const updatedEntries = current.lineEntries.map((entry) => {
        if (!shouldSyncDisbursementEntryParty(entry, previousPartyCode, previousPartyName)) {
          return entry;
        }

        return {
          ...applyPartyTaxDefaults(
            {
              ...entry,
              partyCode,
              partyName,
            },
            defaultVatCode,
            defaultEwtCode,
            vatPercent,
            ewtPercent,
          ),
          taxRate: nextTaxRate,
        };
      });

      return {
        ...current,
        partyCode,
        partyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: partyName,
        },
        lineEntries: createAutomaticAccountingEntries(updatedEntries, {
          bankAccount,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          paymentMethod: current.paymentMethod,
          withholdingTaxAccountsByCode,
        }),
      };
    });
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
    }));
  }

  function syncEntriesForPaymentType(paymentMethod: string) {
    updateField(
      DisbursementVoucherLineEntriesField,
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount: selectedBankAccount,
        paymentMethod,
      }),
    );
  }

  function handlePaymentTypeChange(paymentMethod: string) {
    updateField("paymentMethod", paymentMethod);
    updatePaymentDetails({
      checkStatus: "",
      isMultiCheckNumber: false,
      payee: values.partyName,
      paymentReferenceNo: "",
      transferAccountName: "",
      transferAccountNo: "",
      transferTo: "",
      transferToBank: "",
    });
    syncEntriesForPaymentType(paymentMethod);
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
        DisbursementVoucherLineEntriesField,
        createAutomaticEntriesForPayment(values.lineEntries, {
          bankAccount: null,
        }),
      );
      return;
    }

    const isSameAsToBank =
      Boolean(values.paymentDetails.transferToBank) &&
      (values.paymentDetails.transferToBank === bankAccount.bankName || values.paymentDetails.transferAccountNo === bankAccount.accountNo);

    updatePaymentDetails({
      bankAccountCode: bankAccount.accountCode,
      bankAccountName: bankAccount.accountName,
      bankAccountNo: bankAccount.accountNo,
      bankAccountTitle: bankAccount.accountTitle,
      bankBranch: bankAccount.branch,
      bankName: bankAccount.bankName,
      ...(isSameAsToBank
        ? {
            transferAccountName: "",
            transferAccountNo: "",
            transferToBank: "",
          }
        : {}),
    });
    updateField(
      DisbursementVoucherLineEntriesField,
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
      remarks: values.remarks,
      responsibilityCenter,
      taxDetails: {
        ...createTaxDetails(0, "0%"),
        refId,
        responsibilityCenter,
      },
    });
  }

  function replaceEntriesWithAutomaticRows(nextEntries: DisbursementLineEntry[]) {
    updateField(
      DisbursementVoucherLineEntriesField,
      createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]),
    );
  }

  function handleAddEntries(count = 1) {
    updateField(DisbursementVoucherLineEntriesField, [...values.lineEntries, ...createDisbursementEntryRows(count, createBlankEntry)]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    blankRemarksEntryIdsRef.current.delete(entryId);
    delete generatedRemarksOverridesRef.current[entryId];
    replaceEntriesWithAutomaticRows(removeDisbursementEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof DisbursementLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<DisbursementLineEntry>) {
    const sourceEntry = values.lineEntries.find((entry) => entry.id === entryId);
    const isEditableExpenseEntry = sourceEntry !== undefined && !isGeneratedAccountingEntry(sourceEntry);
    const hasRemarksUpdate =
      Object.prototype.hasOwnProperty.call(updates, "particulars") || Object.prototype.hasOwnProperty.call(updates, "remarks");
    const updatedRemarksValue = updates.particulars !== undefined ? updates.particulars : updates.remarks;

    if (isEditableExpenseEntry && hasRemarksUpdate) {
      if (String(updatedRemarksValue ?? "") === "") {
        blankRemarksEntryIdsRef.current.add(entryId);
      } else {
        blankRemarksEntryIdsRef.current.delete(entryId);
      }
    }

    if (sourceEntry && isGeneratedAccountingEntry(sourceEntry) && hasRemarksUpdate) {
      generatedRemarksOverridesRef.current[entryId] = String(updatedRemarksValue ?? "");
    }

    const nextEntries = values.lineEntries.map((entry) => {
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

      return hasRemarksUpdate ? nextEntry : syncDisbursementLineEntryTaxDetails(nextEntry);
    });

    if (isEditableExpenseEntry) {
      handleReplaceLineEntries(createAutomaticEntriesForPayment(nextEntries));
    } else {
      updateField(DisbursementVoucherLineEntriesField, nextEntries);
    }
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    updateField(DisbursementVoucherLineEntriesField, insertDisbursementEntryRow(values.lineEntries, entryId, position, createBlankEntry));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    updateField(
      DisbursementVoucherLineEntriesField,
      duplicateDisbursementEntryRow(values.lineEntries, entryId, () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    updateField(DisbursementVoucherLineEntriesField, moveDisbursementEntryRow(values.lineEntries, fromEntryId, toEntryId));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    replaceEntriesWithAutomaticRows(clearDisbursementEntryRows(values.lineEntries, action));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: DisbursementLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails.grossAmount || 0), 0);

    updateField(DisbursementVoucherLineEntriesField, nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField("taxDetails", syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate));
  }

  function requestDisbursementVoucherSubmit(status: DisbursementVoucherStatus) {
    if (isReadonly || isSubmittingRef.current) return;
    if (mode === DisbursementVoucherActionModes.Edit && !isDirty && status === currentStatus) {
      toast.error("No changes to save.");
      return;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:disbursement-voucher:submit:${mode}:${params.recordId ?? values.transactionId}`,
    );
    if (!releaseSubmitLock) return;
    submitLockReleaseRef.current = releaseSubmitLock;

    const valuesForSubmit = {
      ...values,
      amount: getDisbursementVoucherCopiedDisburseAmount(values.lineEntries).toFixed(2),
      status,
      transactionId: values.transactionId.trim(),
    };
    const shouldValidate = status !== DisbursementVoucherStatuses.Draft;
    const detailsErrors = shouldValidate
      ? validateDisbursementVoucherDetails(valuesForSubmit, selectedPaymentTypeRecord, bankAccounts)
      : {};
    const entryErrors = shouldValidate ? validateDisbursementVoucherEntries(valuesForSubmit) : {};
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      submitLockReleaseRef.current = null;
      releaseSubmitLock();
      return;
    }

    setErrors({});
    setPendingSubmitValues(valuesForSubmit);
  }

  async function confirmDisbursementVoucherSubmit() {
    if (!pendingSubmitValues || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        branchUnitId: activeBranchId ?? undefined,
        voucherNo: pendingSubmitValues.voucherNo,
        voucherDate: pendingSubmitValues.voucherDate,
        paymentDueDate: pendingSubmitValues.paymentDueDate,
        partyCode: pendingSubmitValues.partyCode,
        partyName: pendingSubmitValues.partyName,
        referenceModule: pendingSubmitValues.referenceModule,
        voucherReferenceNo: pendingSubmitValues.voucherReferenceNo,
        invoiceReferenceNo: pendingSubmitValues.invoiceReferenceNo,
        paymentMethod: pendingSubmitValues.paymentMethod,
        paymentDetails: pendingSubmitValues.paymentDetails,
        costCenter: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
        projectCode: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
        projectName: pendingSubmitValues.projectName,
        preparedBy: pendingSubmitValues.preparedBy,
        currency: pendingSubmitValues.currency,
        fxRate: pendingSubmitValues.fxRate,
        amount: pendingSubmitValues.amount,
        remarks: pendingSubmitValues.remarks,
        status: pendingSubmitValues.status,
        details: pendingSubmitValues.lineEntries,
      };

      if (mode === DisbursementVoucherActionModes.Edit && existingVoucher) {
        await updateDisbursementVoucherApi(existingVoucher.id, payload);
        toast.success("Disbursement Voucher updated successfully.");
      } else {
        await createDisbursementVoucherApi(payload);
        toast.success("Disbursement Voucher created successfully.");
      }
      void queryClient.invalidateQueries({ queryKey: DisbursementVoucherQueryKeys.all });
      draft.clearDraft();
      setPendingSubmitValues(null);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
      router.push(returnLink);
    } catch {
      toast.error("Could not save the Disbursement Voucher. Please try again.");
      setPendingSubmitValues(null);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
    }
  }

  function cancelDisbursementVoucherSubmit() {
    setPendingSubmitValues(null);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    submitLockReleaseRef.current?.();
    submitLockReleaseRef.current = null;
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    requestDisbursementVoucherSubmit(DisbursementVoucherStatuses.ForApproval);
  }

  async function handleUpdateStatus(status: DisbursementVoucherStatus) {
    if (!canUpdateDisbursementVoucherStatus(currentStatus, status)) {
      return;
    }
    const actionRecordId = existingVoucher?.id ?? selectedTransaction?.id;
    if (!actionRecordId) return;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:disbursement-voucher:status:${actionRecordId}:${status}`);
    if (!releaseActionLock) return;

    try {
      await updateDisbursementVoucherStatusApi(actionRecordId, status);
      setValues((currentValues) => ({ ...currentValues, status }));
      void queryClient.invalidateQueries({ queryKey: DisbursementVoucherQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: DisbursementVoucherQueryKeys.record(actionRecordId, activeCompanyId, activeBranchId),
      });
      toast.success(`Disbursement Voucher status updated to ${status}.`);
      releaseActionLock();
    } catch {
      toast.error("Could not update the Disbursement Voucher. Please try again.");
      releaseActionLock();
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createInitialDisbursementVoucherFormValues({
      mode: "add",
      transaction: routeTransaction,
      voucher: routeVoucher,
    });

    try {
      const nextTransactionNo = await fetchNextDisbursementVoucherTransactionNo(activeBranchId ?? undefined);
      if (nextTransactionNo) {
        nextValues.voucherNo = nextTransactionNo;
        nextValues.transactionId = nextTransactionNo;
      }
    } catch {
      // Keep the add form available while transaction-number setup is unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === DisbursementVoucherActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  function handleCreateParty(record: Parameters<typeof getPartyDisplayName>[0]) {
    const partyName = getPartyDisplayName(record);

    handlePartyChange(record.partyCodeNo, partyName);
    setIsPartyNameDrawerOpen(false);
  }

  function handleCreateProject(project: ResponsibilityCenter) {
    updateField("projectName", project.name);
    updateField("costCenter", project.code);
    updateField("projectCode", project.code);
    setIsProjectNameDrawerOpen(false);
  }

  function handleOpenResponsibilityCenterDrawer(entryId: string) {
    if (isReadonly) {
      return;
    }

    setPendingResponsibilityCenterEntryId(entryId);
    setIsResponsibilityCenterDrawerOpen(true);
  }

  function handleCloseResponsibilityCenterDrawer() {
    setPendingResponsibilityCenterEntryId(null);
    setIsResponsibilityCenterDrawerOpen(false);
  }

  function handleCreateResponsibilityCenter(center: ResponsibilityCenter) {
    if (pendingResponsibilityCenterEntryId) {
      handleUpdateEntry(pendingResponsibilityCenterEntryId, "responsibilityCenter", center.name);
    }

    handleCloseResponsibilityCenterDrawer();
  }

  function handleCopyFrom(recordIds: string[]) {
    if (isReadonly || recordIds.length === 0) {
      return;
    }

    const selectedPcrs = findPaymentVoucherCopyCandidates(
      pcrCopyFromCandidates,
      PaymentVoucherCopyPrefixes.PettyCashReplenishment,
      recordIds,
    );
    if (selectedPcrs.length > 0) {
      copyFromPettyCashReplenishment(selectedPcrs);
      return;
    }

    const selectedRfrs = findPaymentVoucherCopyCandidates(
      rfrCopyFromCandidates,
      PaymentVoucherCopyPrefixes.RevolvingFundReplenishment,
      recordIds,
    );
    if (selectedRfrs.length > 0) {
      copyFromRevolvingFundReplenishment(selectedRfrs);
      return;
    }

    const selectedAts = findPaymentVoucherCopyCandidates(atsCopyFromCandidates, PaymentVoucherCopyPrefixes.AdvancesToSuppliers, recordIds);
    if (selectedAts.length > 0) {
      copyFromAdvancesToSuppliers(selectedAts);
      return;
    }

    const selectedEmployeeAdvances = findPaymentVoucherCopyCandidates(
      cashAdvanceCopyFromCandidates,
      PaymentVoucherCopyPrefixes.CashAdvance,
      recordIds,
    );
    if (selectedEmployeeAdvances.length > 0) {
      copyFromEmployeeAdvances(selectedEmployeeAdvances);
      return;
    }

    const selectedJournalVouchers = journalVoucherCopyFromCandidates.filter((record) => recordIds.includes(record.id));
    if (selectedJournalVouchers.length > 0) {
      copyFromJournalVouchers(selectedJournalVouchers);
      return;
    }

    const selectedApvs = findPaymentVoucherCopyCandidates(
      apvCopyFromCandidates,
      PaymentVoucherCopyPrefixes.AccountsPayableVoucher,
      recordIds,
    );
    if (selectedApvs.length === 0) {
      toast.error("No valid Accounts Payable Voucher records selected.");
      return;
    }

    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Accounts Payable Voucher has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Accounts Payable Vouchers must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Accounts Payable Vouchers must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.AccountsPayableVoucher,
      records: selectedApvs,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstApv = selectedApvs[0];
    const apvNos = selectedApvs.map((a) => a.transactionNo);
    const apvReferences = apvNos.map((transactionNo) => `APV:${transactionNo}`);

    const copiedEntries: DisbursementLineEntry[] = selectedApvs.flatMap((apv: AccountsPayableVoucherCopyFromCandidate) => {
      const payableAmount = Number(apv.availableAmount) || 0;
      const refId = `APV:${apv.transactionNo}`;
      const sourceDetails = apv.details && apv.details.length > 0 ? apv.details : [];

      if (sourceDetails.length === 0) {
        const responsibilityCenter = apv.projectCode || apv.projectName || "";
        const particulars = `Payment for APV ${apv.transactionNo}`;

        return [
          createBlankDisbursementLineEntry({
            accountCode: apv.creditAccountCode || "20101010",
            accountName: apv.creditAccountTitle || "Accounts Payable",
            credit: 0,
            debit: payableAmount,
            ewtCode: "",
            particulars,
            partyCode: apv.partyCode,
            partyName: apv.partyName,
            refId,
            remarks: particulars,
            responsibilityCenter,
            status: "Balanced",
            taxDetails: {
              ...createTaxDetails(payableAmount, "0%"),
              refId,
              responsibilityCenter,
            },
            taxRate: "0%",
            vatType: "",
          }),
        ];
      }

      const ratio = getPaymentVoucherCopyRatio(apv);

      return sourceDetails.map((detail) => {
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedDisbursementVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.totalAmountDue, ratio, roundHydratedDisbursementVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || apv.projectCode || apv.projectName || "";
        const particulars = detail.particulars || apv.remarks || `Payment for APV ${apv.transactionNo}`;
        const vatCode = detail.vat || "";
        const ewtCode = detail.ewt || "";

        return createBlankDisbursementLineEntry({
          accountCode: detail.expenseAccountCode,
          accountName: detail.expenseType,
          credit: 0,
          debit: netAmount,
          ewtCode,
          particulars,
          partyCode: detail.partyCode || apv.partyCode,
          partyName: detail.partyName || apv.partyName,
          refId,
          remarks: particulars,
          responsibilityCenter,
          status: "Balanced",
          taxDetails: {
            ...createTaxDetails(grossAmount, "0%"),
            amount: disburseAmount,
            ewtAmount,
            ewtCode,
            ewtPercent: Number(detail.ewtPercent || 0),
            grossAmount,
            netAmount,
            refId,
            responsibilityCenter,
            vatAmount,
            vatCode,
            vatPercent: Number(detail.vatPercent || 0),
            vatType: vatCode,
          },
          taxRate: Number(detail.vatPercent || 0) > 0 ? `${Number(detail.vatPercent)}%` : "0%",
          vatType: vatCode,
        });
      });
    });

    const nextRemarks =
      values.remarks ||
      selectedApvs
        .map((a) => a.remarks)
        .filter(Boolean)
        .join("; ") ||
      `Payment for APV ${apvNos.join(", ")}`;

    setValues((current) => {
      const nextPartyCode = current.partyCode || firstApv.partyCode || "";
      const nextPartyName = current.partyName || firstApv.partyName || "";
      const nextProjectCode = current.projectCode || firstApv.projectCode || "";
      const nextProjectName = current.projectName || firstApv.projectName || "";
      const nextCurrency = (firstApv.currency as VoucherCurrency) || current.currency || "PHP";
      const nextFxRate = String(firstApv.exchangeRate || current.fxRate || "1.00");
      const nextVoucherRefNo = mergeUniqueTextValues(current.voucherReferenceNo, apvReferences);

      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getDisbursementVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: nextProjectCode || current.costCenter,
        currency: nextCurrency,
        fxRate: nextFxRate,
        lineEntries: automaticEntries,
        partyCode: nextPartyCode,
        partyName: nextPartyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: current.paymentDetails.payee || nextPartyName,
        },
        projectCode: nextProjectCode,
        projectName: nextProjectName,
        referenceModule: "Accounts Payable Voucher",
        remarks: nextRemarks,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: nextVoucherRefNo,
      };
    });

    setErrors((current) => ({
      ...current,
      amount: undefined,
      lineEntries: undefined,
      partyCode: undefined,
      partyName: undefined,
      voucherReferenceNo: undefined,
    }));

    toast.success(`Copied ${selectedApvs.length} Accounts Payable Voucher${selectedApvs.length > 1 ? "s" : ""}.`);
  }

  function copyFromJournalVouchers(selectedRecords: JournalVoucherCopyFromCandidate[]) {
    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Journal Voucher has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Journal Vouchers must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Journal Vouchers must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.JournalVoucher,
      records: selectedRecords,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstRecord = selectedRecords[0];
    const copiedEntries = selectedRecords.map((record) =>
      createBlankDisbursementLineEntry({
        accountCode: record.accountCode,
        accountName: record.accountTitle,
        credit: 0,
        debit: record.availableAmount,
        particulars: record.particulars || `Payment for ${record.id}`,
        partyCode: record.partyCode ?? "",
        partyName: record.partyName ?? "",
        refId: record.id,
        responsibilityCenter: record.responsibilityCenter ?? "",
        status: "Balanced",
        taxDetails: {
          ...createTaxDetails(record.availableAmount, "0%"),
          amount: record.availableAmount,
          grossAmount: record.availableAmount,
          netAmount: record.availableAmount,
          refId: record.id,
          responsibilityCenter: record.responsibilityCenter ?? "",
        },
        taxRate: "0%",
      }),
    );

    setValues((current) => {
      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getPaymentVoucherCopiedDisburseAmount(mergedEntries, isGeneratedAccountingEntry, roundHydratedDisbursementVoucherAmount);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        currency: (firstRecord.currency || current.currency) as VoucherCurrency,
        fxRate: String(firstRecord.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: firstRecord.partyCode || current.partyCode,
        partyName: firstRecord.partyName || current.partyName,
        referenceModule: "Journal Voucher",
        remarks: firstRecord.particulars || current.remarks,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: mergeUniqueTextValues(
          current.voucherReferenceNo,
          selectedRecords.map((record) => record.id),
        ),
      };
    });
    setErrors((current) => ({ ...current, amount: undefined, lineEntries: undefined, partyCode: undefined, partyName: undefined }));
    toast.success(`Copied ${selectedRecords.length} Journal Voucher line${selectedRecords.length > 1 ? "s" : ""}.`);
  }

  function copyFromPettyCashReplenishment(selectedPcrs: PettyCashReplenishmentCopyFromCandidate[]) {
    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Petty Cash Replenishment has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Petty Cash Replenishments must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Petty Cash Replenishments must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.PettyCashReplenishment,
      records: selectedPcrs,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstPcr = selectedPcrs[0];
    const pcrNos = selectedPcrs.map((pcr) => pcr.transactionNo);
    const pcrReferences = pcrNos.map((transactionNo) => `PCR:${transactionNo}`);
    const copiedEntries: DisbursementLineEntry[] = selectedPcrs.flatMap((pcr) => {
      const refId = `PCR:${pcr.transactionNo}`;
      const sourceDetails = pcr.details && pcr.details.length > 0 ? pcr.details : [];
      const ratio = getPaymentVoucherCopyRatio(pcr);

      if (sourceDetails.length === 0) {
        const disburseAmount = Number(pcr.availableAmount) || 0;
        const particulars = `Payment for PCR ${pcr.transactionNo}`;
        return [
          createBlankDisbursementLineEntry({
            accountCode: pcr.creditAccountCode || "1010101000",
            accountName: pcr.creditAccountTitle || "Petty Cash Fund",
            credit: 0,
            debit: disburseAmount,
            particulars,
            partyCode: pcr.partyCode,
            partyName: pcr.partyName,
            refId,
            remarks: particulars,
            responsibilityCenter: pcr.projectCode || pcr.projectName || "",
            status: "Balanced",
            taxDetails: { ...createTaxDetails(disburseAmount, "0%"), amount: disburseAmount, refId },
            taxRate: "0%",
            vatType: "",
          }),
        ];
      }

      return sourceDetails.map((detail) => {
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedDisbursementVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || pcr.projectCode || pcr.projectName || "";
        const particulars = detail.particulars || pcr.remarks || `Payment for PCR ${pcr.transactionNo}`;
        const vatCode = detail.vatType || "";
        const ewtCode = detail.ewtCode || "";

        return createBlankDisbursementLineEntry({
          accountCode: pcr.creditAccountCode || "1010101000",
          accountName: pcr.creditAccountTitle || "Petty Cash Fund",
          credit: 0,
          debit: netAmount,
          ewtCode,
          particulars,
          partyCode: detail.supplierCode || pcr.partyCode,
          partyName: detail.supplierName || pcr.partyName,
          refId,
          remarks: particulars,
          responsibilityCenter,
          status: "Balanced",
          taxDetails: {
            ...createTaxDetails(grossAmount, "0%"),
            amount: disburseAmount,
            ewtAmount,
            ewtCode,
            ewtPercent: Number(detail.ewtPercent || 0),
            grossAmount,
            netAmount,
            refId,
            responsibilityCenter,
            vatAmount,
            vatCode,
            vatPercent: Number(detail.vatPercent || 0),
            vatType: vatCode,
          },
          taxRate: Number(detail.vatPercent || 0) > 0 ? `${Number(detail.vatPercent)}%` : "0%",
          vatType: vatCode,
        });
      });
    });

    setValues((current) => {
      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getDisbursementVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstPcr.projectCode || firstPcr.projectName || current.costCenter,
        currency: (firstPcr.currency as VoucherCurrency) || current.currency || "PHP",
        fxRate: String(firstPcr.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstPcr.partyCode || "",
        partyName: current.partyName || firstPcr.partyName || "",
        paymentDetails: {
          ...current.paymentDetails,
          payee: current.paymentDetails.payee || firstPcr.partyName || "",
        },
        projectCode: current.projectCode || firstPcr.projectCode || "",
        projectName: current.projectName || firstPcr.projectName || "",
        referenceModule: "Petty Cash Replenishment",
        remarks:
          current.remarks ||
          selectedPcrs
            .map((pcr) => pcr.remarks)
            .filter(Boolean)
            .join("; ") ||
          `Payment for PCR ${pcrNos.join(", ")}`,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: mergeUniqueTextValues(current.voucherReferenceNo, pcrReferences),
      };
    });
    setErrors((current) => ({
      ...current,
      amount: undefined,
      lineEntries: undefined,
      partyCode: undefined,
      partyName: undefined,
      voucherReferenceNo: undefined,
    }));
    toast.success(`Copied ${selectedPcrs.length} Petty Cash Replenishment${selectedPcrs.length > 1 ? "s" : ""}.`);
  }

  function copyFromRevolvingFundReplenishment(selectedRfrs: RevolvingFundReplenishmentCopyFromCandidate[]) {
    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Revolving Fund Replenishment has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Revolving Fund Replenishments must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Revolving Fund Replenishments must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.RevolvingFundReplenishment,
      records: selectedRfrs,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstRfr = selectedRfrs[0];
    const rfrNos = selectedRfrs.map((rfr) => rfr.transactionNo);
    const rfrReferences = rfrNos.map((transactionNo) => `RFR:${transactionNo}`);
    const copiedEntries: DisbursementLineEntry[] = selectedRfrs.flatMap((rfr) => {
      const refId = `RFR:${rfr.transactionNo}`;
      const sourceDetails = rfr.details && rfr.details.length > 0 ? rfr.details : [];
      const ratio = getPaymentVoucherCopyRatio(rfr);

      if (sourceDetails.length === 0) {
        const disburseAmount = Number(rfr.availableAmount) || 0;
        const particulars = `Payment for RFR ${rfr.transactionNo}`;
        return [
          createBlankDisbursementLineEntry({
            accountCode: rfr.creditAccountCode || "1010102000",
            accountName: rfr.creditAccountTitle || "Revolving Fund",
            credit: 0,
            debit: disburseAmount,
            particulars,
            partyCode: rfr.partyCode,
            partyName: rfr.partyName,
            refId,
            remarks: particulars,
            responsibilityCenter: rfr.projectCode || rfr.projectName || "",
            status: "Balanced",
            taxDetails: { ...createTaxDetails(disburseAmount, "0%"), amount: disburseAmount, refId },
            taxRate: "0%",
            vatType: "",
          }),
        ];
      }

      return sourceDetails.map((detail) => {
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedDisbursementVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio, roundHydratedDisbursementVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || rfr.projectCode || rfr.projectName || "";
        const particulars = detail.particulars || rfr.remarks || `Payment for RFR ${rfr.transactionNo}`;
        const vatCode = detail.vatType || "";
        const ewtCode = detail.ewtCode || "";

        return createBlankDisbursementLineEntry({
          accountCode: rfr.creditAccountCode || "1010102000",
          accountName: rfr.creditAccountTitle || "Revolving Fund",
          credit: 0,
          debit: netAmount,
          ewtCode,
          particulars,
          partyCode: detail.supplierCode || rfr.partyCode,
          partyName: detail.supplierName || rfr.partyName,
          refId,
          remarks: particulars,
          responsibilityCenter,
          status: "Balanced",
          taxDetails: {
            ...createTaxDetails(grossAmount, "0%"),
            amount: disburseAmount,
            ewtAmount,
            ewtCode,
            ewtPercent: Number(detail.ewtPercent || 0),
            grossAmount,
            netAmount,
            refId,
            responsibilityCenter,
            vatAmount,
            vatCode,
            vatPercent: Number(detail.vatPercent || 0),
            vatType: vatCode,
          },
          taxRate: Number(detail.vatPercent || 0) > 0 ? `${Number(detail.vatPercent)}%` : "0%",
          vatType: vatCode,
        });
      });
    });

    setValues((current) => {
      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getDisbursementVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstRfr.projectCode || firstRfr.projectName || current.costCenter,
        currency: (firstRfr.currency as VoucherCurrency) || current.currency || "PHP",
        fxRate: String(firstRfr.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstRfr.partyCode || "",
        partyName: current.partyName || firstRfr.partyName || "",
        paymentDetails: {
          ...current.paymentDetails,
          payee: current.paymentDetails.payee || firstRfr.partyName || "",
        },
        projectCode: current.projectCode || firstRfr.projectCode || "",
        projectName: current.projectName || firstRfr.projectName || "",
        referenceModule: "Revolving Fund Replenishment",
        remarks:
          current.remarks ||
          selectedRfrs
            .map((rfr) => rfr.remarks)
            .filter(Boolean)
            .join("; ") ||
          `Payment for RFR ${rfrNos.join(", ")}`,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: mergeUniqueTextValues(current.voucherReferenceNo, rfrReferences),
      };
    });
    setErrors((current) => ({
      ...current,
      amount: undefined,
      lineEntries: undefined,
      partyCode: undefined,
      partyName: undefined,
      voucherReferenceNo: undefined,
    }));
    toast.success(`Copied ${selectedRfrs.length} Revolving Fund Replenishment${selectedRfrs.length > 1 ? "s" : ""}.`);
  }

  function copyFromEmployeeAdvances(selectedAdvances: CashAdvanceCopyFromCandidate[]) {
    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Employee Advance has already been added.",
      getReferencePrefix: (advance) => advance.referencePrefix,
      mixedCurrencyMessage: (currency) => `All selected Employee Advances must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Employee Advances must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.CashAdvance,
      records: selectedAdvances,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstAdvance = selectedAdvances[0];
    const advanceReferences = selectedAdvances.map((advance) => `${advance.referencePrefix}:${advance.transactionNo}`);
    const copiedEntries: DisbursementLineEntry[] = selectedAdvances.map((advance) => {
      const refId = `${advance.referencePrefix}:${advance.transactionNo}`;
      const disburseAmount = Number(advance.availableAmount) || 0;
      const particulars = advance.remarks || `Payment for ${advance.referencePrefix} ${advance.transactionNo}`;

      return createBlankDisbursementLineEntry({
        accountCode: advance.details[0]?.accountCode || "1130-CA",
        accountName: advance.details[0]?.accountTitle || "Employee Advance",
        credit: 0,
        debit: disburseAmount,
        particulars,
        partyCode: advance.partyCode,
        partyName: advance.partyName,
        refId,
        remarks: particulars,
        responsibilityCenter: advance.projectCode || advance.projectName || "",
        status: "Balanced",
        taxDetails: { ...createTaxDetails(disburseAmount, "0%"), amount: disburseAmount, grossAmount: disburseAmount, refId },
        taxRate: "0%",
        vatType: "",
      });
    });

    setValues((current) => {
      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getDisbursementVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstAdvance.projectCode || firstAdvance.projectName || current.costCenter,
        currency: firstAdvance.currency || current.currency || "PHP",
        fxRate: String(firstAdvance.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstAdvance.partyCode || "",
        partyName: current.partyName || firstAdvance.partyName || "",
        projectCode: current.projectCode || firstAdvance.projectCode || "",
        projectName: current.projectName || firstAdvance.projectName || "",
        referenceModule: "Employee Advance",
        remarks:
          current.remarks ||
          selectedAdvances
            .map((advance) => advance.remarks)
            .filter(Boolean)
            .join("; ") ||
          `Payment for Employee Advance ${selectedAdvances.map((advance) => advance.transactionNo).join(", ")}`,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: mergeUniqueTextValues(current.voucherReferenceNo, advanceReferences),
      };
    });
    setErrors((current) => ({
      ...current,
      amount: undefined,
      lineEntries: undefined,
      partyCode: undefined,
      partyName: undefined,
      voucherReferenceNo: undefined,
    }));
    toast.success(`Copied ${selectedAdvances.length} Employee Advance${selectedAdvances.length > 1 ? "s" : ""}.`);
  }

  function copyFromAdvancesToSuppliers(selectedAtsRecords: AdvanceToSupplierCopyFromCandidate[]) {
    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedApvReferences,
      duplicateMessage: "The selected Advances to Suppliers record has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Advances to Suppliers records must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Advances to Suppliers records must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.AdvancesToSuppliers,
      records: selectedAtsRecords,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const firstAts = selectedAtsRecords[0];
    const atsNos = selectedAtsRecords.map((ats) => ats.transactionNo);
    const atsReferences = atsNos.map((transactionNo) => `ATS:${transactionNo}`);
    const copiedEntries: DisbursementLineEntry[] = selectedAtsRecords.flatMap((ats) => {
      const refId = `ATS:${ats.transactionNo}`;
      const sourceDetails = ats.details && ats.details.length > 0 ? ats.details : [];

      return sourceDetails.map((detail) => {
        const disburseAmount = Number(detail.consumptionAmount || detail.amount || ats.availableAmount || 0);
        const particulars = detail.particulars || ats.remarks || `Payment for ATS ${ats.transactionNo}`;

        return createBlankDisbursementLineEntry({
          accountCode: detail.accountCode || "104-100",
          accountName: detail.accountTitle || "Advances to Suppliers",
          credit: 0,
          debit: disburseAmount,
          particulars,
          partyCode: ats.partyCode,
          partyName: ats.partyName,
          refId,
          remarks: particulars,
          responsibilityCenter: detail.responsibilityCenter || ats.projectCode || ats.projectName || "",
          status: "Balanced",
          taxDetails: { ...createTaxDetails(disburseAmount, "0%"), amount: disburseAmount, grossAmount: disburseAmount, refId },
          taxRate: "0%",
          vatType: "",
        });
      });
    });

    setValues((current) => {
      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getDisbursementVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstAts.projectCode || firstAts.projectName || current.costCenter,
        currency: (firstAts.currency as VoucherCurrency) || current.currency || "PHP",
        fxRate: String(firstAts.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstAts.partyCode || "",
        partyName: current.partyName || firstAts.partyName || "",
        paymentDetails: {
          ...current.paymentDetails,
          payee: current.paymentDetails.payee || firstAts.partyName || "",
        },
        projectCode: current.projectCode || firstAts.projectCode || "",
        projectName: current.projectName || firstAts.projectName || "",
        referenceModule: "Advances to Suppliers",
        remarks:
          current.remarks ||
          selectedAtsRecords
            .map((ats) => ats.remarks)
            .filter(Boolean)
            .join("; ") ||
          `Payment for ATS ${atsNos.join(", ")}`,
        taxDetails: createTaxDetails(nextAmount, "0%"),
        taxRate: "0%",
        voucherReferenceNo: mergeUniqueTextValues(current.voucherReferenceNo, atsReferences),
      };
    });
    setErrors((current) => ({
      ...current,
      amount: undefined,
      lineEntries: undefined,
      partyCode: undefined,
      partyName: undefined,
      voucherReferenceNo: undefined,
    }));
    toast.success(`Copied ${selectedAtsRecords.length} Advances to Suppliers record${selectedAtsRecords.length > 1 ? "s" : ""}.`);
  }

  return {
    discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    bankAccounts,
    chartAccounts: chartAccountsQuery.data ?? [],
    chartAccountOptions: accountOptionsQuery.data ?? [],
    copyFromRecords,
    currentStatus,
    currencyOptions: transactionCurrency.currencyOptions,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isBankMasterfileDrawerOpen,
    isDisbursementTypeDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPartyNameDrawerOpen,
    isPaymentTypeDrawerOpen,
    isProjectNameDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    isSubmitting,
    isResponsibilityCenterDrawerOpen,
    mode,
    partyOptions,
    partyStore,
    paymentTypeStore,
    paymentTypeRecords,
    projectOptions,
    responsibilityCenterOptions,
    responsibilityCenterStore,
    returnLink: isRecordMissing ? DisbursementVoucherLink : returnLink,
    selectedBankAccount,
    selectedPaymentTypeRecord,
    selectedTransaction,
    taxCodes,
    totalCredit,
    totalDebit,
    values,
    bankMasterfileStore,
    handleAddEntries,
    handleBankAccountChange,
    handleClearEntries,
    handleCopyFrom,
    handleCreateParty,
    handleCreateProject,
    handleCreateResponsibilityCenter,
    handleCurrencyChange,
    handleDuplicateEntry,
    handleInsertEntry,
    handleMoveEntry,
    handleOpenResponsibilityCenterDrawer,
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
    setIsDisbursementTypeDrawerOpen,
    setIsPartyNameDrawerOpen,
    setIsPaymentTypeDrawerOpen,
    setIsProjectNameDrawerOpen,
    setIsReportPreviewOpen,
    handleCloseResponsibilityCenterDrawer,
    cancelDisbursementVoucherSubmit,
    confirmDisbursementVoucherSubmit,
    pendingSubmitStatus: pendingSubmitValues?.status ?? null,
    requestDisbursementVoucherSubmit,
    updateField,
    updatePaymentDetails,
  };
}

function createGeneratedAccountingAccountMap(taxOptions: TaxDefaultAccountOption[]): Record<string, GeneratedAccountingAccount> {
  const accountByKey: Record<string, GeneratedAccountingAccount> = {};

  taxOptions.forEach((taxOption) => {
    if (!taxOption.defaultAccountCode || !taxOption.defaultAccountTitle) {
      return;
    }

    const account = {
      accountCode: taxOption.defaultAccountCode,
      accountName: taxOption.defaultAccountTitle,
    };

    [taxOption.taxCode, taxOption.displayCode, taxOption.sourceKey].forEach((key) => {
      const normalizedKey = key?.trim();
      if (normalizedKey) {
        accountByKey[normalizedKey] = account;
      }
    });
  });

  return accountByKey;
}

function shouldEntryRemarksFollowHeader(entry: DisbursementLineEntry, previousHeaderRemarks: string) {
  const normalizedEntryRemarks = (entry.particulars || entry.remarks || "").trim();
  const normalizedHeaderRemarks = previousHeaderRemarks.trim();
  const normalizedCreatedRemarks = entry.accountName.trim();

  return (
    normalizedEntryRemarks === "" ||
    normalizedEntryRemarks === normalizedCreatedRemarks ||
    (normalizedHeaderRemarks !== "" && normalizedEntryRemarks === normalizedHeaderRemarks)
  );
}

function clearAccountingGridSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(CashDisbursementAccountingGridSessionStorageKey);
  }
}

function getDisbursementVoucherCopiedDisburseAmount(entries: DisbursementLineEntry[]) {
  return getPaymentVoucherCopiedDisburseAmount(entries, isGeneratedAccountingEntry, roundHydratedDisbursementVoucherAmount);
}
