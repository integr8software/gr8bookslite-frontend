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
  DisbursementVoucherBankAccounts,
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
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/payment-type/usePaymentType";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import {
  getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
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
  AppTaxRateDialog,
  type AppTaxRateDialogValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { PartyManagementDrawer } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer";
import type { AppDisbursementTypeRecord } from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionHeader";
import { DisbursementEntryImportDialog } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementEntryImportDialog";
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
  const [disbursementTypeRecords, setDisbursementTypeRecords] = useState(
    InitialDisbursementTypeRecords,
  );
  const [isDisbursementTypeDrawerOpen, setIsDisbursementTypeDrawerOpen] =
    useState(false);
  const [taxEditorTarget, setTaxEditorTarget] = useState<TaxEditorTarget>(null);
  const [taxEditorValues, setTaxEditorValues] =
    useState<AppTaxRateDialogValue | null>(null);

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

  function handleImportEntries(importedEntries: DisbursementLineEntry[]) {
    if (isReadonly || importedEntries.length === 0) {
      return;
    }

    const nextImportedEntries = importedEntries.map((entry) =>
      syncDisbursementLineEntryTaxDetails(
        normalizeDisbursementLineEntryFields({
          ...entry,
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        }),
      ),
    );
    const populatedEntries = values.lineEntries.filter(disbursementEntryHasData);

    updateField(
      "lineEntries",
      populatedEntries.length > 0
        ? [...populatedEntries, ...nextImportedEntries]
        : nextImportedEntries,
    );
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
    toast.success(`${importedEntries.length} accounting entries imported.`);
  }

  function handleOpenEntryTaxEditor(entryId: string) {
    const lineEntry = values.lineEntries.find((entry) => entry.id === entryId);

    if (!lineEntry) {
      return;
    }

    const normalizedEntry = syncDisbursementLineEntryTaxDetails(
      normalizeDisbursementLineEntryFields(lineEntry),
    );

    setTaxEditorTarget({ kind: "entry", entryId });
    setTaxEditorValues(
      createTaxEditorValue(normalizedEntry.taxDetails, normalizedEntry.taxRate),
    );
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
            atcCode: nextTaxValue.taxDetails.atcCode,
            refId: nextTaxValue.taxDetails.refId,
            responsibilityCenter: nextTaxValue.taxDetails.responsibilityCenter,
            taxRate: nextTaxValue.taxRate,
            taxDetails: nextTaxValue.taxDetails,
            vatType: nextTaxValue.taxDetails.vatType,
          }
          : entry,
      ),
    );

    setTaxEditorTarget(null);
    setTaxEditorValues(null);
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
        onImportEntries={handleImportEntries}
        onMoveEntry={handleMoveEntry}
        onOpenEntryTaxEditor={handleOpenEntryTaxEditor}
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

      <AppTaxRateDialog
        isOpen={Boolean(taxEditorTarget && taxEditorValues)}
        title="Tax"
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

function createVoucherPaymentTypeOptions({
  currentPaymentMethod,
  paymentTypeRecords,
  transactions,
}: {
  currentPaymentMethod: string;
  paymentTypeRecords: AppPaymentTypeRecord[];
  transactions: DisbursementTransactionRecord[];
}): AppAdvancedDropdownOption[] {
  const options = paymentTypeRecords
    .filter((record) => record.status === "Active")
    .map((record) => ({
      label: record.type,
      name: record.paymentType,
      value: record.paymentType,
    }));

  transactions.forEach((transaction) => {
    addUniqueDropdownOption(options, {
      label: inferVoucherPaymentTypeClassification(transaction.paymentMethod),
      name: transaction.paymentMethod,
      value: transaction.paymentMethod,
    });
  });

  if (currentPaymentMethod.trim()) {
    addUniqueDropdownOption(options, {
      label: inferVoucherPaymentTypeClassification(currentPaymentMethod),
      name: currentPaymentMethod,
      value: currentPaymentMethod,
    });
  }

  return options;
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

function inferVoucherPaymentTypeClassification(paymentMethod: string) {
  const normalizedPaymentMethod = paymentMethod.toLowerCase();

  if (normalizedPaymentMethod.includes("debit")) {
    return "Debit";
  }

  if (
    normalizedPaymentMethod.includes("check") ||
    normalizedPaymentMethod.includes("cheque")
  ) {
    return "With Bank";
  }

  if (
    normalizedPaymentMethod.includes("cash") ||
    normalizedPaymentMethod.includes("petty")
  ) {
    return "Cash";
  }

  return "Bank Transfer";
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
        currentPaymentMethod: values.paymentMethod,
        paymentTypeRecords,
        transactions,
      }),
    [paymentTypeRecords, transactions, values.paymentMethod],
  );
  const currencyOptions = useMemo(() => createVoucherCurrencyDropdownOptions(), []);

  function updateAmount(nextAmount: string) {
    const amount = parseMoneyNumberInput(nextAmount);

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
            controlId="disbursement-voucher-amount"
            label="Amount"
            error={errors.amount}
          >
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
              <MoneyNumberField
                id="disbursement-voucher-amount"
                value={values.amount}
                readOnly={isReadonly}
                onValueChange={updateAmount}
                className={`${FieldClassName} text-right sm:rounded-r-none`}
              />
              <button
                type="button"
                onClick={onOpenTaxEditor}
                disabled={isReadonly}
                className={AttachedTaxButtonClassName}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tax
              </button>
            </div>
            {amountTaxSummary ? (
              <span className="mt-1 block text-xs text-darknavy/45">
                {amountTaxSummary}
              </span>
            ) : null}
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
      <div className="mt-5 grid min-w-0 gap-x-8 gap-y-4 border-t border-darknavy/10 pt-5 md:grid-cols-2 xl:grid-cols-4">
        <FieldShell controlId="disbursement-voucher-from-bank" label="From Bank" compact>
          <BankAccountSelect
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
  id,
  isReadonly,
  onChange,
  value,
}: {
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

const AttachedTaxButtonClassName =
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

function VoucherDataEntry({
  entries,
  errors,
  isReadonly,
  onAddEntries,
  onAddDisbursementType,
  onClearEntries,
  onDuplicateEntry,
  onImportEntries,
  onInsertEntry,
  onMoveEntry,
  onOpenEntryTaxEditor,
  onUpdateEntry,
  onUpdateEntryFields,
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
  onImportEntries: (entries: DisbursementLineEntry[]) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onOpenEntryTaxEditor: (entryId: string) => void;
  onUpdateEntry: (
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) => void;
  onUpdateEntryFields: (
    entryId: string,
    updates: Partial<DisbursementLineEntry>,
  ) => void;
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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
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
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const chartAccounts = useMemo(
    () => createAccountingChartAccountOptions(entries),
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
      onOpenEntryTaxEditor,
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

  function updateColumnHeader(columnId: string, header: string) {
    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
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

  function createExportRows() {
    return [
      visibleColumnOrder.map((columnId) => columnLabels[columnId]),
      ...entries.map((entry) =>
        visibleColumnOrder.map((columnId) =>
          getDisbursementEntryExportCell(entry, columnId),
        ),
      ),
    ];
  }

  function handleExportEntriesCsv() {
    const csv = createExportRows()
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

  function handleExportEntriesExcel() {
    const htmlRows = createExportRows()
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${escapeHtml(String(cell))}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`;
    downloadBlob(
      new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
      "disbursement-voucher-entries.xls",
    );
  }

  function handleExportEntriesPdf() {
    downloadBlob(
      createSimplePdfBlob("Disbursement Voucher Entries", createExportRows()),
      "disbursement-voucher-entries.pdf",
    );
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
          }}
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
          exportOptions={[
            {
              id: "csv",
              label: "CSV",
              onSelect: handleExportEntriesCsv,
            },
            {
              id: "excel",
              label: "Excel",
              onSelect: handleExportEntriesExcel,
            },
            {
              id: "pdf",
              label: "PDF",
              onSelect: handleExportEntriesPdf,
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
          onAutoColumnWidth={fitColumnWidth}
          onClearRows={onClearEntries}
          onDuplicateRow={onDuplicateEntry}
          onFitColumnWidth={fitColumnWidth}
          onImport={() => setIsImportDialogOpen(true)}
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
      <DisbursementEntryImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportEntries={(importedEntries) => {
          onImportEntries(importedEntries);
          setIsImportDialogOpen(false);
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createSimplePdfBlob(title: string, rows: string[][]) {
  const lines = [title, "", ...rows.map((row) => row.join(" | "))];
  const content = [
    "BT",
    "/F1 10 Tf",
    "40 790 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "/F1 14 Tf" : "/F1 9 Tf",
      `(${escapePdfText(line.slice(0, 110))}) Tj`,
      "0 -16 Td",
    ]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
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
