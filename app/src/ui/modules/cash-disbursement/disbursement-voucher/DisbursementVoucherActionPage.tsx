"use client";

import {
  Suspense,
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
  Percent,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
  DisbursementVoucherBankAccounts,
  applyCopyFromRecordToDisbursementVoucherForm,
  createTaxDetails,
  createDisbursementTransactionFromForm,
  createDisbursementVoucherFormValues,
  createDisbursementVoucherFromForm,
  formatTaxRateSummary,
  syncTaxDetailsAmount,
  updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { GlobalReferenceModuleOptions } from "@/app/src/constants/shared/module/ReferenceModuleConstants";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/payment-type/usePaymentType";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import {
  getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import {
  MockMultiCurrencySetupRecords,
  MultiCurrencyCatalog,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  AppTaxRateDialog,
  type AppTaxRateDialogValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { PartyManagementDrawer } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer";
import type { AppDisbursementTypeRecord } from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import type {
  DisbursementType,
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionHeader";
import {
  clearAccountingGridSession,
  readAccountingGridSession,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/AccountingGridSession";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherNotFound";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
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

const ReferenceModuleDropdownOptions: AppAdvancedDropdownOption[] =
  GlobalReferenceModuleOptions.filter((option) => option !== "").map(
    (option) => ({
      name: option,
      value: option,
    }),
  );

export function DisbursementVoucherActionPage() {
  return (
    <Suspense fallback={<VoucherWorkflowSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

type TaxEditorTarget =
  { kind: "entry"; entryId: string }
  | { kind: "voucher" }
  | null;

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
  const addVoucher = useDisbursementVoucherStore((state) => state.addVoucher);
  const updateVoucher = useDisbursementVoucherStore(
    (state) => state.updateVoucher,
  );
  const deleteVoucher = useDisbursementVoucherStore(
    (state) => state.deleteVoucher,
  );
  const isMutating = useDisbursementVoucherStore((state) => state.isMutating);
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
    readAccountingGridSession()?.values ??
      createDisbursementVoucherFormValues(routeTransaction, routeVoucher),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const paymentTypeStore = usePaymentTypeStore();
  const paymentTypeRecords = paymentTypeStore.paymentTypes;
  const [disbursementTypeRecords, setDisbursementTypeRecords] = useState(
    InitialDisbursementTypeRecords,
  );
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] =
    useState(false);
  const [taxEditorTarget, setTaxEditorTarget] = useState<TaxEditorTarget>(null);
  const [taxEditorValues, setTaxEditorValues] =
    useState<AppTaxRateDialogValue | null>(null);
  const isReadonly = mode === "view";

  useEffect(() => {
    clearAccountingGridSession();
  }, []);
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === values.transactionId,
  );
  const existingVoucher = vouchers.find(
    (voucher) => voucher.transactionId === values.transactionId,
  );
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
    updateField(
      "lineEntries",
      values.lineEntries.filter((entry) => entry.id !== entryId),
    );
  }

  function createBlankEntry(): DisbursementLineEntry {
    return {
      accountCode: "",
      accountName: "",
      credit: 0,
      debit: 0,
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      particulars: "",
      status: "Pending",
      taxDetails: createTaxDetails(0, "0%"),
      taxRate: "0%",
    };
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
    updateField(
      "lineEntries",
      values.lineEntries.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }

        const nextEntry = { ...entry, [field]: value };

        if (field === "debit" || field === "credit" || field === "taxRate") {
          const amount = Number(nextEntry.debit || 0) || Number(nextEntry.credit || 0);

          nextEntry.taxDetails = syncTaxDetailsAmount(
            nextEntry.taxDetails,
            amount,
            String(nextEntry.taxRate || "0%"),
          );
        }

        return nextEntry;
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

  function handleOpenEntryTaxEditor(entryId: string) {
    const lineEntry = values.lineEntries.find((entry) => entry.id === entryId);

    if (!lineEntry) {
      return;
    }

    setTaxEditorTarget({ kind: "entry", entryId });
    setTaxEditorValues(createTaxEditorValue(lineEntry.taxDetails, lineEntry.taxRate));
  }

  function handleSaveTaxDetails(nextTaxValue: AppTaxRateDialogValue) {
    if (!taxEditorTarget) {
      return;
    }

    if (taxEditorTarget.kind === "voucher") {
      updateField("taxRate", nextTaxValue.taxRate);
      updateField("taxDetails", nextTaxValue.taxDetails);
      setTaxEditorTarget(null);
      setTaxEditorValues(null);
      return;
    }

    updateField(
      "lineEntries",
      values.lineEntries.map((entry) =>
        entry.id === taxEditorTarget.entryId
          ? {
              ...entry,
              taxRate: nextTaxValue.taxRate,
              taxDetails: nextTaxValue.taxDetails,
            }
          : entry,
      ),
    );

    setTaxEditorTarget(null);
    setTaxEditorValues(null);
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

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

  function handleConfirmDelete() {
    if (!existingVoucher) {
      return;
    }

    deleteVoucher(existingVoucher.id);
    setIsDeleteDialogOpen(false);
    router.push(DisbursementVoucherHref);
  }

  const actionContent = (
    <>
      <DisbursementVoucherActionHeader
        mode={mode}
        transaction={selectedTransaction}
        voucher={existingVoucher}
        onEditVoucher={
          existingVoucher
            ? () => router.push(`${DisbursementVoucherHref}/edit/${selectedTransaction?.id ?? ""}`)
            : undefined
        }
        onDeleteVoucher={
          existingVoucher ? () => setIsDeleteDialogOpen(true) : undefined
        }
        onSubmit={() => handleSubmit()}
        copyFromRecords={DisbursementVoucherCopyFromRecords}
        copyFromSources={DisbursementVoucherCopySources}
        onCopyFrom={(recordIds) => {
          const record = DisbursementVoucherCopyFromRecords.find(
            (candidate) => candidate.id === recordIds[0],
          );

          if (!record) {
            return;
          }

          setValues((currentValues) =>
            applyCopyFromRecordToDisbursementVoucherForm(
              currentValues,
              record,
            ),
          );
          setErrors({});
        }}
        returnHref={returnHref}
      />

      <VoucherDetailsPanel
        errors={errors}
        isReadonly={isReadonly}
        paymentTypeRecords={paymentTypeRecords}
        transactions={transactions}
        values={values}
        onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
        onOpenTaxEditor={() => {
          setTaxEditorTarget({ kind: "voucher" });
          setTaxEditorValues(createTaxEditorValue(values.taxDetails, values.taxRate));
        }}
        onUpdateField={updateField}
      />

      <VoucherDataEntry
        errors={errors}
        entries={values.lineEntries}
        isReadonly={isReadonly}
        onAddEntries={handleAddEntries}
        onAddDisbursementType={() => setIsDisbursementTypeDrawerOpen(true)}
        onClearEntries={handleClearEntries}
        onDuplicateEntry={handleDuplicateEntry}
        onInsertEntry={handleInsertEntry}
        onMoveEntry={handleMoveEntry}
        onOpenEntryTaxEditor={handleOpenEntryTaxEditor}
        onUpdateEntry={handleUpdateEntry}
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

      <AppDialog
        isOpen={isDeleteDialogOpen}
        isPending={isMutating}
        title="Delete this voucher?"
        description={`This will remove ${existingVoucher?.voucherNo ?? "the selected voucher"} from the preview table.`}
        confirmLabel="Delete Voucher"
        tone="danger"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <AppTaxRateDialog
        isOpen={Boolean(taxEditorTarget && taxEditorValues)}
        title="Tax Setup"
        value={taxEditorValues}
        onClose={() => {
          setTaxEditorTarget(null);
          setTaxEditorValues(null);
        }}
        onSave={handleSaveTaxDetails}
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
        onRecordsChange={setDisbursementTypeRecords}
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
    label: currency.name,
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

function createTaxEditorValue(
  taxDetails: DisbursementTaxDetails,
  taxRate: string,
): AppTaxRateDialogValue {
  return {
    taxDetails,
    taxRate: getVatTaxRateValue(taxDetails, taxRate),
  };
}

function getVatTaxRateValue(
  taxDetails: DisbursementTaxDetails,
  fallbackTaxRate: string,
) {
  if (/^\d+(?:\.\d+)?%$/.test(fallbackTaxRate)) {
    return fallbackTaxRate;
  }

  if (taxDetails.vatPercent > 0) {
    return `${Number.isInteger(taxDetails.vatPercent) ? taxDetails.vatPercent : taxDetails.vatPercent.toFixed(2)}%`;
  }

  return "0%";
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
  errors,
  isReadonly,
  onOpenPaymentTypeDialog,
  onOpenTaxEditor,
  onUpdateField,
  paymentTypeRecords,
  transactions,
  values,
}: {
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  onOpenPaymentTypeDialog: () => void;
  onOpenTaxEditor: () => void;
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
      partyRecords.map((party) => ({
        description: party.partyTypes.join(", "),
        label: party.partyCodeNo,
        name: getPartyDisplayName(party),
        value: party.partyCodeNo,
      })),
    [partyRecords],
  );
  const paymentTypeOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      paymentTypeRecords
        .filter((record) => record.status === "Active")
        .map((record) => ({
          label: record.type,
          name: record.paymentType,
          value: record.paymentType,
        })),
    [paymentTypeRecords],
  );
  const currencyOptions = useMemo(() => createVoucherCurrencyDropdownOptions(), []);

  function updateAmount(nextAmount: string) {
    const amount = Number(nextAmount || 0);

    onUpdateField("amount", nextAmount);
    onUpdateField(
      "taxDetails",
      syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate),
    );
  }

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

  function updateReferenceModule(value: string | string[]) {
    const nextReferenceModule = Array.isArray(value) ? (value[0] ?? "") : value;

    onUpdateField("referenceModule", nextReferenceModule);

    if (!nextReferenceModule) {
      onUpdateField("voucherReferenceNo", "");
    }
  }

  function updatePaymentDetails(
    nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>,
  ) {
    onUpdateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
  }

  function updateBankAccount(accountCode: string) {
    const bankAccount = DisbursementVoucherBankAccounts.find(
      (account) => account.accountCode === accountCode,
    );

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
  }

  const amountTaxSummary = [
    values.taxDetails.vatPercent > 0
      ? `VAT ${values.taxDetails.vatPercent}%`
      : "",
    values.taxDetails.ewtPercent > 0
      ? `EWT ${values.taxDetails.ewtPercent}%`
      : "",
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <FieldShell label="Payment Type" error={errors.paymentMethod} isRequired>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto]">
              <AppAdvancedDropdown
                value={values.paymentMethod}
                readOnly={isReadonly}
                options={paymentTypeOptions}
                placeholder="Select payment type"
                searchPlaceholder="Search payment type"
                className="[&_.app-advanced-dropdown-control]:rounded-r-none [&_.app-advanced-dropdown-control]:border-r-0 [&_.app-advanced-dropdown-control]:shadow-none"
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
                }}
              />
              <button
                type="button"
                disabled={isReadonly}
                onClick={onOpenPaymentTypeDialog}
                className={`${FieldActionButtonClassName} rounded-l-none rounded-r-lg`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
          </FieldShell>
          <FieldShell label="Party Name" error={errors.vceCode || errors.vceName} isRequired>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto]">
              <AppAdvancedDropdown
                className="[&_.app-advanced-dropdown-control]:rounded-r-none [&_.app-advanced-dropdown-control]:border-r-0 [&_.app-advanced-dropdown-control]:shadow-none"
                options={partyOptions}
                placeholder="Select party"
                readOnly={isReadonly}
                searchPlaceholder="Search party"
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
                className={`${FieldActionButtonClassName} rounded-l-none rounded-r-lg`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
          </FieldShell>
          <FieldShell label="Currency" error={errors.currency}>
            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <AppAdvancedDropdown
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
                <input
                  id="disbursement-voucher-fx-rate"
                  value={values.fxRate}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdateField("fxRate", event.target.value)}
                  className={`${FieldClassName} text-right`}
                />
              </div>
            </div>
          </FieldShell>
          <FieldShell label="Amount" error={errors.amount}>
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                value={values.amount}
                readOnly={isReadonly}
                inputMode="decimal"
                onChange={(event) => updateAmount(event.target.value)}
                className={`${FieldClassName} text-right`}
              />
              <button
                type="button"
                onClick={onOpenTaxEditor}
                disabled={isReadonly}
                className={`${FieldActionButtonClassName} rounded-md`}
              >
                + Tax
              </button>
            </div>
            {amountTaxSummary ? (
              <span className="mt-1 block text-xs text-darknavy/45">
                {amountTaxSummary}
              </span>
            ) : null}
          </FieldShell>
          <FieldShell label="Remarks" error={errors.remarks}>
            <AppLimitedTextarea
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell label="Transaction No." error={errors.transactionId} isRequired>
            <input
              value={transactionNumberValue}
              readOnly={isReadonly}
              onChange={(event) => updateTransactionNumber(event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell label="Document Date" error={errors.voucherDate} isRequired>
            <input
              type="date"
              value={values.voucherDate}
              readOnly={isReadonly}
              onChange={(event) =>
                onUpdateField("voucherDate", event.target.value)
              }
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell label="Reference" error={errors.voucherReferenceNo}>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <AppAdvancedDropdown
                className="[&_.app-advanced-dropdown-control]:rounded-r-none [&_.app-advanced-dropdown-control]:border-r-0 [&_.app-advanced-dropdown-control]:bg-white [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-menu]:min-w-64"
                isClearable
                options={ReferenceModuleDropdownOptions}
                placeholder=""
                readOnly={isReadonly}
                searchPlaceholder="Search modules"
                showSelectionIndicator={false}
                value={values.referenceModule}
                onChange={updateReferenceModule}
              />
              <input
                value={values.voucherReferenceNo}
                disabled={!values.referenceModule}
                readOnly={isReadonly || !values.referenceModule}
                placeholder={values.referenceModule ? "Reference number" : ""}
                onChange={(event) =>
                  onUpdateField("voucherReferenceNo", event.target.value)
                }
                className={`${FieldClassName} min-w-0 truncate rounded-l-none bg-white focus:z-10 disabled:cursor-not-allowed disabled:bg-offwhite/65 disabled:text-darknavy/45`}
              />
            </div>
          </FieldShell>
          <FieldShell label="Status" error={errors.status}>
            <input
              value={values.status}
              readOnly
              className={`${FieldClassName} !bg-darknavy/5 text-darknavy/60`}
            />
          </FieldShell>
        </div>
      </div>
      <PaymentTypeDetailsPanel
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
  isReadonly,
  onUpdateBankAccount,
  onUpdatePaymentDetails,
  paymentType,
  paymentTypeRecord,
  values,
}: {
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
      <div className="mt-5 grid min-w-0 gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
        <FieldShell label="From Bank" compact>
          <BankAccountSelect
            isReadonly={isReadonly}
            value={values.paymentDetails.bankAccountCode}
            onChange={onUpdateBankAccount}
          />
        </FieldShell>
        <FieldShell label="To Bank" compact>
          <input
            value={values.paymentDetails.transferToBank ?? ""}
            readOnly={isReadonly}
            onChange={(event) =>
              onUpdatePaymentDetails({ transferToBank: event.target.value })
            }
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell label="Account Name" compact>
          <input
            value={values.paymentDetails.transferAccountName ?? ""}
            readOnly={isReadonly}
            onChange={(event) =>
              onUpdatePaymentDetails({ transferAccountName: event.target.value })
            }
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell label="Account No." compact>
          <input
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
    <div className="mt-5 grid min-w-0 gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
      <FieldShell label="Bank" compact>
        <BankAccountSelect
          isReadonly={isReadonly}
          value={values.paymentDetails.bankAccountCode}
          onChange={onUpdateBankAccount}
        />
      </FieldShell>
      <FieldShell label="Payee" compact>
        <input
          value={values.paymentDetails.payee ?? values.vceName}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ payee: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell label={documentNoLabel} compact>
        <input
          value={values.paymentDetails.checkNo}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ checkNo: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell label="Check Date" compact>
        <input
          type="date"
          value={values.paymentDetails.checkDate || values.voucherDate}
          readOnly={isReadonly}
          onChange={(event) =>
            onUpdatePaymentDetails({ checkDate: event.target.value })
          }
          className={FieldClassName}
        />
      </FieldShell>
      <FieldShell label="Check Status" compact>
        <input
          value={values.paymentDetails.checkStatus ?? ""}
          readOnly
          className={`${FieldClassName} bg-darknavy/5 text-darknavy/55`}
        />
      </FieldShell>
      <FieldShell label="Commission" compact>
        <input
          value={values.paymentDetails.commission ?? ""}
          readOnly
          className={`${FieldClassName} bg-darknavy/5 text-darknavy/55`}
        />
      </FieldShell>
    </div>
  );
}

function BankAccountSelect({
  isReadonly,
  onChange,
  value,
}: {
  isReadonly: boolean;
  onChange: (accountCode: string) => void;
  value: string;
}) {
  return (
    <select
      value={value}
      disabled={isReadonly}
      onChange={(event) => onChange(event.target.value)}
      className={FieldClassName}
    >
      <option value="">--Select Bank--</option>
      {DisbursementVoucherBankAccounts.map((bankAccount) => (
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

  if (paymentTypeRecord?.type === "With Bank") {
    return "with-bank";
  }

  if (paymentTypeRecord?.type === "Bank Transfer") {
    return "bank-transfer";
  }

  if (paymentTypeRecord?.type === "Debit") {
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
    normalizedPaymentType === "cash" ||
    normalizedPaymentType.includes("petty cash") ||
    normalizedPaymentType.includes("g-cash") ||
    normalizedPaymentType.includes("online")
  ) {
    return "cash";
  }

  return "";
}

function FieldShell({
  children,
  compact = false,
  error,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  compact?: boolean;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  if (compact) {
    return (
      <label className="grid min-w-0 gap-2">
        <span className="text-sm font-semibold text-darknavy">
          {label}
          {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
        </span>
        {children}
        {error ? (
          <span className="text-xs font-medium text-coralpink">{error}</span>
        ) : null}
      </label>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      <span className="pt-2 text-sm font-semibold text-darknavy">
        {label}
        {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
      </span>
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

const FieldActionButtonClassName =
  "theme-accent-contrast-text inline-flex h-11 w-24 shrink-0 items-center justify-center gap-2 bg-skyblue px-3 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-default disabled:opacity-50";

type DisbursementEntryColumnId =
  | "accountCode"
  | "accountName"
  | "particulars"
  | "taxRate"
  | "debit"
  | "credit"
  | "status";

const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountCode",
  "accountName",
  "particulars",
  "taxRate",
  "debit",
  "credit",
  "status",
];

const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountName",
  "particulars",
  "taxRate",
  "debit",
  "credit",
  "status",
];

const ProtectedDisbursementEntryColumnIds = new Set<DisbursementEntryColumnId>([
  "accountName",
  "particulars",
  "debit",
  "credit",
]);

const DisbursementEntryColumnLabels: Record<DisbursementEntryColumnId, string> = {
  accountCode: "Account Code",
  accountName: "Account Name",
  particulars: "Particulars",
  taxRate: "Tax Rate",
  debit: "Debit",
  credit: "Credit",
  status: "Status",
};

function isDisbursementEntryColumnId(
  columnId: string,
): columnId is DisbursementEntryColumnId {
  return DefaultDisbursementEntryColumnOrder.includes(
    columnId as DisbursementEntryColumnId,
  );
}

function VoucherDataEntry({
  entries,
  errors,
  isReadonly,
  onAddEntries,
  onAddDisbursementType,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onOpenEntryTaxEditor,
  onUpdateEntry,
  totalCredit,
  totalDebit,
  onRemoveEntry,
}: {
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  onAddEntries: (count: number) => void;
  onAddDisbursementType: () => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onOpenEntryTaxEditor: (entryId: string) => void;
  onUpdateEntry: (
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) => void;
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
}) {
  const variance = Math.abs(totalDebit - totalCredit);
  const [columnOrder, setColumnOrder] = useState<DisbursementEntryColumnId[]>(
    DefaultDisbursementEntryColumnOrder,
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    DisbursementEntryColumnId[]
  >(DefaultVisibleDisbursementEntryColumnOrder);
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const allColumns = useMemo<
    Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>
  >(
    () => ({
      accountCode:
      {
        header: "Account Code",
        id: "accountCode",
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.accountCode}
            onChange={(value) =>
              onUpdateEntry(entry.id, "accountCode", value)
            }
            disabled={isReadonly}
          />
        ),
      },
      accountName: {
        header: "Account Name",
        id: "accountName",
        widthClassName: "w-[16rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.accountName}
            onChange={(value) =>
              onUpdateEntry(entry.id, "accountName", value)
            }
            disabled={isReadonly}
          />
        ),
      },
      particulars: {
        header: "Particulars",
        id: "particulars",
        widthClassName: "w-[22rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.particulars}
            onChange={(value) =>
              onUpdateEntry(entry.id, "particulars", value)
            }
            disabled={isReadonly}
          />
        ),
      },
      taxRate: {
        header: "Tax Rate",
        id: "taxRate",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <button
            type="button"
            onClick={() => onOpenEntryTaxEditor(entry.id)}
            disabled={isReadonly}
            className={joinClasses(
              accountingCellControlClassName(),
              "flex items-center justify-between gap-2 text-left",
            )}
          >
            <span className="truncate">
              {formatTaxRateSummary(entry.taxDetails)}
            </span>
            <Percent className="h-4 w-4 shrink-0 text-darknavy/45" />
          </button>
        ),
      },
      debit: {
        header: "Debit",
        id: "debit",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.debit}
            onChange={(value) => onUpdateEntry(entry.id, "debit", value)}
            disabled={isReadonly || Number(entry.credit || 0) > 0}
          />
        ),
      },
      credit: {
        header: "Credit",
        id: "credit",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.credit}
            onChange={(value) => onUpdateEntry(entry.id, "credit", value)}
            disabled={isReadonly || Number(entry.debit || 0) > 0}
          />
        ),
      },
      status: {
        header: "Status",
        id: "status",
        widthClassName: "w-[10rem]",
        renderCell: (entry) => (
          <select
            value={entry.status}
            onChange={(event) =>
              onUpdateEntry(entry.id, "status", event.target.value)
            }
            disabled={isReadonly}
            className={accountingCellControlClassName()}
          >
            <option value="Pending">Pending</option>
            <option value="Balanced">Balanced</option>
          </select>
        ),
      },
    }),
    [isReadonly, onOpenEntryTaxEditor, onUpdateEntry],
  );
  const columns = useMemo<ModuleDataEntryColumn<DisbursementLineEntry>[]>(
    () => visibleColumnOrder.map((columnId) => allColumns[columnId]),
    [allColumns, visibleColumnOrder],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !ProtectedDisbursementEntryColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: DisbursementEntryColumnLabels[columnId],
      })),
    [columnOrder, visibleColumnIds],
  );

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (!isDisbursementEntryColumnId(fromColumnId) || !isDisbursementEntryColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(fromColumnId);
      const toIndex = currentOrder.indexOf(toColumnId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(fromIndex, 1);

      nextOrder.splice(toIndex, 0, movedColumn);
      return nextOrder;
    });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedDisbursementEntryColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => {
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
    });
  }

  function handleExportEntriesCsv() {
    const rows = [
      ["Account Code", "Account Name", "Particulars", "Tax Rate", "Debit", "Credit", "Status"],
      ...entries.map((entry) => [
        entry.accountCode,
        entry.accountName,
        entry.particulars,
        formatTaxRateSummary(entry.taxDetails),
        String(entry.debit || ""),
        String(entry.credit || ""),
        entry.status,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "disbursement-voucher-entries.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="min-w-0">
      <div className="min-w-0">
        <ModuleDataEntry
          columns={columns}
          description=""
          emptyRowLabel="entry"
          error={errors.lineEntries}
          columnOptions={columnOptions}
          summaryCells={{
            credit: formatAccountingAmount(totalCredit),
            debit: formatAccountingAmount(totalDebit),
            particulars: (
              <span
                className={joinClasses(
                  "font-semibold",
                  variance < 0.001 ? "text-emerald-700" : "text-coralpink",
                )}
              >
                Variance: {formatAccountingAmount(variance)}
              </span>
            ),
          }}
          exportOptions={[
            {
              id: "csv",
              label: "CSV (.csv)",
              onSelect: handleExportEntriesCsv,
            },
          ]}
          isDraggable
          isReadonly={isReadonly}
          rows={entries}
          toolbarActions={[
            {
              id: "add-disbursement-type",
              icon: Plus,
              label: "Add Disbursement Type",
              onSelect: onAddDisbursementType,
            },
          ]}
          title="Accounting Entries"
          onAddRows={onAddEntries}
          onClearRows={onClearEntries}
          onDuplicateRow={onDuplicateEntry}
          onInsertRow={onInsertEntry}
          onMoveColumn={moveColumn}
          onMoveRow={onMoveEntry}
          onRemoveRow={onRemoveEntry}
          onToggleColumnVisibility={toggleColumnVisibility}
        />

      </div>
    </section>
  );
}

function EntryInput({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={accountingCellControlClassName()}
    />
  );
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
  return (
    <input
      type="number"
      min="0"
      value={value || ""}
      onChange={(event) => onChange(Number(event.target.value))}
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
    entry.particulars.trim() !== "" ||
    Number(entry.debit || 0) > 0 ||
    Number(entry.credit || 0) > 0 ||
    entry.taxRate !== "0%"
  );
}

function disbursementEntryIsComplete(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" &&
    entry.accountName.trim() !== "" &&
    entry.particulars.trim() !== "" &&
    (Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0)
  );
}
