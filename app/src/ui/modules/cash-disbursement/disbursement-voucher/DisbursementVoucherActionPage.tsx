"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  MoreHorizontal,
  Percent,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DisbursementVoucherHref,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
  applyCopyFromRecordsToDisbursementVoucherForm,
  createBlankDisbursementLineEntry,
  createDisbursementVoucherStatusHistoryEntry,
  createTaxDetails,
  createDisbursementTransactionFromForm,
  createDisbursementVoucherFormValues,
  createDisbursementVoucherFromForm,
  formatTaxRateSummary,
  syncTaxDetailsAmount,
  updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import {
  getPartyDisplayName,
} from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  getModuleChartAccounts,
  type ModuleChartAccount,
} from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
  MockMultiCurrencySetupRecords,
  MultiCurrencyCatalog,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import {
  createEwtOptions,
  createVatOptions,
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  normalizeVatDropdownValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import type { AppDisbursementTypeRecord } from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import type {
  DisbursementVoucherBankAccount,
  DisbursementLineEntry,
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { BankMasterfile } from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionHeader";
import { DisbursementVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherReportPreview";
import { openDisbursementVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherPdf";
import {
  clearAccountingGridSession,
  readAccountingGridSession,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherNotFound";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  MoneyNumberField,
  formatMoneyNumberInput,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const AppPaymentTypeDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog").then(
      (module) => module.AppPaymentTypeDialog,
    ),
  { ssr: false },
);

const AppDisbursementTypeDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog").then(
      (module) => module.AppDisbursementTypeDialog,
    ),
  { ssr: false },
);

export function DisbursementVoucherActionPage() {
  return (
    <Suspense fallback={<VoucherWorkflowSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

const InitialDisbursementTypeRecords: AppDisbursementTypeRecord[] = [
  {
    id: "disbursement-type-vendor-payment",
    name: "Vendor Payment",
    description: "Payment to suppliers and trade vendors.",
    type: "Vendor Payment",
    status: "Active",
  },
  {
    id: "disbursement-type-operating-expense",
    name: "Operating Expense",
    description: "Regular operating expense settlement.",
    type: "Operating Expense",
    status: "Active",
  },
  {
    id: "disbursement-type-reimbursement",
    name: "Reimbursement",
    description: "Employee or party reimbursement.",
    type: "Reimbursement",
    status: "Active",
  },
  {
    id: "disbursement-type-capital-expenditure",
    name: "Capital Expenditure",
    description: "Asset and capital project disbursement.",
    type: "Capital Expenditure",
    status: "Active",
  },
];

function DisbursementVoucherActionInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const mode = getActionMode(pathname);
  const transactions = useDisbursementVoucherStore(
    (state) => state.transactions,
  );
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const addTransaction = useDisbursementVoucherStore(
    (state) => state.addTransaction,
  );
  const updateTransaction = useDisbursementVoucherStore(
    (state) => state.updateTransaction,
  );
  const addVoucher = useDisbursementVoucherStore((state) => state.addVoucher);
  const updateVoucher = useDisbursementVoucherStore(
    (state) => state.updateVoucher,
  );
  const routeTransactionId =
    mode === "add"
      ? (searchParams.get("transactionId") ?? "")
      : (params.recordId ?? "");
  const routeTransaction = transactions.find(
    (transaction) => transaction.id === routeTransactionId,
  );
  const routeVoucher = vouchers.find(
    (voucher) => voucher.transactionId === routeTransactionId,
  );
  const returnHref = createVoucherActionReturnHref(
    searchParams.get("from"),
    routeTransactionId,
  );
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createInitialDisbursementVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: routeVoucher,
    }),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const paymentTypeStore = usePaymentTypeStore();
  const paymentTypeRecords = paymentTypeStore.paymentTypes;
  const bankAccounts = useBankMasterfileStore((state) =>
    createVoucherBankAccounts(state.banks),
  );
  const defaultAccounts = useDefaultAccountStore(
    (state) => state.defaultAccounts,
  );
  const [disbursementTypeRecords, setDisbursementTypeRecords] = useState(
    InitialDisbursementTypeRecords,
  );
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] =
    useState(false);

  useEffect(() => {
    clearAccountingGridSession();
  }, []);
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === values.transactionId,
  );
  const existingVoucher = vouchers.find(
    (voucher) => voucher.transactionId === values.transactionId,
  );
  const currentStatus =
    existingVoucher?.status ?? selectedTransaction?.status ?? values.status;
  const isReadonly =
    mode === "view" ||
    (mode === "edit" && !canEditDisbursementVoucherStatus(currentStatus));
  const totalDebit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0),
    [values.lineEntries],
  );
  const totalCredit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0),
    [values.lineEntries],
  );
  if (!selectedTransaction && mode !== "add") {
    return <DisbursementVoucherNotFound />;
  }

  if (mode === "edit" && !existingVoucher) {
    return <DisbursementVoucherNotFound />;
  }

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleRemoveEntry(entryId: string) {
    const nextEntries = values.lineEntries.filter((entry) => entry.id !== entryId);

    updateField(
      "lineEntries",
      nextEntries.length > 0 ? nextEntries : [createBlankEntry()],
    );
  }

  function createBlankEntry(): DisbursementLineEntry {
    const refId =
      values.voucherReferenceNo ||
      selectedTransaction?.transactionNo ||
      values.transactionId;
    const responsibilityCenter =
      values.costCenter || selectedTransaction?.costCenter || "";

    return createBlankDisbursementLineEntry({
      partyCode: values.vceCode,
      partyName: values.vceName,
      refId,
      responsibilityCenter,
      taxDetails: {
        ...createTaxDetails(0, "0%"),
        refId,
        responsibilityCenter,
      },
    });
  }

  function handleAddEntries(count = 1) {
    updateField("lineEntries", [
      ...values.lineEntries,
      ...Array.from({ length: count }, createBlankEntry),
    ]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleUpdateEntry(
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(
    entryId: string,
    updates: Partial<DisbursementLineEntry>,
  ) {
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
    const rowIndex = values.lineEntries.findIndex((entry) => entry.id === entryId);
    const insertIndex =
      rowIndex === -1
        ? values.lineEntries.length
        : rowIndex + (position === "below" ? 1 : 0);
    const nextEntries = [...values.lineEntries];

    nextEntries.splice(insertIndex, 0, createBlankEntry());
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    const rowIndex = values.lineEntries.findIndex((entry) => entry.id === entryId);
    const sourceEntry = values.lineEntries[rowIndex];

    if (!sourceEntry) {
      return;
    }

    const nextEntries = [...values.lineEntries];

    nextEntries.splice(rowIndex + 1, 0, {
      ...sourceEntry,
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    if (fromEntryId === toEntryId) {
      return;
    }

    const fromIndex = values.lineEntries.findIndex(
      (entry) => entry.id === fromEntryId,
    );
    const toIndex = values.lineEntries.findIndex((entry) => entry.id === toEntryId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const nextEntries = [...values.lineEntries];
    const [movedEntry] = nextEntries.splice(fromIndex, 1);

    nextEntries.splice(toIndex, 0, movedEntry);
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    const nextEntries =
      action === "all"
        ? []
        : values.lineEntries.filter((entry) => !shouldClearEntry(entry, action));

    updateField("lineEntries", nextEntries.length > 0 ? nextEntries : [createBlankEntry()]);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: DisbursementLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isPaymentCreditEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);

    updateField("lineEntries", nextEntries);
    updateField("amount", amount > 0 ? amount.toFixed(2) : "");
    updateField(
      "taxDetails",
      syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate),
    );
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (isReadonly) {
      return;
    }

    const detailsErrors = validateDisbursementVoucherDetails(values);
    const entryErrors = validateDisbursementVoucherEntries(values);
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      return;
    }

    if (mode === "edit" && existingVoucher) {
      updateVoucher(updateDisbursementVoucherFromForm(existingVoucher, values));
    } else {
      if (!selectedTransaction) {
        addTransaction(createDisbursementTransactionFromForm(values));
      }
      addVoucher(createDisbursementVoucherFromForm(values));
    }

    router.push(returnHref);
  }

  function handleUpdateStatus(status: DisbursementVoucherStatus) {
    if (!canUpdateDisbursementVoucherStatus(currentStatus, status)) {
      return;
    }

    setValues((currentValues) => ({ ...currentValues, status }));

    if (existingVoucher) {
      updateVoucher({
        ...existingVoucher,
        status,
        history: [
          ...(existingVoucher.history ?? []),
          createDisbursementVoucherStatusHistoryEntry(
            status,
            existingVoucher.voucherNo,
          ),
        ],
      });
      return;
    }

    if (selectedTransaction) {
      updateTransaction({ ...selectedTransaction, status });
    }
  }

  function handleCreateDisbursementType(record: AppDisbursementTypeRecord) {
    setDisbursementTypeRecords((currentRecords) => [
      record,
      ...currentRecords,
    ]);

    return record;
  }

  function handleUpdateDisbursementType(record: AppDisbursementTypeRecord) {
    setDisbursementTypeRecords((currentRecords) =>
      currentRecords.map((currentRecord) =>
        currentRecord.id === record.id ? record : currentRecord,
      ),
    );

    return record;
  }

  const actionContent = (
    <>
      <DisbursementVoucherActionHeader
        mode={isReadonly ? "view" : mode}
        transaction={selectedTransaction}
        voucher={existingVoucher}
        onUpdateStatus={handleUpdateStatus}
        onPreview={() => setIsReportPreviewOpen(true)}
        onSubmit={() => handleSubmit()}
        copyFromRecords={DisbursementVoucherCopyFromRecords}
        copyFromSources={DisbursementVoucherCopySources}
        onCopyFrom={(recordIds) => {
          const selectedRecords = recordIds
            .map((recordId) =>
              DisbursementVoucherCopyFromRecords.find(
                (candidate) => candidate.id === recordId,
              ),
            )
            .filter(
              (
                record,
              ): record is (typeof DisbursementVoucherCopyFromRecords)[number] =>
                Boolean(record),
            );

          if (selectedRecords.length === 0) {
            return;
          }

          setValues((currentValues) =>
            applyCopyFromRecordsToDisbursementVoucherForm(
              currentValues,
              selectedRecords,
            ),
          );
          setErrors({});
        }}
        returnHref={returnHref}
      />

      <VoucherDetailsPanel
        errors={errors}
        isReadonly={isReadonly}
        bankAccounts={bankAccounts}
        paymentTypeRecords={paymentTypeRecords}
        transactions={transactions}
        values={values}
        onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
        onUpdateField={updateField}
      />

      <VoucherDataEntry
        errors={errors}
        entries={values.lineEntries}
        isReadonly={isReadonly}
        defaultAccounts={defaultAccounts}
        paymentMethod={values.paymentMethod}
        paymentTypeRecord={
          paymentTypeRecords.find(
            (record) => record.paymentType === values.paymentMethod,
          ) ?? null
        }
        onAddEntries={handleAddEntries}
        onAddDisbursementType={() => setIsDisbursementTypeDrawerOpen(true)}
        onClearEntries={handleClearEntries}
        onDuplicateEntry={handleDuplicateEntry}
        onInsertEntry={handleInsertEntry}
        onMoveEntry={handleMoveEntry}
        onReplaceEntries={handleReplaceLineEntries}
        onUpdateEntry={handleUpdateEntry}
        onUpdateEntryFields={handleUpdateEntryFields}
        totalCredit={totalCredit}
        totalDebit={totalDebit}
        onRemoveEntry={handleRemoveEntry}
      />
    </>
  );

  return (
    <>
      {isReadonly ? (
        <section className="grid min-w-0 gap-5">{actionContent}</section>
      ) : (
        <form onSubmit={handleSubmit} className="grid min-w-0 gap-5">
          {actionContent}
        </form>
      )}

      <DisbursementVoucherReportPreview
        isOpen={isReportPreviewOpen}
        values={values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openDisbursementVoucherPdf(values)}
      />

      {!isReadonly && isPaymentTypeDialogOpen ? (
        <AppPaymentTypeDialog
          isOpen
          isLoading={paymentTypeStore.isLoading}
          isMutating={paymentTypeStore.isMutating}
          records={paymentTypeRecords}
          onClose={() => setIsPaymentTypeDialogOpen(false)}
          onCreateRecord={paymentTypeStore.addPaymentType}
          onUpdateRecord={paymentTypeStore.updatePaymentType}
          onSelect={(paymentType) => {
            updateField("paymentMethod", paymentType);
            setIsPaymentTypeDialogOpen(false);
          }}
        />
      ) : null}
      <AppDisbursementTypeDialog
        isOpen={!isReadonly && isDisbursementTypeDrawerOpen}
        records={disbursementTypeRecords}
        onClose={() => setIsDisbursementTypeDrawerOpen(false)}
        onCreateRecord={handleCreateDisbursementType}
        onUpdateRecord={handleUpdateDisbursementType}
        onSelect={(disbursementType) => {
          updateField("disbursementType", disbursementType);
          setIsDisbursementTypeDrawerOpen(false);
        }}
      />
    </>
  );
}

function getActionMode(pathname: string): DisbursementVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function createInitialDisbursementVoucherFormValues({
  mode,
  transaction,
  voucher,
}: {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const defaultValues = createDisbursementVoucherFormValues(transaction, voucher);

  if (mode === "add") {
    return defaultValues;
  }

  const session = readAccountingGridSession();

  if (session?.mode !== mode) {
    return defaultValues;
  }

  return {
    ...defaultValues,
    ...session.values,
    referenceModule:
      session.values.referenceModule.trim() || defaultValues.referenceModule,
    voucherReferenceNo:
      session.values.voucherReferenceNo.trim() ||
      defaultValues.voucherReferenceNo,
  };
}

function canUpdateDisbursementVoucherStatus(
  currentStatus: DisbursementVoucherStatus,
  nextStatus: DisbursementVoucherStatus,
) {
  if (nextStatus === "Approved") {
    return canApproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === "Disapproved") {
    return canDisapproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === "Cancelled") {
    return canCancelDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === "Pending") {
    return (
      currentStatus === "Approved" ||
      currentStatus === "Disapproved" ||
      currentStatus === "Cancelled"
    );
  }

  if (
    (nextStatus === "Active" || nextStatus === "Draft") &&
    (currentStatus === "Approved" || currentStatus === "Disapproved")
  ) {
    return true;
  }

  if (nextStatus === "Draft" || nextStatus === "Active") {
    return currentStatus === "Cancelled";
  }

  return false;
}

function createVoucherActionReturnHref(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return `${DisbursementVoucherHref}/view/${transactionId}`;
  }

  return DisbursementVoucherHref;
}

function createVoucherCurrencyOptions() {
  const activeCurrencyCodes = new Set(
    MockMultiCurrencySetupRecords.filter(
      (record) => record.status === "Active",
    ).flatMap((record) => [
      record.baseCurrencyCode,
      record.targetCurrencyCode,
    ]),
  );

  activeCurrencyCodes.add("PHP");

  return MultiCurrencyCatalog.filter(
    (currency) => currency.isEnabled && activeCurrencyCodes.has(currency.code),
  );
}

function createVoucherCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function getVoucherCurrencyExchangeRate(currencyCode: string) {
  if (!currencyCode || currencyCode === "PHP") {
    return "1.0000";
  }

  const matchedRate = MockMultiCurrencySetupRecords.find(
    (record) =>
      record.status === "Active" &&
      record.baseCurrencyCode === "PHP" &&
      record.targetCurrencyCode === currencyCode,
  );

  return (matchedRate?.originalExchangeRate ?? 1).toFixed(4);
}

function createVoucherBankAccounts(
  banks: BankMasterfile[],
): DisbursementVoucherBankAccount[] {
  return banks
    .filter((bank) => bank.status === "Active")
    .map((bank) => ({
      id: bank.id,
      accountCode: bank.accountCode,
      accountTitle: bank.accountName,
      bankName: bank.bankName,
      branch: bank.branch,
      accountName: bank.accountName,
      accountNo: bank.accountNumber,
    }));
}

function createVoucherPaymentTypeOptions({
  paymentTypeRecords,
}: {
  paymentTypeRecords: AppPaymentTypeRecord[];
}): AppAdvancedDropdownOption[] {
  return paymentTypeRecords
    .filter((record) => record.status === "Active")
    .map((record) => ({
      label: record.type,
      name: record.paymentType,
      value: record.paymentType,
    }));
}

function createVoucherPartyOptions({
  currentPartyCode,
  currentPartyName,
  partyRecords,
  transactions,
}: {
  currentPartyCode: string;
  currentPartyName: string;
  partyRecords: PartyInformationRecord[];
  transactions: DisbursementTransactionRecord[];
}): AppAdvancedDropdownOption[] {
  const options = partyRecords
    .filter((party) => party.status === "Active")
    .map((party) => ({
      description: party.partyTypes.join(", "),
      label: party.partyCodeNo,
      name: getPartyDisplayName(party),
      value: party.partyCodeNo,
    }));

  transactions.forEach((transaction) => {
    const matchedParty = findPartyRecordByName(partyRecords, transaction.payee);

    addUniqueDropdownOption(options, {
      description: matchedParty
        ? matchedParty.partyTypes.join(", ")
        : "Source transaction",
      label: matchedParty?.partyCodeNo ?? "Source transaction",
      name: transaction.payee,
      value: matchedParty?.partyCodeNo ?? transaction.payee,
    });
  });

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current voucher value",
      label: currentPartyCode || "Current voucher",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

function addUniqueDropdownOption(
  options: AppAdvancedDropdownOption[],
  option: AppAdvancedDropdownOption,
) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}

function findPartyRecordByName(
  partyRecords: PartyInformationRecord[],
  name: string,
) {
  const normalizedName = name.trim().toLowerCase();

  return partyRecords.find(
    (party) => getPartyDisplayName(party).trim().toLowerCase() === normalizedName,
  );
}

function createAccountingChartAccountOptions(
  entries: DisbursementLineEntry[],
): ModuleChartAccount[] {
  const chartAccounts = getModuleChartAccounts();
  const accountKeys = new Set(
    chartAccounts.flatMap((account) => [
      account.accountName.toLowerCase(),
      account.accountNumber,
    ]),
  );
  const customAccounts: ModuleChartAccount[] = [];

  entries.forEach((entry) => {
    const accountName = entry.accountName.trim();
    const accountKey = accountName.toLowerCase();

    if (!accountName || accountKeys.has(accountKey)) {
      return;
    }

    accountKeys.add(accountKey);
    customAccounts.push({
      accountCategory: "Other",
      accountName,
      accountNumber: entry.accountCode,
      accountType: "Expenses",
      description: entry.accountCode,
      id: `entry-account-${entry.id}`,
      normalBalance: parseMoneyNumberInput(entry.credit) > 0 ? "Credit" : "Debit",
      statementGroup: "Income Statement",
      statementSection: "Accounting Entry",
      status: "Active",
    });
  });

  return [...chartAccounts, ...customAccounts];
}

function createDefaultAccountExpenseOptions(
  defaultAccounts: DefaultAccount[],
): ModuleChartAccount[] {
  return defaultAccounts
    .filter((account) => account.status === "Active" && account.type === "EXPENSE")
    .flatMap((account) =>
      account.generatedAccounts
        .filter(
          (generatedAccount) =>
            generatedAccount.role === "EXPENSE" &&
            generatedAccount.status === "ACTIVE",
        )
        .map<ModuleChartAccount>((generatedAccount) => ({
          accountCategory:
            generatedAccount.accountNature ?? generatedAccount.role,
          accountName: generatedAccount.accountTitle,
          accountNumber: generatedAccount.accountCode,
          accountType: generatedAccount.accountType ?? "Expenses",
          description: account.defaultAccountName,
          id: generatedAccount.chartAccountId,
          normalBalance: "Debit",
          statementGroup: "Income Statement",
          statementSection:
            generatedAccount.accountNature ?? "Default Account Expense",
          status: "Active",
        })),
    );
}

function normalizeDisbursementLineEntryFields(
  entry: DisbursementLineEntry,
): DisbursementLineEntry {
  const taxDetails = entry.taxDetails ?? createTaxDetails(0, "0%");

  return {
    ...entry,
    atcCode: entry.atcCode ?? taxDetails.atcCode ?? "",
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    refId: entry.refId ?? taxDetails.refId ?? "",
    responsibilityCenter:
      entry.responsibilityCenter ?? taxDetails.responsibilityCenter ?? "",
    taxDetails,
    vatType: entry.vatType ?? taxDetails.vatType ?? "",
  };
}

function syncDisbursementLineEntryTaxDetails(
  entry: DisbursementLineEntry,
): DisbursementLineEntry {
  const amount =
    parseMoneyNumberInput(entry.debit) || parseMoneyNumberInput(entry.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      atcCode: entry.atcCode ?? entry.taxDetails.atcCode,
      refId: entry.refId ?? entry.taxDetails.refId,
      responsibilityCenter:
        entry.responsibilityCenter ?? entry.taxDetails.responsibilityCenter,
      vatType: entry.vatType ?? entry.taxDetails.vatType,
    },
    amount,
    String(entry.taxRate || "0%"),
  );

  return {
    ...entry,
    atcCode: taxDetails.atcCode,
    refId: taxDetails.refId,
    responsibilityCenter: taxDetails.responsibilityCenter,
    taxDetails,
    vatType: taxDetails.vatType,
  };
}

function VoucherWorkflowSkeleton() {
  return (
    <section className="grid gap-6">
      <div className="h-28 animate-pulse rounded-[28px] bg-darknavy/6" />
      <div className="h-[36rem] animate-pulse rounded-[28px] bg-darknavy/6" />
    </section>
  );
}

function VoucherDetailsPanel({
  bankAccounts,
  errors,
  isReadonly,
  onOpenPaymentTypeDialog,
  onUpdateField,
  paymentTypeRecords,
  transactions,
  values,
}: {
  bankAccounts: DisbursementVoucherBankAccount[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  onOpenPaymentTypeDialog: () => void;
  onUpdateField: <TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) => void;
  paymentTypeRecords: AppPaymentTypeRecord[];
  transactions: DisbursementTransactionRecord[];
  values: DisbursementVoucherFormValues;
}) {
  const partyRecords = usePartyManagementStore((state) => state.records);
  const addPartyRecord = usePartyManagementStore((state) => state.addRecord);
  const isPartyMutating = usePartyManagementStore((state) => state.isMutating);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const selectedTransaction = useMemo(
    () =>
      transactions.find(
        (transaction) => transaction.id === values.transactionId,
      ) ?? null,
    [transactions, values.transactionId],
  );
  const transactionNumberValue =
    selectedTransaction?.transactionNo ?? values.transactionId;
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createVoucherPartyOptions({
        currentPartyCode: values.vceCode,
        currentPartyName: values.vceName,
        partyRecords,
        transactions,
      }),
    [partyRecords, transactions, values.vceCode, values.vceName],
  );
  const paymentTypeOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createVoucherPaymentTypeOptions({
        paymentTypeRecords,
      }),
    [paymentTypeRecords],
  );
  const currencyOptions = useMemo(() => createVoucherCurrencyDropdownOptions(), []);

  function updateCurrency(nextCurrency: string) {
    onUpdateField(
      "currency",
      nextCurrency as DisbursementVoucherFormValues["currency"],
    );
    onUpdateField("fxRate", getVoucherCurrencyExchangeRate(nextCurrency));
  }

  function updateTransactionNumber(nextTransactionNumber: string) {
    const matchedTransaction = transactions.find(
      (transaction) =>
        transaction.transactionNo === nextTransactionNumber ||
        transaction.id === nextTransactionNumber,
    );

    onUpdateField("transactionId", matchedTransaction?.id ?? nextTransactionNumber);
  }

  function updatePaymentDetails(
    nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>,
  ) {
    onUpdateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
  }

  function syncCashEntriesForPaymentType(paymentMethod: string) {
    const paymentTypeRecord =
      paymentTypeRecords.find((record) => record.paymentType === paymentMethod) ??
      null;
    const isCashPayment =
      paymentTypeRecord?.type === "Cash" ||
      paymentMethod.trim().toLowerCase() === "cash";

    if (!isCashPayment) {
      const currentBankAccount =
        bankAccounts.find(
          (account) =>
            account.accountCode === values.paymentDetails.bankAccountCode,
        ) ?? null;

      onUpdateField(
        "lineEntries",
        currentBankAccount
          ? createPaymentBalancedEntries(values.lineEntries, {
            accountCode: currentBankAccount.accountCode,
            accountName: currentBankAccount.accountTitle,
            particulars: `Settlement via ${paymentMethod || "payment"}`,
          })
          : values.lineEntries.filter((entry) => !isPaymentCreditEntry(entry)),
      );
      return;
    }

    const expenseEntry = values.lineEntries.find((entry) => !isCashInHandEntry(entry));

    if (!expenseEntry) {
      return;
    }

    onUpdateField(
      "lineEntries",
      createCashExpenseBalancedEntries(values.lineEntries, expenseEntry.id, {}),
    );
  }

  function updateBankAccount(accountCode: string) {
    const bankAccount = bankAccounts.find(
      (account) => account.accountCode === accountCode,
    ) ?? null;

    if (!bankAccount) {
      updatePaymentDetails({
        bankAccountCode: "",
        bankAccountName: "",
        bankAccountNo: "",
        bankAccountTitle: "",
        bankBranch: "",
        bankName: "",
      });
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
    onUpdateField(
      "lineEntries",
      createPaymentBalancedEntries(values.lineEntries, {
        accountCode: bankAccount.accountCode,
        accountName: bankAccount.accountTitle,
        particulars: `Settlement via ${values.paymentMethod || "payment"}`,
      }),
    );
  }

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <FieldShell
            controlId="disbursement-voucher-payment-type"
            label="Payment Type"
            error={errors.paymentMethod}
            isRequired
          >
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
              <AppAdvancedDropdown
                className={AttachedDropdownClassName}
                id="disbursement-voucher-payment-type"
                value={values.paymentMethod}
                readOnly={isReadonly}
                options={paymentTypeOptions}
                placeholder="Select payment type"
                searchPlaceholder="Search payment type"
                onChange={(value) => {
                  const paymentMethod = String(value);

                  onUpdateField("paymentMethod", paymentMethod);
                  updatePaymentDetails({
                    checkStatus: "",
                    commission: "",
                    payee: values.vceName,
                    paymentReferenceNo: "",
                    transferAccountName: "",
                    transferAccountNo: "",
                    transferToBank: "",
                    transferTo: "",
                  });
                  syncCashEntriesForPaymentType(paymentMethod);
                }}
              />
              <button
                type="button"
                disabled={isReadonly}
                onClick={onOpenPaymentTypeDialog}
                className={AttachedAddButtonClassName}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-party"
            label="Party Name"
            error={errors.vceCode || errors.vceName}
            isRequired
          >
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
              <AppAdvancedDropdown
                className={AttachedDropdownClassName}
                id="disbursement-voucher-party"
                options={partyOptions}
                placeholder="Select Party Name"
                readOnly={isReadonly}
                searchPlaceholder="Search Party Name"
                value={values.vceCode}
                onChange={(value) => {
                  const code = String(value);
                  const party = partyOptions.find((option) => option.value === code);

                  onUpdateField("vceCode", code);
                  onUpdateField("vceName", party?.name ?? values.vceName);
                }}
              />
              <button
                type="button"
                disabled={isReadonly}
                onClick={() => setIsPartyDrawerOpen(true)}
                className={AttachedAddButtonClassName}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-currency"
            label="Currency"
            error={errors.currency}
          >
            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <AppAdvancedDropdown
                id="disbursement-voucher-currency"
                value={values.currency}
                readOnly={isReadonly}
                isClearable={false}
                options={currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search currency"
                onChange={(value) => updateCurrency(String(value))}
              />
              <div className="grid min-w-0 gap-2 sm:grid-cols-[auto_9rem] sm:items-center">
                <label
                  htmlFor="disbursement-voucher-fx-rate"
                  className="whitespace-nowrap text-sm font-semibold text-darknavy"
                >
                  Exchange Rate
                </label>
                <MoneyNumberField
                  id="disbursement-voucher-fx-rate"
                  value={values.fxRate}
                  readOnly={isReadonly}
                  onValueChange={(value) => onUpdateField("fxRate", value)}
                  className={`${FieldClassName} text-right`}
                />
              </div>
            </div>
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-remarks"
            label="Remarks"
            error={errors.remarks}
          >
            <AppLimitedTextarea
              id="disbursement-voucher-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell
            controlId="disbursement-voucher-transaction-no"
            label="Transaction No."
            error={errors.transactionId}
            isRequired
          >
            <input
              id="disbursement-voucher-transaction-no"
              value={transactionNumberValue}
              readOnly={isReadonly}
              onChange={(event) => updateTransactionNumber(event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-document-date"
            label="Document Date"
            error={errors.voucherDate}
            isRequired
          >
            <input
              id="disbursement-voucher-document-date"
              type="date"
              value={values.voucherDate}
              readOnly={isReadonly}
              onChange={(event) =>
                onUpdateField("voucherDate", event.target.value)
              }
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-reference-no"
            label="Reference No"
            error={errors.voucherReferenceNo}
          >
            <input
              id="disbursement-voucher-reference-no"
              value={values.voucherReferenceNo}
              readOnly={isReadonly}
              onChange={(event) =>
                onUpdateField("voucherReferenceNo", event.target.value)
              }
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell
            controlId="disbursement-voucher-status"
            label="Status"
            error={errors.status}
          >
            <input
              id="disbursement-voucher-status"
              value={values.status}
              readOnly
              className={`${FieldClassName} !bg-darknavy/5 text-darknavy/60`}
            />
          </FieldShell>
        </div>
      </div>
      <PaymentTypeDetailsPanel
        bankAccounts={bankAccounts}
        isReadonly={isReadonly}
        paymentType={values.paymentMethod}
        paymentTypeRecord={
          paymentTypeRecords.find(
            (record) => record.paymentType === values.paymentMethod,
          ) ?? null
        }
        values={values}
        onUpdateBankAccount={updateBankAccount}
        onUpdatePaymentDetails={updatePaymentDetails}
      />
      <PartyManagementDrawer
        isOpen={!isReadonly && isPartyDrawerOpen}
        isPending={isPartyMutating}
        records={partyRecords}
        onAddRecord={addPartyRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={(record) => {
          onUpdateField("vceCode", record.partyCodeNo);
          onUpdateField("vceName", getPartyDisplayName(record));
        }}
      />
    </section>
  );
}

function PaymentTypeDetailsPanel({
  bankAccounts,
  isReadonly,
  onUpdateBankAccount,
  onUpdatePaymentDetails,
  paymentType,
  paymentTypeRecord,
  values,
}: {
  bankAccounts: DisbursementVoucherBankAccount[];
  isReadonly: boolean;
  onUpdateBankAccount: (accountCode: string) => void;
  onUpdatePaymentDetails: (
    nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>,
  ) => void;
  paymentType: string;
  paymentTypeRecord: AppPaymentTypeRecord | null;
  values: DisbursementVoucherFormValues;
}) {
  const kind = getPaymentTypeDetailKind(paymentType, paymentTypeRecord);

  if (!paymentType || kind === "" || kind === "cash") {
    return null;
  }

  if (kind === "bank-transfer") {
    return (
      <div className="mt-5 grid min-w-0 gap-x-8 gap-y-4 border-t border-darknavy/10 pt-5 md:grid-cols-2 xl:grid-cols-4">
        <FieldShell controlId="disbursement-voucher-from-bank" label="From Bank" compact>
          <BankAccountSelect
            bankAccounts={bankAccounts}
            id="disbursement-voucher-from-bank"
            isReadonly={isReadonly}
            value={values.paymentDetails.bankAccountCode}
            onChange={onUpdateBankAccount}
          />
        </FieldShell>
        <FieldShell controlId="disbursement-voucher-to-bank" label="To Bank" compact>
          <input
            id="disbursement-voucher-to-bank"
            value={values.paymentDetails.transferToBank ?? ""}
            readOnly={isReadonly}
            onChange={(event) =>
              onUpdatePaymentDetails({ transferToBank: event.target.value })
            }
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell
          controlId="disbursement-voucher-transfer-account-name"
          label="Account Name"
          compact
        >
          <input
            id="disbursement-voucher-transfer-account-name"
            value={values.paymentDetails.transferAccountName ?? ""}
            readOnly={isReadonly}
            onChange={(event) =>
              onUpdatePaymentDetails({ transferAccountName: event.target.value })
            }
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell
          controlId="disbursement-voucher-transfer-account-no"
          label="Account No."
          compact
        >
          <input
            id="disbursement-voucher-transfer-account-no"
            value={values.paymentDetails.transferAccountNo ?? ""}
            readOnly={isReadonly}
            onChange={(event) =>
              onUpdatePaymentDetails({ transferAccountNo: event.target.value })
            }
            className={FieldClassName}
          />
        </FieldShell>
      </div>
    );
  }

  const documentNoLabel = kind === "debit-memo" ? "Debit Memo" : "Check No.";

  return (
    <div className="mt-5 grid min-w-0 gap-x-8 gap-y-4 border-t border-darknavy/10 pt-5 md:grid-cols-2 xl:grid-cols-4">
      <FieldShell controlId="disbursement-voucher-payment-bank" label="Bank" compact>
        <BankAccountSelect
          bankAccounts={bankAccounts}
          id="disbursement-voucher-payment-bank"
          isReadonly={isReadonly}
          value={values.paymentDetails.bankAccountCode}
          onChange={onUpdateBankAccount}
        />
      </FieldShell>
      <FieldShell controlId="disbursement-voucher-payment-payee" label="Payee" compact>
        <input
          id="disbursement-voucher-payment-payee"
          value={values.paymentDetails.payee ?? values.vceName}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ payee: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell
        controlId="disbursement-voucher-payment-document-no"
        label={documentNoLabel}
        compact
      >
        <input
          id="disbursement-voucher-payment-document-no"
          value={values.paymentDetails.checkNo}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ checkNo: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell
        controlId="disbursement-voucher-payment-check-date"
        label="Check Date"
        compact
      >
        <input
          id="disbursement-voucher-payment-check-date"
          type="date"
          value={values.paymentDetails.checkDate || values.voucherDate}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ checkDate: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell
        controlId="disbursement-voucher-payment-check-status"
        label="Check Status"
        compact
      >
        <input
          id="disbursement-voucher-payment-check-status"
          value={values.paymentDetails.checkStatus ?? ""}
          readOnly
          className={`${FieldClassName} bg-darknavy/5 text-darknavy/55`}
        />
      </FieldShell>
      <FieldShell
        controlId="disbursement-voucher-payment-commission"
        label="Commission"
        compact
      >
        <input
          id="disbursement-voucher-payment-commission"
          value={values.paymentDetails.commission ?? ""}
          readOnly
          className={`${FieldClassName} bg-darknavy/5 text-darknavy/55`}
        />
      </FieldShell>
    </div>
  );
}

function BankAccountSelect({
  bankAccounts,
  id,
  isReadonly,
  onChange,
  value,
}: {
  bankAccounts: DisbursementVoucherBankAccount[];
  id?: string;
  isReadonly: boolean;
  onChange: (accountCode: string) => void;
  value: string;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={isReadonly}
      onChange={(event) => onChange(event.target.value)}
      className={FieldClassName}
    >
      <option value="">--Select Bank--</option>
      {bankAccounts.map((bankAccount) => (
        <option key={bankAccount.id} value={bankAccount.accountCode}>
          {bankAccount.bankName} - {bankAccount.accountNo}
        </option>
      ))}
    </select>
  );
}

function getPaymentTypeDetailKind(
  paymentType: string,
  paymentTypeRecord?: AppPaymentTypeRecord | null,
) {
  if (paymentTypeRecord?.type === "Cash") {
    return "cash";
  }

  if (paymentTypeRecord?.type === "Check") {
    return "with-bank";
  }

  if (paymentTypeRecord?.type === "Bank Transfer") {
    return "bank-transfer";
  }

  if (paymentTypeRecord?.type === "Digital Wallet") {
    return "bank-transfer";
  }

  if (paymentTypeRecord?.type === "Non-Cash Settlement") {
    return "debit-memo";
  }

  const normalizedPaymentType = paymentType.trim().toLowerCase();

  if (!normalizedPaymentType) {
    return "";
  }

  if (
    normalizedPaymentType.includes("bank transfer") ||
    normalizedPaymentType.includes("wire") ||
    normalizedPaymentType === "transfer"
  ) {
    return "bank-transfer";
  }

  if (
    normalizedPaymentType.includes("debit memo") ||
    normalizedPaymentType.includes("debit")
  ) {
    return "debit-memo";
  }

  if (normalizedPaymentType.includes("check")) {
    return "with-bank";
  }

  if (
    normalizedPaymentType.includes("instapay") ||
    normalizedPaymentType.includes("pesonet") ||
    normalizedPaymentType.includes("peso net") ||
    normalizedPaymentType.includes("ewallet") ||
    normalizedPaymentType.includes("e-wallet") ||
    normalizedPaymentType.includes("wallet") ||
    normalizedPaymentType.includes("online")
  ) {
    return "bank-transfer";
  }

  if (
    normalizedPaymentType === "cash" ||
    normalizedPaymentType.includes("g-cash")
  ) {
    return "cash";
  }

  return "";
}

function FieldShell({
  children,
  compact = false,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  compact?: boolean;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  if (compact) {
    return (
      <div className="grid min-w-0 gap-2">
        {controlId ? (
          <label htmlFor={controlId} className="text-sm font-semibold text-darknavy">
            {labelContent}
          </label>
        ) : (
          <span className="text-sm font-semibold text-darknavy">
            {labelContent}
          </span>
        )}
        {children}
        {error ? (
          <span className="text-xs font-medium text-coralpink">{error}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label
          htmlFor={controlId}
          className="pt-2 text-sm font-semibold text-darknavy"
        >
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </span>
      )}
      <div className="min-w-0">
        {children}
        {error ? (
          <span className="mt-1.5 block text-xs font-semibold text-coralpink">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const FieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

const AttachedDropdownClassName =
  "sm:[&_.app-advanced-dropdown-control]:rounded-r-none";

const AttachedAddButtonClassName =
  "inline-flex h-11 w-20 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none";

type DisbursementEntryColumnId =
  | "accountCode"
  | "atcCode"
  | "accountName"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refId"
  | "responsibilityCenter"
  | "taxRate"
  | "vatType"
  | "debit"
  | "credit";

type DisbursementEntryView = "accounting" | "expense";

type ExpenseEntryColumnId =
  | "expenseType"
  | "amount"
  | "netAmount"
  | "vatCode"
  | "vatPercent"
  | "vatAmount"
  | "ewtCode"
  | "ewtPercent"
  | "ewtAmount"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refId";

const DefaultExpenseEntryColumnOrder: ExpenseEntryColumnId[] = [
  "expenseType",
  "amount",
  "netAmount",
  "vatCode",
  "vatPercent",
  "vatAmount",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "partyCode",
  "partyName",
  "particulars",
  "refId",
];

const DefaultVisibleExpenseEntryColumnOrder =
  DefaultExpenseEntryColumnOrder.filter(
    (columnId): columnId is ExpenseEntryColumnId => columnId !== "partyCode",
  );

const ProtectedExpenseEntryColumnIds = new Set<ExpenseEntryColumnId>([
  "expenseType",
  "amount",
]);

const ExpenseEntryColumnLabels: Record<ExpenseEntryColumnId, string> = {
  expenseType: "Expense Type",
  amount: "Amount",
  netAmount: "Net Amount",
  vatCode: "VAT",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  ewtCode: "EWT",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  refId: "Reference No.",
};

const DefaultExpenseEntryColumnWidths: Record<ExpenseEntryColumnId, number> = {
  expenseType: 235,
  amount: 155,
  netAmount: 145,
  vatCode: 190,
  vatPercent: 105,
  vatAmount: 135,
  ewtCode: 210,
  ewtPercent: 105,
  ewtAmount: 135,
  partyCode: 150,
  partyName: 260,
  particulars: 320,
  refId: 180,
};

const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "taxRate",
  "particulars",
  "partyCode",
  "partyName",
  "responsibilityCenter",
  "refId",
  "vatType",
  "atcCode",
];

const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountName",
  "debit",
  "credit",
  "taxRate",
  "particulars",
];

const ProtectedDisbursementEntryColumnIds = new Set<DisbursementEntryColumnId>([
  "accountName",
  "debit",
  "credit",
]);

const DisbursementEntryColumnLabels: Record<DisbursementEntryColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Title",
  atcCode: "ATC Code",
  particulars: "Particulars",
  partyCode: "Party Code",
  partyName: "Party Name",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  taxRate: "Tax",
  vatType: "VAT Type",
  debit: "Debit",
  credit: "Credit",
};

const DefaultDisbursementEntryColumnWidths: Record<
  DisbursementEntryColumnId,
  number
> = {
  accountCode: 150,
  accountName: 260,
  atcCode: 150,
  credit: 160,
  debit: 160,
  particulars: 320,
  partyCode: 150,
  partyName: 260,
  refId: 180,
  responsibilityCenter: 260,
  taxRate: 160,
  vatType: 150,
};

const AccountingPartyFallbackValuePrefix = "entry-party:";
const CashInHandAccountCode = "1001111";
const CashInHandAccountName = "Cash in Hand";

function getAccountingPartyFallbackValue(partyName: string) {
  const normalizedPartyName = partyName.trim().toLowerCase();

  return normalizedPartyName
    ? `${AccountingPartyFallbackValuePrefix}${normalizedPartyName}`
    : "";
}

function isDisbursementEntryColumnId(
  columnId: string,
): columnId is DisbursementEntryColumnId {
  return DefaultDisbursementEntryColumnOrder.includes(
    columnId as DisbursementEntryColumnId,
  );
}

function isExpenseEntryColumnId(columnId: string): columnId is ExpenseEntryColumnId {
  return DefaultExpenseEntryColumnOrder.includes(columnId as ExpenseEntryColumnId);
}

function isCashInHandEntry(entry: DisbursementLineEntry) {
  return (
    entry.accountCode === CashInHandAccountCode ||
    entry.accountName.trim().toLowerCase() === CashInHandAccountName.toLowerCase()
  );
}

function isPaymentCreditEntry(entry: DisbursementLineEntry) {
  return (
    isCashInHandEntry(entry) ||
    entry.id.startsWith("payment-credit-") ||
    entry.id.startsWith("cash-in-hand-")
  );
}

function createCashExpenseBalancedEntries(
  entries: DisbursementLineEntry[],
  entryId: string,
  updates: Partial<DisbursementLineEntry>,
) {
  const updatedEntries = entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    const nextEntry = normalizeDisbursementLineEntryFields({
      ...entry,
      ...updates,
      credit: 0,
    });
    const debitAmount = Number(nextEntry.debit || 0);

    nextEntry.debit = debitAmount;
    nextEntry.credit = 0;
    return syncDisbursementLineEntryTaxDetails(nextEntry);
  });
  return createPaymentBalancedEntries(updatedEntries, {
    accountCode: CashInHandAccountCode,
    accountName: CashInHandAccountName,
    particulars: "Cash payment",
  });
}

function createPaymentBalancedEntries(
  entries: DisbursementLineEntry[],
  creditAccount: {
    accountCode: string;
    accountName: string;
    particulars: string;
  },
) {
  const expenseEntries = entries.filter((entry) => !isPaymentCreditEntry(entry));
  const paymentEntry = entries.find(isPaymentCreditEntry);
  const totalExpenseAmount = expenseEntries.reduce(
    (sum, entry) => sum + Number(entry.debit || 0),
    0,
  );

  if (totalExpenseAmount <= 0) {
    return expenseEntries;
  }

  const referenceEntry = expenseEntries.find((entry) => entry.debit > 0) ?? expenseEntries[0];

  return [
    ...expenseEntries,
    syncDisbursementLineEntryTaxDetails({
      ...(paymentEntry ?? createBlankDisbursementLineEntry()),
      accountCode: creditAccount.accountCode,
      accountName: creditAccount.accountName,
      credit: totalExpenseAmount,
      debit: 0,
      id:
        paymentEntry?.id ??
        `payment-credit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      particulars: referenceEntry?.particulars || creditAccount.particulars,
      partyCode: referenceEntry?.partyCode ?? "",
      partyName: referenceEntry?.partyName ?? "",
      refId: referenceEntry?.refId ?? "",
      responsibilityCenter: referenceEntry?.responsibilityCenter ?? "",
      status: "Balanced",
      taxDetails: {
        ...createTaxDetails(totalExpenseAmount, "0%"),
        refId: referenceEntry?.refId ?? "",
        responsibilityCenter: referenceEntry?.responsibilityCenter ?? "",
      },
      taxRate: "0%",
      vatType: "",
    }),
  ];
}

function VoucherDataEntry({
  defaultAccounts,
  entries,
  errors,
  isReadonly,
  onAddEntries,
  onAddDisbursementType,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onReplaceEntries,
  onUpdateEntry,
  onUpdateEntryFields,
  paymentMethod,
  paymentTypeRecord,
  totalCredit,
  totalDebit,
  onRemoveEntry,
}: {
  defaultAccounts: DefaultAccount[];
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  onAddEntries: (count: number) => void;
  onAddDisbursementType: () => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onReplaceEntries: (entries: DisbursementLineEntry[]) => void;
  onUpdateEntry: (
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) => void;
  onUpdateEntryFields: (
    entryId: string,
    updates: Partial<DisbursementLineEntry>,
  ) => void;
  paymentMethod: string;
  paymentTypeRecord: AppPaymentTypeRecord | null;
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
}) {
  const variance = Math.abs(totalDebit - totalCredit);
  const partyRecords = usePartyManagementStore((state) => state.records);
  const responsibilityCenters = useResponsibilityCenterStore(
    (state) => state.centers,
  );
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<
    string | null
  >(null);
  const [entryView, setEntryView] =
    useState<DisbursementEntryView>("expense");
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);
  const [columnOrder, setColumnOrder] = useState<DisbursementEntryColumnId[]>(
    DefaultDisbursementEntryColumnOrder,
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    DisbursementEntryColumnId[]
  >(DefaultVisibleDisbursementEntryColumnOrder);
  const [columnWidths, setColumnWidths] = useState(
    DefaultDisbursementEntryColumnWidths,
  );
  const [columnLabels, setColumnLabels] = useState(DisbursementEntryColumnLabels);
  const [expenseColumnOrder, setExpenseColumnOrder] = useState<
    ExpenseEntryColumnId[]
  >(DefaultExpenseEntryColumnOrder);
  const [visibleExpenseColumnIds, setVisibleExpenseColumnIds] = useState<
    ExpenseEntryColumnId[]
  >(DefaultVisibleExpenseEntryColumnOrder);
  const [expenseColumnWidths, setExpenseColumnWidths] = useState(
    DefaultExpenseEntryColumnWidths,
  );
  const [expenseColumnLabels, setExpenseColumnLabels] = useState(
    ExpenseEntryColumnLabels,
  );
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const visibleExpenseColumnOrder = expenseColumnOrder.filter((columnId) =>
    visibleExpenseColumnIds.includes(columnId),
  );
  const chartAccounts = useMemo(
    () => createAccountingChartAccountOptions(entries),
    [entries],
  );
  const expenseAccounts = useMemo(
    () => createDefaultAccountExpenseOptions(defaultAccounts),
    [defaultAccounts],
  );
  const expenseRows = useMemo(
    () => entries.filter((entry) => !isPaymentCreditEntry(entry)),
    [entries],
  );
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => {
      const options = partyRecords.map((party) => ({
        description: party.partyTypes.join(", "),
        label: party.partyCodeNo,
        name: getPartyDisplayName(party),
        value: party.partyCodeNo,
      }));
      const optionNames = new Set(
        options.map((option) => option.name.toLowerCase()),
      );
      const customValues = new Set(options.map((option) => option.value));
      const customOptions: AppAdvancedDropdownOption[] = [];

      entries.forEach((entry) => {
        const partyName = (entry.partyName ?? "").trim();
        const value = getAccountingPartyFallbackValue(partyName);

        if (
          !partyName ||
          optionNames.has(partyName.toLowerCase()) ||
          customValues.has(value)
        ) {
          return;
        }

        customValues.add(value);
        customOptions.push({
          description: "Copied entry party",
          label: entry.partyCode ?? "",
          name: partyName,
          value,
        });
      });

      return [...options, ...customOptions];
    },
    [entries, partyRecords],
  );
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => {
      const options = responsibilityCenters
        .filter((center) => center.status === "Active")
        .map((center) => ({
          description: `${center.category} / ${center.financialType}`,
          label: center.code,
          name: center.name,
          value: center.code,
        }));
      const optionValues = new Set(options.map((option) => option.value));
      const customOptions: AppAdvancedDropdownOption[] = [];

      entries.forEach((entry) => {
        const responsibilityCenter = (entry.responsibilityCenter ?? "").trim();

        if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
          return;
        }

        optionValues.add(responsibilityCenter);
        customOptions.push({
          description: "Copied responsibility center",
          label: responsibilityCenter,
          name: responsibilityCenter,
          value: responsibilityCenter,
        });
      });

      return [...options, ...customOptions];
    },
    [entries, responsibilityCenters],
  );
  const particularsEditorEntry =
    entries.find((entry) => entry.id === particularsEditorEntryId) ?? null;

  const updateExpenseEntryFields = useCallback((
    entryId: string,
    updates: Partial<DisbursementLineEntry>,
  ) => {
    const isCashPayment =
      paymentTypeRecord?.type === "Cash" ||
      paymentMethod.trim().toLowerCase() === "cash";

    if (!isCashPayment) {
      onUpdateEntryFields(entryId, updates);
      return;
    }

    onReplaceEntries(createCashExpenseBalancedEntries(entries, entryId, updates));
  }, [
    entries,
    onReplaceEntries,
    onUpdateEntryFields,
    paymentMethod,
    paymentTypeRecord?.type,
  ]);

  const allColumns = useMemo<
    Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>
  >(
    () => ({
      accountCode: {
        header: columnLabels.accountCode,
        id: "accountCode",
        width: columnWidths.accountCode,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.accountCode ?? ""}
            onChange={() => undefined}
            readOnly
          />
        ),
      },
      accountName: {
        header: columnLabels.accountName,
        id: "accountName",
        width: columnWidths.accountName,
        widthClassName: "w-[18rem]",
        renderCell: (entry) => (
          <ChartAccountDropdown
            accounts={chartAccounts}
            value={entry.accountName}
            valueField="accountName"
            readOnly={isReadonly}
            isClearable
            className={AccountingDropdownClassName}
            placeholder="Select account title"
            searchPlaceholder="Search account title"
            onChange={() => undefined}
            onSelectAccount={(account) =>
              onUpdateEntryFields(entry.id, {
                accountCode: account?.accountNumber ?? "",
                accountName: account?.accountName ?? "",
              })
            }
          />
        ),
      },
      debit: {
        header: columnLabels.debit,
        id: "debit",
        width: columnWidths.debit,
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.debit}
            onChange={(value) => onUpdateEntry(entry.id, "debit", value)}
            disabled={isReadonly || parseMoneyNumberInput(entry.credit) > 0}
          />
        ),
      },
      credit: {
        header: columnLabels.credit,
        id: "credit",
        width: columnWidths.credit,
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.credit}
            onChange={(value) => onUpdateEntry(entry.id, "credit", value)}
            disabled={isReadonly || parseMoneyNumberInput(entry.debit) > 0}
          />
        ),
      },
      taxRate: {
        header: columnLabels.taxRate,
        id: "taxRate",
        width: columnWidths.taxRate,
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <div className={joinClasses(
            accountingCellControlClassName(),
            "flex items-center gap-2 bg-offwhite/45 text-darknavy/70",
          )}>
            <Percent className="h-4 w-4 shrink-0 text-darknavy/45" />
            <span className="truncate">
              {formatTaxRateSummary(entry.taxDetails) || "No tax"}
            </span>
          </div>
        ),
      },
      particulars: {
        header: columnLabels.particulars,
        id: "particulars",
        width: columnWidths.particulars,
        widthClassName: "w-[22rem]",
        renderCell: (entry) => (
          <ParticularsCell
            entry={entry}
            isReadonly={isReadonly}
            onOpen={() => setParticularsEditorEntryId(entry.id)}
            onUpdate={(value) =>
              onUpdateEntry(entry.id, "particulars", value)
            }
          />
        ),
      },
      partyCode: {
        header: columnLabels.partyCode,
        id: "partyCode",
        width: columnWidths.partyCode,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.partyCode ?? ""}
            onChange={() => undefined}
            readOnly
          />
        ),
      },
      partyName: {
        header: columnLabels.partyName,
        id: "partyName",
        width: columnWidths.partyName,
        widthClassName: "w-[18rem]",
        renderCell: (entry) => (
          <AppAdvancedDropdown
            value={
              entry.partyCode ||
              getAccountingPartyFallbackValue(entry.partyName ?? "")
            }
            readOnly={isReadonly}
            options={partyOptions}
            placeholder="Select Party Name"
            searchPlaceholder="Search Party Name"
            className={AccountingDropdownClassName}
            onChange={(value) => {
              const selectedValue = String(value);
              const party = partyOptions.find(
                (option) => option.value === selectedValue,
              );
              const isFallbackValue = selectedValue.startsWith(
                AccountingPartyFallbackValuePrefix,
              );

              onUpdateEntryFields(entry.id, {
                partyCode: isFallbackValue ? "" : selectedValue,
                partyName: party?.name ?? "",
              });
            }}
          />
        ),
      },
      responsibilityCenter: {
        header: columnLabels.responsibilityCenter,
        id: "responsibilityCenter",
        width: columnWidths.responsibilityCenter,
        widthClassName: "w-[18rem]",
        renderCell: (entry) => (
          <AppAdvancedDropdown
            value={entry.responsibilityCenter ?? ""}
            readOnly={isReadonly}
            options={responsibilityCenterOptions}
            placeholder="Select responsibility center"
            searchPlaceholder="Search responsibility center"
            className={AccountingDropdownClassName}
            onChange={(value) =>
              onUpdateEntry(entry.id, "responsibilityCenter", String(value))
            }
          />
        ),
      },
      refId: {
        header: columnLabels.refId,
        id: "refId",
        width: columnWidths.refId,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.refId ?? ""}
            onChange={(value) => onUpdateEntry(entry.id, "refId", value)}
            disabled={isReadonly}
          />
        ),
      },
      vatType: {
        header: columnLabels.vatType,
        id: "vatType",
        width: columnWidths.vatType,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.vatType ?? ""}
            onChange={(value) => onUpdateEntry(entry.id, "vatType", value)}
            disabled={isReadonly}
          />
        ),
      },
      atcCode: {
        header: columnLabels.atcCode,
        id: "atcCode",
        width: columnWidths.atcCode,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.atcCode ?? ""}
            onChange={(value) => onUpdateEntry(entry.id, "atcCode", value)}
            disabled={isReadonly}
          />
        ),
      },
    }),
    [
      chartAccounts,
      columnLabels,
      columnWidths,
      isReadonly,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
      responsibilityCenterOptions,
      setParticularsEditorEntryId,
    ],
  );
  const columns = useMemo<ModuleDataEntryColumn<DisbursementLineEntry>[]>(
    () => visibleColumnOrder.map((columnId) => allColumns[columnId]),
    [allColumns, visibleColumnOrder],
  );
  const allExpenseColumns = useMemo<
    Record<ExpenseEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>
  >(
    () => ({
      expenseType: {
        header: expenseColumnLabels.expenseType,
        id: "expenseType",
        width: expenseColumnWidths.expenseType,
        widthClassName: "w-[15rem]",
        renderCell: (entry) => (
          <ChartAccountDropdown
            addAction={{
              label: "Add Disbursement Type",
              onClick: onAddDisbursementType,
            }}
            accounts={expenseAccounts}
            value={entry.accountName}
            valueField="accountName"
            readOnly={isReadonly}
            isClearable
            className={AccountingDropdownClassName}
            placeholder="Enter expense type"
            searchPlaceholder="Search expense type"
            onChange={() => undefined}
            onSelectAccount={(account) =>
              updateExpenseEntryFields(entry.id, {
                accountCode: account?.accountNumber ?? "",
                accountName: account?.accountName ?? "",
              })
            }
          />
        ),
      },
      amount: {
        header: expenseColumnLabels.amount,
        id: "amount",
        width: expenseColumnWidths.amount,
        widthClassName: "w-[10rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.taxDetails.grossAmount}
            onChange={(value) =>
              updateExpenseEntryFields(entry.id, {
                credit: 0,
                debit: value,
                taxDetails: syncTaxDetailsAmount(
                  entry.taxDetails,
                  value,
                  entry.taxRate,
                ),
              })
            }
            disabled={isReadonly}
          />
        ),
      },
      netAmount: {
        header: expenseColumnLabels.netAmount,
        id: "netAmount",
        width: expenseColumnWidths.netAmount,
        widthClassName: "w-[9rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.netAmount} />
        ),
      },
      vatCode: {
        header: expenseColumnLabels.vatCode,
        id: "vatCode",
        width: expenseColumnWidths.vatCode,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <AppAdvancedDropdown
            value={normalizeVatDropdownValue(entry.taxDetails, taxCodes)}
            readOnly={isReadonly}
            isClearable
            options={vatOptions}
            placeholder="Select VAT"
            searchPlaceholder="Search VAT rate or description"
            className={AccountingDropdownClassName}
            onChange={(value) => {
              const vatCode = String(value);
              const taxRate = getVatRateFromCode(vatCode, taxCodes);

              updateExpenseEntryFields(entry.id, {
                taxRate,
                taxDetails: syncTaxDetailsAmount(
                  {
                    ...entry.taxDetails,
                    vatCode,
                    vatPercent: getVatPercentFromRate(taxRate),
                  },
                  entry.taxDetails.grossAmount,
                  taxRate,
                ),
              });
            }}
          />
        ),
      },
      vatPercent: {
        header: expenseColumnLabels.vatPercent,
        id: "vatPercent",
        width: expenseColumnWidths.vatPercent,
        widthClassName: "w-[7rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.vatPercent} suffix="%" />
        ),
      },
      vatAmount: {
        header: expenseColumnLabels.vatAmount,
        id: "vatAmount",
        width: expenseColumnWidths.vatAmount,
        widthClassName: "w-[9rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.vatAmount} />
        ),
      },
      ewtCode: {
        header: expenseColumnLabels.ewtCode,
        id: "ewtCode",
        width: expenseColumnWidths.ewtCode,
        widthClassName: "w-[13rem]",
        renderCell: (entry) => (
          <AppAdvancedDropdown
            value={entry.taxDetails.ewtCode}
            readOnly={isReadonly}
            isClearable
            options={ewtOptions}
            placeholder="Select EWT"
            searchPlaceholder="Search EWT code, rate, or description"
            className={AccountingDropdownClassName}
            onChange={(value) => {
              const ewtCode = String(value);

              updateExpenseEntryFields(entry.id, {
                taxDetails: syncTaxDetailsAmount(
                  {
                    ...entry.taxDetails,
                    ewtCode,
                    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
                  },
                  entry.taxDetails.grossAmount,
                  entry.taxRate,
                ),
              });
            }}
          />
        ),
      },
      ewtPercent: {
        header: expenseColumnLabels.ewtPercent,
        id: "ewtPercent",
        width: expenseColumnWidths.ewtPercent,
        widthClassName: "w-[7rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.ewtPercent} suffix="%" />
        ),
      },
      ewtAmount: {
        header: expenseColumnLabels.ewtAmount,
        id: "ewtAmount",
        width: expenseColumnWidths.ewtAmount,
        widthClassName: "w-[9rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.ewtAmount} />
        ),
      },
      partyName: {
        ...allColumns.partyName,
        header: expenseColumnLabels.partyName,
        id: "partyName",
        width: expenseColumnWidths.partyName,
      },
      partyCode: {
        ...allColumns.partyCode,
        header: expenseColumnLabels.partyCode,
        id: "partyCode",
        width: expenseColumnWidths.partyCode,
      },
      particulars: {
        ...allColumns.particulars,
        header: expenseColumnLabels.particulars,
        id: "particulars",
        width: expenseColumnWidths.particulars,
      },
      refId: {
        ...allColumns.refId,
        header: expenseColumnLabels.refId,
        id: "refId",
        width: expenseColumnWidths.refId,
      },
    }),
    [
      allColumns,
      ewtOptions,
      expenseColumnLabels,
      expenseColumnWidths,
      expenseAccounts,
      isReadonly,
      onAddDisbursementType,
      taxCodes,
      updateExpenseEntryFields,
      vatOptions,
    ],
  );
  const expenseColumns = useMemo<
    ModuleDataEntryColumn<DisbursementLineEntry>[]
  >(
    () => visibleExpenseColumnOrder.map((columnId) => allExpenseColumns[columnId]),
    [allExpenseColumns, visibleExpenseColumnOrder],
  );
  const activeColumns =
    entryView === "expense" ? expenseColumns : columns;
  const activeRows = entryView === "expense" ? expenseRows : entries;
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !ProtectedDisbursementEntryColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: columnWidths[columnId],
        widthMode: "fixed",
      })),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const expenseColumnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      expenseColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !ProtectedExpenseEntryColumnIds.has(columnId),
        isVisible: visibleExpenseColumnIds.includes(columnId),
        label: expenseColumnLabels[columnId],
        width: expenseColumnWidths[columnId],
        widthMode: "fixed",
      })),
    [
      expenseColumnLabels,
      expenseColumnOrder,
      expenseColumnWidths,
      visibleExpenseColumnIds,
    ],
  );

  function updateColumnHeader(columnId: string, header: string) {
    if (entryView === "expense" && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnLabels((currentLabels) => ({
        ...currentLabels,
        [columnId]: header,
      }));
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (entryView === "expense" && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (entryView === "expense" && isExpenseEntryColumnId(columnId)) {
      updateColumnWidth(
        columnId,
        estimateDisbursementEntryTextWidth(expenseColumnLabels[columnId], 76),
      );
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateDisbursementEntryColumnFitWidth({
        columnId,
        columnLabels,
        entries,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (
      entryView === "expense" &&
      isExpenseEntryColumnId(fromColumnId) &&
      isExpenseEntryColumnId(toColumnId)
    ) {
      setExpenseColumnOrder((currentOrder) =>
        moveEntryColumn(currentOrder, fromColumnId, toColumnId),
      );
      return;
    }

    if (!isDisbursementEntryColumnId(fromColumnId) || !isDisbursementEntryColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) =>
      moveEntryColumn(currentOrder, fromColumnId, toColumnId),
    );
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (entryView === "expense" && isExpenseEntryColumnId(columnId)) {
      if (!isVisible && ProtectedExpenseEntryColumnIds.has(columnId)) {
        return;
      }

      setVisibleExpenseColumnIds((currentVisibleIds) =>
        updateVisibleEntryColumns(
          currentVisibleIds,
          expenseColumnOrder,
          columnId,
          isVisible,
        ),
      );
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedDisbursementEntryColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) =>
      updateVisibleEntryColumns(
        currentVisibleIds,
        columnOrder,
        columnId,
        isVisible,
      ),
    );
  }

  return (
    <section className="min-w-0">
      <div className="min-w-0">
        <ModuleDataEntry
          columns={activeColumns}
          description=""
          emptyRowLabel="entry"
          error={errors.lineEntries}
          columnOptions={
            entryView === "expense" ? expenseColumnOptions : columnOptions
          }
          summaryCells={
            entryView === "accounting"
              ? {
                credit: formatAccountingAmount(totalCredit),
                debit: formatAccountingAmount(totalDebit),
              }
              : undefined
          }
          footerDetails={
            <span
              className={joinClasses(
                "text-sm font-semibold",
                variance < 0.001 ? "text-emerald-700" : "text-coralpink",
              )}
            >
              Variance: {formatAccountingAmount(variance)}
            </span>
          }
          isDraggable
          isReadonly={isReadonly}
          rows={activeRows}
          title={
            <div
              role="tablist"
              aria-label="Entry view"
              className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
            >
              {([
                ["expense", "Expense Details"],
                ["accounting", "Accounting Entries"],
              ] as const).map(([view, label]) => {
                const isActive = entryView === view;

                return (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setEntryView(view)}
                    className={joinClasses(
                      "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
                      isActive
                        ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                        : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          }
          onAddRows={onAddEntries}
          onAutoColumnWidth={fitColumnWidth}
          onClearRows={onClearEntries}
          onDuplicateRow={onDuplicateEntry}
          onFitColumnWidth={fitColumnWidth}
          onInsertRow={onInsertEntry}
          onMoveColumn={moveColumn}
          onMoveRow={onMoveEntry}
          onRemoveRow={onRemoveEntry}
          onToggleColumnVisibility={toggleColumnVisibility}
          onUpdateColumnHeader={updateColumnHeader}
          onUpdateColumnWidth={updateColumnWidth}
        />

      </div>
      <ParticularsEditorDialog
        key={particularsEditorEntry?.id ?? "closed"}
        entry={particularsEditorEntry}
        isReadonly={isReadonly}
        onClose={() => setParticularsEditorEntryId(null)}
        onSave={(value) => {
          if (!particularsEditorEntry) {
            return;
          }

          onUpdateEntry(particularsEditorEntry.id, "particulars", value);
          setParticularsEditorEntryId(null);
        }}
      />
    </section>
  );
}

const AccountingDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function EntryInput({
  disabled = false,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      className={accountingCellControlClassName()}
    />
  );
}

function ExpenseDetailValue({
  suffix = "",
  value,
}: {
  suffix?: string;
  value: number;
}) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      {suffix}
    </div>
  );
}

function ParticularsCell({
  entry,
  isReadonly,
  onOpen,
  onUpdate,
}: {
  entry: DisbursementLineEntry;
  isReadonly: boolean;
  onOpen: () => void;
  onUpdate: (value: string) => void;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
      <EntryInput
        value={entry.particulars}
        onChange={onUpdate}
        readOnly={isReadonly}
      />
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
        aria-label="Open particulars"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ParticularsEditorDialog({
  entry,
  isReadonly,
  onClose,
  onSave,
}: {
  entry: DisbursementLineEntry | null;
  isReadonly: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  return (
    <ModuleTextareaDialog
      isOpen={Boolean(entry)}
      isReadonly={isReadonly}
      title="Particulars"
      subtitle={entry?.accountName || "Accounting entry"}
      textareaId="disbursement-entry-particulars-dialog-text"
      value={entry?.particulars ?? ""}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function getDisbursementEntryExportCell(
  entry: DisbursementLineEntry,
  columnId: DisbursementEntryColumnId,
) {
  switch (columnId) {
    case "accountCode":
      return entry.accountCode ?? "";
    case "accountName":
      return entry.accountName ?? "";
    case "atcCode":
      return entry.atcCode ?? "";
    case "particulars":
      return entry.particulars ?? "";
    case "partyCode":
      return entry.partyCode ?? "";
    case "partyName":
      return entry.partyName ?? "";
    case "refId":
      return entry.refId ?? "";
    case "responsibilityCenter":
      return entry.responsibilityCenter ?? "";
    case "taxRate":
      return formatTaxRateSummary(entry.taxDetails);
    case "vatType":
      return entry.vatType ?? "";
    case "debit":
      return String(entry.debit || "");
    case "credit":
      return String(entry.credit || "");
    default:
      return "";
  }
}

function moveEntryColumn<TColumnId extends string>(
  currentOrder: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
) {
  const fromIndex = currentOrder.indexOf(fromColumnId);
  const toIndex = currentOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return currentOrder;
  }

  const nextOrder = [...currentOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

function updateVisibleEntryColumns<TColumnId extends string>(
  currentVisibleIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

    return columnOrder.filter((currentColumnId) =>
      nextVisibleIds.has(currentColumnId),
    );
  }

  if (currentVisibleIds.length <= 1) {
    return currentVisibleIds;
  }

  return currentVisibleIds.filter(
    (currentColumnId) => currentColumnId !== columnId,
  );
}

function calculateDisbursementEntryColumnFitWidth({
  columnId,
  columnLabels,
  entries,
}: {
  columnId: DisbursementEntryColumnId;
  columnLabels: Record<DisbursementEntryColumnId, string>;
  entries: DisbursementLineEntry[];
}) {
  const headerWidth = estimateDisbursementEntryTextWidth(
    columnLabels[columnId],
    76,
  );
  const contentWidth = entries.reduce(
    (currentWidth, entry) =>
      Math.max(
        currentWidth,
        estimateDisbursementEntryTextWidth(
          String(getDisbursementEntryExportCell(entry, columnId) ?? ""),
          24,
        ),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateDisbursementEntryTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

function EntryNumberInput({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing
    ? draftValue
    : value > 0
      ? formatMoneyNumberInput(String(value))
      : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <MoneyNumberField
      value={displayValue}
      onValueChange={handleValueChange}
      onFocus={() => {
        setDraftValue(displayValue);
        setIsEditing(true);
      }}
      onBlur={() => {
        setDraftValue("");
        setIsEditing(false);
      }}
      disabled={disabled}
      className={accountingCellControlClassName("text-right")}
    />
  );
}

function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function formatAccountingAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shouldClearEntry(
  entry: DisbursementLineEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return disbursementEntryHasData(entry);
  }

  if (action === "incomplete") {
    return disbursementEntryHasData(entry) && !disbursementEntryIsComplete(entry);
  }

  return !disbursementEntryHasData(entry);
}

function disbursementEntryHasData(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountName.trim() !== "" ||
    (entry.partyCode ?? "").trim() !== "" ||
    (entry.partyName ?? "").trim() !== "" ||
    (entry.responsibilityCenter ?? "").trim() !== "" ||
    (entry.refId ?? "").trim() !== "" ||
    (entry.vatType ?? "").trim() !== "" ||
    (entry.atcCode ?? "").trim() !== "" ||
    entry.particulars.trim() !== "" ||
    parseMoneyNumberInput(entry.debit) > 0 ||
    parseMoneyNumberInput(entry.credit) > 0 ||
    entry.taxRate !== "0%"
  );
}

function disbursementEntryIsComplete(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" &&
    entry.accountName.trim() !== "" &&
    (parseMoneyNumberInput(entry.debit) > 0 ||
      parseMoneyNumberInput(entry.credit) > 0) &&
    !(parseMoneyNumberInput(entry.debit) > 0 &&
      parseMoneyNumberInput(entry.credit) > 0)
  );
}
