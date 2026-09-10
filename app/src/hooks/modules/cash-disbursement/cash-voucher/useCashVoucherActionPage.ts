"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import {
  canUpdateCashVoucherStatus,
  createInitialCashVoucherFormValues,
  createVoucherActionReturnLink,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherActionData";
import {
  createAutomaticAccountingEntries,
  hasNonZeroAccountingAmount,
  isGeneratedAccountingEntry,
  isPaymentCreditEntry,
  normalizeCashVoucherLineEntryFields,
  shouldSyncCashVoucherEntryParty,
  syncCashVoucherLineEntryTaxDetails,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  CashVoucherActionModes,
  CashVoucherLink,
  CashVoucherStatuses,
  canEditCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  CashDisbursementAccountingGridSessionStorageKey,
  CashVoucherLineEntriesField,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  validateCashVoucherDetails,
  validateCashVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/cash-voucher/CashVoucherValidation";
import { useDisbursementTypeStore } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementType";
import { useCashVoucherDefaultAccounts } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucherDefaultAccounts";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefaultAccountOptionGroups } from "@/app/src/hooks/shared/tax/useTaxOptions";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  CashVoucherLineEntry,
  CashVoucherActionMode,
  CashVoucherActionTab,
  CashVoucherFormErrors,
  CashVoucherFormValues,
  CashVoucherStatus,
  CashVoucherRecord,
  CashVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { mergeUniqueTextValues } from "@/app/src/utils/string.util";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { GeneratedAccountingAccount } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { TaxDefaultAccountOption } from "@/app/src/types/shared/tax/TaxTypes";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  PurchaseTaxTypeCwt,
  PurchaseTaxTypeEwt,
  PurchaseTaxTypeInputVat,
  PurchaseTaxTypeVat,
} from "@/app/src/data/shared/tax/TaxData";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  clearCashVoucherEntryRows,
  createCashVoucherEntryRows,
  duplicateCashVoucherEntryRow,
  insertCashVoucherEntryRow,
  moveCashVoucherEntryRow,
  removeCashVoucherEntryRow,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherEntryRowData";
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
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { CashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherQueryKeys";
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
  createCashVoucherApi,
  fetchCashVoucherById,
  fetchNextCashVoucherTransactionNo,
  updateCashVoucherApi,
  updateCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherApi";

export function useCashVoucherActionPage(mode: CashVoucherActionMode) {
  const router = useRouter();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const recordId = params.recordId ?? "";
  const returnLink = createVoucherActionReturnLink(searchParams.get("from"), recordId);
  const transactionCurrency = useTransactionCurrency();

  const [values, setValues] = useState<CashVoucherFormValues>(() =>
    createInitialCashVoucherFormValues({
      mode,
    }),
  );
  const [errors, setErrors] = useState<CashVoucherFormErrors>({});
  const [pendingSubmitValues, setPendingSubmitValues] = useState<CashVoucherFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<CashVoucherActionTab>("details");
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] = useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
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
  const defaultAccountStore = useDisbursementTypeStore(undefined, { kind: "disbursement" });
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
  const defaultAccountsQuery = useCashVoucherDefaultAccounts();
  const cashOnHandAccount = useMemo<GeneratedAccountingAccount | undefined>(() => {
    const account = defaultAccountsQuery.data?.defaultCashAccount;
    if (!account) return undefined;

    return {
      accountCode: account.accountCode,
      accountName: account.accountTitle,
    };
  }, [defaultAccountsQuery.data]);
  const partyOptions = useMemo<CashVoucherPartyDropdownOption[]>(() => {
    const optionsByCode = new Map<string, CashVoucherPartyDropdownOption>();

    partyStore.records.forEach((record) => {
      if (record.status !== "Active") {
        return;
      }

      const partyCode = record.partyCodeNo.trim();
      const partyName = getPartyDisplayName(record).trim() || partyCode;

      if (!partyCode || optionsByCode.has(partyCode)) {
        return;
      }

      optionsByCode.set(partyCode, {
        description: record.partyTypes.join(", "),
        defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
        defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
        defaultSalesOutputVatTaxSourceKey: record.defaultSalesOutputVatTaxSourceKey,
        defaultSalesCwtTaxSourceKey: record.defaultSalesCwtTaxSourceKey,
        label: partyCode,
        name: partyName,
        selectedDetails: partyCode,
        value: partyCode,
      });
    });

    return Array.from(optionsByCode.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [partyStore.records]);
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return responsibilityCenterStore.centers
      .filter((center) => center.status === "Active")
      .map((center) => ({
        description: center.typeName || center.category || "",
        label: center.code,
        name: center.name,
        selectedDetails: center.code,
        value: center.name,
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [responsibilityCenterStore.centers]);
  const copyFromPartyName = values.partyName.trim();
  const copyFromPartyCode = copyFromPartyName ? values.partyCode.trim() : "";
  const copyFromCandidatesQuery = useQuery({
    queryKey: AccountsPayableVoucherQueryKeys.copyFromCandidates(
      "cash-voucher",
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
        target: "cash-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const apvCopyFromCandidates = useMemo(() => copyFromCandidatesQuery.data ?? [], [copyFromCandidatesQuery.data]);
  const advanceToSupplierCopyFromCandidatesQuery = useQuery({
    queryKey: AdvancesToSuppliersQueryKeys.copyFromCandidates(
      "cash-voucher",
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
        target: "cash-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const atsCopyFromCandidates = useMemo(
    () => advanceToSupplierCopyFromCandidatesQuery.data ?? [],
    [advanceToSupplierCopyFromCandidatesQuery.data],
  );
  const cashAdvanceCopyFromCandidatesQuery = useQuery({
    queryKey: CashAdvanceQueryKeys.copyFromCandidates(
      "cash-voucher",
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
        target: "cash-voucher",
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
      "cash-voucher",
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
        target: "cash-voucher",
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
      "cash-voucher",
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
        target: "cash-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const rfrCopyFromCandidates = useMemo(
    () => revolvingFundReplenishmentCopyFromCandidatesQuery.data ?? [],
    [revolvingFundReplenishmentCopyFromCandidatesQuery.data],
  );
  const journalVoucherCopyFromCandidatesQuery = useQuery({
    queryKey: JournalVoucherQueryKeys.copyFromCandidates(
      "cash-voucher",
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
        target: "cash-voucher",
      }),
    enabled: activeCompanyId !== null,
  });
  const journalVoucherCopyFromCandidates = useMemo(
    () => journalVoucherCopyFromCandidatesQuery.data ?? [],
    [journalVoucherCopyFromCandidatesQuery.data],
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

  // Query single record if edit or view mode
  const recordQuery = useQuery({
    queryKey: CashVoucherQueryKeys.record(recordId, activeCompanyId, activeBranchId),
    queryFn: () => fetchCashVoucherById(recordId),
    enabled: Boolean(recordId && mode !== CashVoucherActionModes.Add),
  });

  const existingVoucher: CashVoucherRecord | undefined = recordQuery.data;

  // Auto-populate values when existing record is loaded
  useEffect(() => {
    if (!existingVoucher || mode === CashVoucherActionModes.Add) return;

    const rawDetails: Array<Record<string, unknown>> = (
      existingVoucher.lineEntries && existingVoucher.lineEntries.length > 0
        ? existingVoucher.lineEntries
        : (existingVoucher as unknown as { details?: Array<Record<string, unknown>> }).details || []
    ) as Array<Record<string, unknown>>;

    const mappedEntries: CashVoucherLineEntry[] = rawDetails.map((d, index) => {
      const grossAmount = getHydratedCashVoucherGrossAmount(d);
      const vatPercent = getCashVoucherDetailNumber(d, "vatPercent");
      const ewtPercent = getCashVoucherDetailNumber(d, "ewtPercent");
      const taxDetails = syncTaxDetailsAmount(
        {
          ...createTaxDetails(grossAmount, "0%"),
          vatType: (d.vatType as string) || "",
          vatCode: getCashVoucherDetailString(d, "vatCode"),
          vatPercent,
          ewtCode: getCashVoucherDetailString(d, "ewtCode"),
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
      const nextValues = {
        transactionId: existingVoucher.id,
        voucherNo: existingVoucher.voucherNo,
        voucherDate: existingVoucher.voucherDate,
        paymentDueDate: existingVoucher.paymentDueDate || existingVoucher.voucherDate,
        paymentMethod: (existingVoucher.paymentMethod as "Cash") || "Cash",
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
        paymentDetails: {
          bankAccountCode: "",
          bankAccountName: "",
          bankAccountNo: "",
          bankAccountTitle: "",
          bankBranch: "",
          bankName: "",
          checkDate: "",
          checkNo: "",
          paymentReferenceNo: "",
        },
        preparedBy: existingVoucher.preparedBy || "",
        status: existingVoucher.status || "Draft",
        lineEntries: mappedEntries.length > 0 ? mappedEntries : createInitialCashVoucherFormValues({ mode }).lineEntries,
        attachments: existingVoucher.attachments || [],
      };
      setValues(nextValues);
      setInitialValues(nextValues);
    });
  }, [existingVoucher, mode]);

  useEffect(() => {
    if (!existingVoucher || mode === CashVoucherActionModes.Add || partyOptions.length === 0 || taxCodes.length === 0) {
      return;
    }

    const recordKey = String(existingVoucher.id);
    if (hydratedPartyTaxDefaultsRecordIdRef.current === recordKey) {
      return;
    }

    function applyDefaults(current: CashVoucherFormValues) {
      if (String(current.transactionId) !== recordKey) {
        return current;
      }

      const hydrated = applyMissingPartyTaxDefaultsToEntries(current.lineEntries, partyOptions, taxCodes);
      if (!hydrated.changed) {
        return current;
      }

      return {
        ...current,
        lineEntries: createAutomaticAccountingEntries(hydrated.entries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          cashAccount: cashOnHandAccount,
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          isCashPayment: true,
          paymentMethod: "Cash",
          withholdingTaxAccountsByCode,
        }),
      };
    }

    queueMicrotask(() => {
      setValues(applyDefaults);
      setInitialValues(applyDefaults);
      hydratedPartyTaxDefaultsRecordIdRef.current = recordKey;
    });
  }, [cashOnHandAccount, existingVoucher, inputVatAccountsByTaxCode, mode, partyOptions, taxCodes, withholdingTaxAccountsByCode]);

  useEffect(() => {
    if (!cashOnHandAccount) {
      return;
    }

    queueMicrotask(() => {
      setValues((current) => {
        const needsUpdate = current.lineEntries.some((entry) => isPaymentCreditEntry(entry) && (!entry.accountCode || !entry.accountName));
        if (!needsUpdate) {
          return current;
        }

        return {
          ...current,
          lineEntries: current.lineEntries.map((entry) =>
            isPaymentCreditEntry(entry) && (!entry.accountCode || !entry.accountName)
              ? {
                  ...entry,
                  accountCode: cashOnHandAccount.accountCode,
                  accountName: cashOnHandAccount.accountName,
                }
              : entry,
          ),
        };
      });
    });
  }, [cashOnHandAccount]);

  // Load next transaction number on create mode
  useEffect(() => {
    if (mode !== CashVoucherActionModes.Add) return;

    void refreshNextTransactionNo();
  }, [mode]);

  const currentStatus = existingVoucher?.status ?? values.status;
  const isReadonly =
    mode === CashVoucherActionModes.View || (mode === CashVoucherActionModes.Edit && !canEditCashVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const isRecordMissing = mode !== CashVoucherActionModes.Add && !recordQuery.isLoading && !existingVoucher;
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty =
    mode === CashVoucherActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionId", "voucherNo"]) : rawIsDirty;
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-voucher", recordId: params.recordId }),
    restoreValues: mode === CashVoucherActionModes.Add ? restoreCashVoucherAddDraftValues : undefined,
    setValues,
    values,
  });

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createInitialCashVoucherFormValues({ mode: "add" });

    try {
      const nextTransNo = await fetchNextCashVoucherTransactionNo();

      if (nextTransNo) {
        nextValues.voucherNo = nextTransNo;
        nextValues.transactionId = nextTransNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  async function refreshNextTransactionNo() {
    try {
      const nextTransNo = await fetchNextCashVoucherTransactionNo();

      if (nextTransNo) {
        setValues((current) => ({
          ...current,
          voucherNo: nextTransNo,
          transactionId: nextTransNo,
        }));
        setInitialValues((current) => ({
          ...current,
          voucherNo: nextTransNo,
          transactionId: nextTransNo,
        }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === CashVoucherActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  useEffect(() => {
    clearAccountingGridSession();
  }, []);

  useEffect(() => {
    if (mode !== CashVoucherActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
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

  function updateField<TKey extends keyof CashVoucherFormValues>(field: TKey, value: CashVoucherFormValues[TKey]) {
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

      return {
        ...nextValues,
        lineEntries: createAutomaticAccountingEntries(editableEntries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          cashAccount: cashOnHandAccount,
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          isCashPayment: true,
          paymentMethod: "Cash",
          withholdingTaxAccountsByCode,
        }),
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updatePaymentDetails(nextDetails: Partial<CashVoucherFormValues["paymentDetails"]>) {
    updateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
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

  function createAutomaticEntriesForPayment(entries: CashVoucherLineEntry[]) {
    return createAutomaticAccountingEntries(entries, {
      bankAccount: null,
      blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
      cashAccount: cashOnHandAccount,
      generatedRemarksOverrides: generatedRemarksOverridesRef.current,
      inputVatAccountsByTaxCode,
      isCashPayment: true,
      paymentMethod: "Cash",
      withholdingTaxAccountsByCode,
    });
  }

  function handlePartyChange(partyCode: string, partyName: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const previousPartyCode = current.partyCode;
      const previousPartyName = current.partyName;
      const selectedParty = partyStore.records.find((record) => record.partyCodeNo === partyCode);
      const vatCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseInputVatTaxSourceKey, PurchaseTaxTypeVat);
      const ewtCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseEwtTaxSourceKey, PurchaseTaxTypeEwt);
      const vatPercent = vatCode ? getVatPercentFromRate(getVatRateFromCode(vatCode, taxCodes)) : 0;
      const ewtPercent = ewtCode ? getEwtPercentFromCode(ewtCode, taxCodes) : 0;
      const nextEntries = current.lineEntries.map((entry) =>
        shouldSyncCashVoucherEntryParty(entry, previousPartyCode, previousPartyName)
          ? applyPartyTaxDefaults({ ...entry, partyCode, partyName }, vatCode, ewtCode, vatPercent, ewtPercent)
          : entry,
      );

      return {
        ...current,
        partyCode,
        partyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: partyName,
        },
        lineEntries: createAutomaticAccountingEntries(nextEntries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          cashAccount: cashOnHandAccount,
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          inputVatAccountsByTaxCode,
          isCashPayment: true,
          paymentMethod: "Cash",
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

  function createBlankEntry(): CashVoucherLineEntry {
    const refId = values.voucherReferenceNo || values.voucherNo || values.transactionId;
    const responsibilityCenter = values.costCenter || "";

    return createBlankCashVoucherLineEntry({
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

  function replaceEntriesWithAutomaticRows(nextEntries: CashVoucherLineEntry[]) {
    updateField(CashVoucherLineEntriesField, createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]));
  }

  function handleAddEntries(count = 1) {
    updateField(CashVoucherLineEntriesField, [...values.lineEntries, ...createCashVoucherEntryRows(count, createBlankEntry)]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    blankRemarksEntryIdsRef.current.delete(entryId);
    delete generatedRemarksOverridesRef.current[entryId];
    replaceEntriesWithAutomaticRows(removeCashVoucherEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof CashVoucherLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<CashVoucherLineEntry>) {
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

      const nextEntry = normalizeCashVoucherLineEntryFields({
        ...entry,
        ...updates,
      });

      if (Number(nextEntry.debit || 0) > 0) {
        nextEntry.credit = 0;
      }

      if (Number(nextEntry.credit || 0) > 0) {
        nextEntry.debit = 0;
      }

      return hasRemarksUpdate ? nextEntry : syncCashVoucherLineEntryTaxDetails(nextEntry);
    });

    if (isEditableExpenseEntry) {
      handleReplaceLineEntries(createAutomaticEntriesForPayment(nextEntries));
    } else {
      updateField(CashVoucherLineEntriesField, nextEntries);
    }
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    updateField(CashVoucherLineEntriesField, insertCashVoucherEntryRow(values.lineEntries, entryId, position, createBlankEntry));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    updateField(
      CashVoucherLineEntriesField,
      duplicateCashVoucherEntryRow(values.lineEntries, entryId, () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    updateField(CashVoucherLineEntriesField, moveCashVoucherEntryRow(values.lineEntries, fromEntryId, toEntryId));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    replaceEntriesWithAutomaticRows(clearCashVoucherEntryRows(values.lineEntries, action));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: CashVoucherLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails.grossAmount || 0), 0);

    updateField(CashVoucherLineEntriesField, nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField("taxDetails", syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate));
  }

  function requestCashVoucherSubmit(status: CashVoucherStatus) {
    if (isReadonly || isSubmittingRef.current) return;
    if (mode === CashVoucherActionModes.Edit && !isDirty && status === currentStatus) {
      toast.error("No changes to save.");
      return;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:cash-voucher:submit:${mode}:${params.recordId ?? values.transactionId}`,
    );
    if (!releaseSubmitLock) return;
    submitLockReleaseRef.current = releaseSubmitLock;

    const valuesForSubmit = {
      ...values,
      amount: getCashVoucherCopiedDisburseAmount(values.lineEntries).toFixed(2),
      status,
      transactionId: values.transactionId.trim(),
    };
    const shouldValidate = status !== CashVoucherStatuses.Draft;
    const detailsErrors = shouldValidate ? validateCashVoucherDetails(valuesForSubmit) : {};
    const entryErrors = shouldValidate ? validateCashVoucherEntries(valuesForSubmit) : {};
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

  async function confirmCashVoucherSubmit() {
    if (!pendingSubmitValues || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (mode === CashVoucherActionModes.Edit && recordId) {
        await updateCashVoucherApi(recordId, {
          branchUnitId: activeBranchId ?? undefined,
          voucherDate: pendingSubmitValues.voucherDate,
          paymentDueDate: pendingSubmitValues.paymentDueDate,
          partyCode: pendingSubmitValues.partyCode,
          partyName: pendingSubmitValues.partyName,
          referenceModule: pendingSubmitValues.referenceModule,
          voucherReferenceNo: pendingSubmitValues.voucherReferenceNo,
          invoiceReferenceNo: pendingSubmitValues.invoiceReferenceNo,
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
        });
        toast.success("Cash Voucher updated successfully.");
      } else {
        await createCashVoucherApi({
          branchUnitId: activeBranchId ?? undefined,
          voucherNo: pendingSubmitValues.voucherNo,
          voucherDate: pendingSubmitValues.voucherDate,
          partyCode: pendingSubmitValues.partyCode,
          partyName: pendingSubmitValues.partyName,
          referenceModule: pendingSubmitValues.referenceModule,
          voucherReferenceNo: pendingSubmitValues.voucherReferenceNo,
          invoiceReferenceNo: pendingSubmitValues.invoiceReferenceNo,
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
        });
        toast.success("Cash Voucher created successfully.");
      }

      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.all });
      draft.clearDraft();
      setPendingSubmitValues(null);
      submitLockReleaseRef.current = null;
      router.push(CashVoucherLink);
    } catch {
      toast.error("Could not save the Cash Voucher. Please try again.");
      setPendingSubmitValues(null);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
    }
  }

  function cancelCashVoucherSubmit() {
    setPendingSubmitValues(null);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    submitLockReleaseRef.current?.();
    submitLockReleaseRef.current = null;
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    requestCashVoucherSubmit(CashVoucherStatuses.ForApproval);
  }

  async function handleUpdateStatus(status: CashVoucherStatus) {
    if (!canUpdateCashVoucherStatus(currentStatus, status)) {
      return;
    }
    const actionRecordId = recordId || values.transactionId;
    if (!actionRecordId) return;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-voucher:status:${actionRecordId}:${status}`);
    if (!releaseActionLock) return;

    try {
      await updateCashVoucherStatusApi(actionRecordId, status);
      setValues((currentValues) => ({ ...currentValues, status }));
      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.record(actionRecordId, activeCompanyId, activeBranchId) });
      toast.success(`Cash Voucher status updated to ${status}.`);
      releaseActionLock();
    } catch {
      toast.error("Could not update the Cash Voucher status. Please try again.");
      releaseActionLock();
    }
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

    const copiedEntries: CashVoucherLineEntry[] = selectedApvs.flatMap((apv: AccountsPayableVoucherCopyFromCandidate) => {
      const payableAmount = Number(apv.availableAmount) || 0;
      const refId = `APV:${apv.transactionNo}`;
      const sourceDetails = apv.details && apv.details.length > 0 ? apv.details : [];

      if (sourceDetails.length === 0) {
        const responsibilityCenter = apv.projectCode || apv.projectName || "";
        const particulars = `Payment for APV ${apv.transactionNo}`;

        return [
          createBlankCashVoucherLineEntry({
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
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedCashVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedCashVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedCashVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedCashVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.totalAmountDue, ratio, roundHydratedCashVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || apv.projectCode || apv.projectName || "";
        const particulars = detail.particulars || apv.remarks || `Payment for APV ${apv.transactionNo}`;
        const vatCode = detail.vat || "";
        const ewtCode = detail.ewt || "";

        return createBlankCashVoucherLineEntry({
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
      const nextCurrency = firstApv.currency || current.currency || "PHP";
      const nextFxRate = String(firstApv.exchangeRate || current.fxRate || "1.00");
      const nextVoucherRefNo = mergeUniqueTextValues(current.voucherReferenceNo, apvReferences);

      const existingEditableEntries = getEditablePaymentVoucherCopyEntries(current.lineEntries, isGeneratedAccountingEntry);
      const mergedEntries = existingEditableEntries.length > 0 ? [...existingEditableEntries, ...copiedEntries] : copiedEntries;
      const automaticEntries = createAutomaticEntriesForPayment(mergedEntries);
      const nextAmount = getCashVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: nextProjectCode || current.costCenter,
        currency: nextCurrency,
        fxRate: nextFxRate,
        lineEntries: automaticEntries,
        partyCode: nextPartyCode,
        partyName: nextPartyName,
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
      createBlankCashVoucherLineEntry({
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
      const nextAmount = getPaymentVoucherCopiedDisburseAmount(mergedEntries, isGeneratedAccountingEntry, roundHydratedCashVoucherAmount);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        currency: firstRecord.currency || current.currency,
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
    const copiedEntries: CashVoucherLineEntry[] = selectedPcrs.flatMap((pcr) => {
      const refId = `PCR:${pcr.transactionNo}`;
      const sourceDetails = pcr.details && pcr.details.length > 0 ? pcr.details : [];
      const ratio = getPaymentVoucherCopyRatio(pcr);

      if (sourceDetails.length === 0) {
        const disburseAmount = Number(pcr.availableAmount) || 0;
        const particulars = `Payment for PCR ${pcr.transactionNo}`;
        return [
          createBlankCashVoucherLineEntry({
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
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedCashVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedCashVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedCashVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedCashVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio, roundHydratedCashVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || pcr.projectCode || pcr.projectName || "";
        const particulars = detail.particulars || pcr.remarks || `Payment for PCR ${pcr.transactionNo}`;
        const vatCode = detail.vatType || "";
        const ewtCode = detail.ewtCode || "";

        return createBlankCashVoucherLineEntry({
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
      const nextAmount = getCashVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstPcr.projectCode || firstPcr.projectName || current.costCenter,
        currency: firstPcr.currency || current.currency || "PHP",
        fxRate: String(firstPcr.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstPcr.partyCode || "",
        partyName: current.partyName || firstPcr.partyName || "",
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
    const copiedEntries: CashVoucherLineEntry[] = selectedRfrs.flatMap((rfr) => {
      const refId = `RFR:${rfr.transactionNo}`;
      const sourceDetails = rfr.details && rfr.details.length > 0 ? rfr.details : [];
      const ratio = getPaymentVoucherCopyRatio(rfr);

      if (sourceDetails.length === 0) {
        const disburseAmount = Number(rfr.availableAmount) || 0;
        const particulars = `Payment for RFR ${rfr.transactionNo}`;
        return [
          createBlankCashVoucherLineEntry({
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
        const grossAmount = scalePaymentVoucherCopyAmount(detail.amount, ratio, roundHydratedCashVoucherAmount);
        const netAmount = scalePaymentVoucherCopyAmount(detail.netAmount, ratio, roundHydratedCashVoucherAmount);
        const vatAmount = scalePaymentVoucherCopyAmount(detail.vatAmount, ratio, roundHydratedCashVoucherAmount);
        const ewtAmount = scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio, roundHydratedCashVoucherAmount);
        const disburseAmount = scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio, roundHydratedCashVoucherAmount);
        const responsibilityCenter = detail.responsibilityCenter || rfr.projectCode || rfr.projectName || "";
        const particulars = detail.particulars || rfr.remarks || `Payment for RFR ${rfr.transactionNo}`;
        const vatCode = detail.vatType || "";
        const ewtCode = detail.ewtCode || "";

        return createBlankCashVoucherLineEntry({
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
      const nextAmount = getCashVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstRfr.projectCode || firstRfr.projectName || current.costCenter,
        currency: firstRfr.currency || current.currency || "PHP",
        fxRate: String(firstRfr.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstRfr.partyCode || "",
        partyName: current.partyName || firstRfr.partyName || "",
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
    const copiedEntries: CashVoucherLineEntry[] = selectedAdvances.map((advance) => {
      const refId = `${advance.referencePrefix}:${advance.transactionNo}`;
      const disburseAmount = Number(advance.availableAmount) || 0;
      const particulars = advance.remarks || `Payment for ${advance.referencePrefix} ${advance.transactionNo}`;

      return createBlankCashVoucherLineEntry({
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
      const nextAmount = getCashVoucherCopiedDisburseAmount(mergedEntries);

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
    const copiedEntries: CashVoucherLineEntry[] = selectedAtsRecords.flatMap((ats) => {
      const refId = `ATS:${ats.transactionNo}`;
      const sourceDetails = ats.details && ats.details.length > 0 ? ats.details : [];

      return sourceDetails.map((detail) => {
        const disburseAmount = Number(detail.consumptionAmount || detail.amount || ats.availableAmount || 0);
        const particulars = detail.particulars || ats.remarks || `Payment for ATS ${ats.transactionNo}`;

        return createBlankCashVoucherLineEntry({
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
      const nextAmount = getCashVoucherCopiedDisburseAmount(mergedEntries);

      return {
        ...current,
        amount: nextAmount.toFixed(2),
        costCenter: current.projectCode || firstAts.projectCode || firstAts.projectName || current.costCenter,
        currency: firstAts.currency || current.currency || "PHP",
        fxRate: String(firstAts.exchangeRate || current.fxRate || "1.00"),
        lineEntries: automaticEntries,
        partyCode: current.partyCode || firstAts.partyCode || "",
        partyName: current.partyName || firstAts.partyName || "",
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

  return {
    discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    currentStatus,
    currencyOptions: transactionCurrency.currencyOptions,
    copyFromRecords,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isDisbursementTypeDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPartyNameDrawerOpen,
    isProjectNameDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    isSubmitting,
    isResponsibilityCenterDrawerOpen,
    mode,
    partyStore,
    partyOptions,
    responsibilityCenterOptions,
    responsibilityCenterStore,
    returnLink: isRecordMissing ? CashVoucherLink : returnLink,
    selectedTransaction: undefined,
    totalCredit,
    totalDebit,
    values,
    handleAddEntries,
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
    handlePartyChange,
    handleRemoveEntry,
    handleReplaceLineEntries,
    handleSubmit,
    handleUpdateEntry,
    handleUpdateEntryFields,
    handleUpdateStatus,
    setActiveTab,
    setIsDisbursementTypeDrawerOpen,
    setIsPartyNameDrawerOpen,
    setIsProjectNameDrawerOpen,
    setIsReportPreviewOpen,
    handleCloseResponsibilityCenterDrawer,
    cancelCashVoucherSubmit,
    confirmCashVoucherSubmit,
    pendingSubmitStatus: pendingSubmitValues?.status ?? null,
    requestCashVoucherSubmit,
    updateField,
    updatePaymentDetails,
  };
}

function shouldEntryRemarksFollowHeader(entry: CashVoucherLineEntry, previousHeaderRemarks: string) {
  const normalizedEntryRemarks = (entry.particulars || entry.remarks || "").trim();
  const normalizedHeaderRemarks = previousHeaderRemarks.trim();
  const normalizedCreatedRemarks = entry.accountName.trim();

  return (
    normalizedEntryRemarks === "" ||
    normalizedEntryRemarks === normalizedCreatedRemarks ||
    (normalizedHeaderRemarks !== "" && normalizedEntryRemarks === normalizedHeaderRemarks)
  );
}

function restoreCashVoucherAddDraftValues(draftValues: CashVoucherFormValues): CashVoucherFormValues {
  return {
    ...draftValues,
    status: CashVoucherStatuses.Open,
  };
}

function applyMissingPartyTaxDefaultsToEntries(
  entries: CashVoucherLineEntry[],
  partyOptions: CashVoucherPartyDropdownOption[],
  taxCodes: AlphanumericTaxCode[],
) {
  let changed = false;

  const nextEntries = entries.map((entry) => {
    if (isGeneratedAccountingEntry(entry)) {
      return entry;
    }

    const partyCode = (entry.partyCode ?? "").trim();
    const partyName = (entry.partyName ?? "").trim();

    if (!partyCode && !partyName) {
      return entry;
    }

    const selectedParty = partyOptions.find(
      (option) => option.value === partyCode || option.label === partyCode || option.name.trim().toLowerCase() === partyName.toLowerCase(),
    );

    if (!selectedParty) {
      return entry;
    }

    const defaultVatCode =
      selectedParty.vatCode || findPartyTaxCode(taxCodes, selectedParty.defaultPurchaseInputVatTaxSourceKey, PurchaseTaxTypeVat);
    const defaultEwtCode =
      selectedParty.ewtCode || findPartyTaxCode(taxCodes, selectedParty.defaultPurchaseEwtTaxSourceKey, PurchaseTaxTypeEwt);
    const currentVatCode = entry.taxDetails?.vatCode || entry.vatType || "";
    const currentEwtCode = entry.taxDetails?.ewtCode || entry.ewtCode || "";
    const nextVatCode = currentVatCode || defaultVatCode;
    const nextEwtCode = currentEwtCode || defaultEwtCode;

    if (currentVatCode === nextVatCode && currentEwtCode === nextEwtCode) {
      return entry;
    }

    changed = true;

    const nextTaxRate = nextVatCode ? getVatRateFromCode(nextVatCode, taxCodes) : entry.taxRate;
    const nextVatPercent = nextVatCode ? getVatPercentFromRate(nextTaxRate) : (entry.taxDetails?.vatPercent ?? 0);
    const nextEwtPercent = nextEwtCode ? getEwtPercentFromCode(nextEwtCode, taxCodes) : (entry.taxDetails?.ewtPercent ?? 0);

    return {
      ...applyPartyTaxDefaults(
        {
          ...entry,
          partyCode: partyCode || selectedParty.label,
          partyName: partyName || selectedParty.name,
        },
        nextVatCode,
        nextEwtCode,
        nextVatPercent,
        nextEwtPercent,
      ),
      taxRate: nextTaxRate,
    };
  });

  return { changed, entries: nextEntries };
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

function getHydratedCashVoucherGrossAmount(detail: Record<string, unknown>) {
  const storedGrossAmount = getCashVoucherDetailNumber(detail, "grossAmount");
  const debitAmount = getCashVoucherDetailNumber(detail, "debit");
  const vatPercent = getCashVoucherDetailNumber(detail, "vatPercent");

  if (storedGrossAmount > 0 && debitAmount > 0 && vatPercent > 0 && Math.abs(storedGrossAmount - debitAmount) <= 0.01) {
    const netRatio = 1 - vatPercent / 100;

    if (netRatio > 0) {
      return roundHydratedCashVoucherAmount(debitAmount / netRatio);
    }
  }

  return storedGrossAmount || debitAmount;
}

function getCashVoucherDetailNumber(detail: Record<string, unknown>, key: string) {
  const taxDetails = detail.taxDetails as Record<string, unknown> | undefined;
  const value = detail[key] ?? taxDetails?.[key];
  const amount = Number(value || 0);

  return Number.isFinite(amount) ? amount : 0;
}

function getCashVoucherDetailString(detail: Record<string, unknown>, key: string) {
  const taxDetails = detail.taxDetails as Record<string, unknown> | undefined;
  const value = detail[key] ?? taxDetails?.[key];

  return typeof value === "string" ? value : "";
}

function roundHydratedCashVoucherAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

type CashVoucherPartyTaxType = typeof PurchaseTaxTypeEwt | typeof PurchaseTaxTypeVat;

function findPartyTaxCode(taxCodes: AlphanumericTaxCode[], sourceKey: string | undefined, taxType: CashVoucherPartyTaxType) {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find(
    (tax) =>
      tax.sourceKey === sourceKey &&
      (taxType === PurchaseTaxTypeVat
        ? tax.taxType === PurchaseTaxTypeInputVat || tax.taxType === PurchaseTaxTypeVat
        : tax.taxType === PurchaseTaxTypeEwt || tax.taxType === PurchaseTaxTypeCwt),
  );

  return taxCode ? (taxType === PurchaseTaxTypeEwt ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

function applyPartyTaxDefaults(entry: CashVoucherLineEntry, vatCode: string, ewtCode: string, vatPercent: number, ewtPercent: number) {
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      ewtCode,
      ewtPercent,
      vatCode,
      vatPercent,
      vatType: vatCode,
    },
    parseMoneyNumberInput(entry.taxDetails?.grossAmount ?? entry.debit ?? entry.credit),
    "0%",
  );

  return {
    ...entry,
    ewtCode,
    partyCode: entry.partyCode,
    partyName: entry.partyName,
    taxDetails,
    vatType: vatCode,
  };
}

function clearAccountingGridSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(CashDisbursementAccountingGridSessionStorageKey);
  }
}

function getCashVoucherCopiedDisburseAmount(entries: CashVoucherLineEntry[]) {
  return getPaymentVoucherCopiedDisburseAmount(entries, isGeneratedAccountingEntry, roundHydratedCashVoucherAmount);
}
