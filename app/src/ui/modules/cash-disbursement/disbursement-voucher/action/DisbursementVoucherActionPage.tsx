"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FileText,
  MoreHorizontal,
  Paperclip,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DisbursementVoucherHref,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherBankAccounts,
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
  DisbursementVoucherDefaultAccounts,
  DisbursementVoucherPartyOptions,
  applyCopyFromRecordsToDisbursementVoucherForm,
  createBlankDisbursementLineEntry,
  createDisbursementVoucherStatusHistoryEntry,
  createTaxDetails,
  createDisbursementTransactionFromForm,
  createDisbursementVoucherFormValues,
  createDisbursementVoucherFromForm,
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
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  getModuleChartAccounts,
  type ModuleChartAccount,
} from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
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
import { PaymentTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeDrawer";
import { BankMasterfileDrawer } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileDrawer";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountDrawer";
import { ProjectNameDialog } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ProjectNameDialog";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import type {
  DisbursementAttachment,
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
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherActionHeader";
import { DisbursementVoucherDetailsForm } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherDetailsForm";
import { getPaymentTypeDetailKind } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherPaymentFields";
import { DisbursementVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherReportPreview";
import { openDisbursementVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherPdf";
import {
  clearAccountingGridSession,
  readAccountingGridSession,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherNotFound";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  ModuleTabs,
  type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import {
  MoneyNumberField,
  formatMoneyNumberInput,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherActionPage() {
  return (
    <Suspense fallback={<VoucherWorkflowSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

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
  const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
  const paymentTypeStore = usePaymentTypeStore();
  const paymentTypeRecords = paymentTypeStore.paymentTypes;
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const bankMasterfileStore = useBankMasterfileStore();
  const bankAccounts = DisbursementVoucherBankAccounts;
  const defaultAccountStore = useDefaultAccountStore();
  const defaultAccounts = DisbursementVoucherDefaultAccounts;
  const [activeTab, setActiveTab] =
    useState<DisbursementVoucherActionTab>("details");
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isDefaultAccountDrawerOpen, setIsDefaultAccountDrawerOpen] =
    useState(false);
  const [isBankMasterfileDrawerOpen, setIsBankMasterfileDrawerOpen] =
    useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
  const [isProjectNameDialogOpen, setIsProjectNameDialogOpen] = useState(false);

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

  function updatePaymentDetails(
    nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>,
  ) {
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
    const paymentTypeRecord =
      paymentTypeRecords.find(
        (record) => record.paymentType === nextPaymentMethod,
      ) ?? null;
    const isCashPayment =
      paymentTypeRecord?.type === "Cash" ||
      nextPaymentMethod.trim().toLowerCase() === "cash";
    const bankAccount =
      overrides.bankAccount !== undefined
        ? overrides.bankAccount
        : bankAccounts.find(
            (account) =>
              account.accountCode === values.paymentDetails.bankAccountCode,
          ) ?? null;

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
          shouldSyncDisbursementEntryParty(
            entry,
            previousPartyCode,
            previousPartyName,
          )
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

      updateField(
        "lineEntries",
        createAutomaticEntriesForPayment(values.lineEntries, {
          bankAccount: currentBankAccount,
          paymentMethod,
        }),
      );
      return;
    }

    updateField(
      "lineEntries",
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount: null,
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
    const bankAccount =
      bankAccounts.find((account) => account.accountCode === accountCode) ?? null;

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

  function handleRemoveEntry(entryId: string) {
    const nextEntries = values.lineEntries.filter((entry) => entry.id !== entryId);

    updateField(
      "lineEntries",
      createAutomaticEntriesForPayment(
        nextEntries.length > 0 ? nextEntries : [createBlankEntry()],
      ),
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

    updateField(
      "lineEntries",
      createAutomaticEntriesForPayment(
        nextEntries.length > 0 ? nextEntries : [createBlankEntry()],
      ),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: DisbursementLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce(
        (sum, entry) => sum + Number(entry.taxDetails.amount || 0),
        0,
      );

    updateField("lineEntries", nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField(
      "taxDetails",
      syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate),
    );
  }

  function submitDisbursementVoucher(status: DisbursementVoucherStatus) {
    if (isReadonly) {
      return;
    }

    const valuesForSubmit = { ...values, status };
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
      updateVoucher(
        updateDisbursementVoucherFromForm(existingVoucher, valuesForSubmit),
      );
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
      updateTransaction({
        ...selectedTransaction,
        status,
        updatedBy: "Current User",
        updatedAt,
      });
    }
  }

  const actionContent = (
    <>
      <DisbursementVoucherActionHeader
        mode={isReadonly ? "view" : mode}
        transaction={selectedTransaction}
        voucher={existingVoucher}
        onUpdateStatus={handleUpdateStatus}
        onPreview={() => setIsReportPreviewOpen(true)}
        onSubmit={() =>
          submitDisbursementVoucher(DisbursementVoucherStatuses.forApproval)
        }
        onSaveDraft={() =>
          submitDisbursementVoucher(DisbursementVoucherStatuses.draft)
        }
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

      <ModuleTabs
        activeTab={activeTab}
        ariaLabel="Disbursement voucher sections"
        tabs={DisbursementVoucherActionTabs}
        onTabChange={setActiveTab}
      />

      {activeTab === "details" ? (
        <>
          <DisbursementVoucherDetailsForm
            errors={errors}
            isReadonly={isReadonly}
            bankAccounts={bankAccounts}
            paymentTypeRecords={paymentTypeRecords}
            canAddBankAccount={bankMasterfileStore.permissions.canCreate}
            canAddPartyName={partyStore.permissions.canCreate}
            canAddPaymentType={paymentTypeStore.permissions.canCreate}
            canAddProjectName={responsibilityCenterStore.permissions.canCreate}
            onOpenBankAccountDrawer={() => setIsBankMasterfileDrawerOpen(true)}
            onOpenPartyNameDialog={() => setIsPartyNameDrawerOpen(true)}
            values={values}
            onOpenPaymentTypeDrawer={() => setIsPaymentTypeDrawerOpen(true)}
            onOpenProjectNameDialog={() => setIsProjectNameDialogOpen(true)}
            onPartyChange={handlePartyChange}
            onPaymentTypeChange={handlePaymentTypeChange}
            onUpdateBankAccount={handleBankAccountChange}
            onUpdateField={updateField}
            onUpdatePaymentDetails={updatePaymentDetails}
          />

          <VoucherDataEntry
            errors={errors}
            entries={values.lineEntries}
            isReadonly={isReadonly}
            defaultAccounts={defaultAccounts}
            isMultiCheckNumber={Boolean(values.paymentDetails.isMultiCheckNumber)}
            bankAccount={
              bankAccounts.find(
                (account) =>
                  account.accountCode === values.paymentDetails.bankAccountCode,
              ) ?? null
            }
            paymentMethod={values.paymentMethod}
            paymentTypeRecord={
              paymentTypeRecords.find(
                (record) => record.paymentType === values.paymentMethod,
              ) ?? null
            }
            partyCode={values.partyCode}
            partyName={values.partyName}
            canAddExpenseType={defaultAccountStore.permissions.canCreate}
            canAddPartyName={partyStore.permissions.canCreate}
            canAddResponsibilityCenter={responsibilityCenterStore.permissions.canCreate}
            onAddEntries={handleAddEntries}
            onAddExpenseType={() => setIsDefaultAccountDrawerOpen(true)}
            onAddPartyName={() => setIsPartyNameDrawerOpen(true)}
            onAddResponsibilityCenter={() => setIsProjectNameDialogOpen(true)}
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
      ) : (
        <DisbursementVoucherFileAttachmentFields
          attachments={values.attachments}
          isReadonly={isReadonly}
          onAttachmentsChange={(attachments) =>
            updateField("attachments", attachments)
          }
        />
      )}
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

      <PaymentTypeDrawer
        isOpen={!isReadonly && isPaymentTypeDrawerOpen}
        mode="add"
        onClose={() => setIsPaymentTypeDrawerOpen(false)}
      />
      <BankMasterfileDrawer
        isOpen={!isReadonly && isBankMasterfileDrawerOpen}
        mode="add"
        onClose={() => setIsBankMasterfileDrawerOpen(false)}
      />
      <PartyManagementDrawer
        isOpen={!isReadonly && isPartyNameDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Party Name"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyNameDrawerOpen(false)}
        onCreateParty={(record) => {
          const partyName = getPartyDisplayName(record);

          handlePartyChange(record.partyCodeNo, partyName);
          setIsPartyNameDrawerOpen(false);
        }}
      />
      <ProjectNameDialog
        isOpen={!isReadonly && isProjectNameDialogOpen}
        onClose={() => setIsProjectNameDialogOpen(false)}
        onCreateProject={(project) => {
          updateField("costCenter", project.code);
          updateField("projectName", project.name);
          setIsProjectNameDialogOpen(false);
        }}
      />
      <DefaultAccountDrawer
        isOpen={!isReadonly && isDefaultAccountDrawerOpen}
        mode="add"
        permissions={defaultAccountStore.permissions}
        onClose={() => setIsDefaultAccountDrawerOpen(false)}
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

type DisbursementVoucherActionTab = "details" | "attachments";

const DisbursementVoucherActionTabs = [
  { id: "details", label: "Voucher Details" },
  { id: "attachments", label: "File Attachments" },
] satisfies ModuleTabItem<DisbursementVoucherActionTab>[];

function DisbursementVoucherFileAttachmentFields({
  attachments,
  isReadonly,
  onAttachmentsChange,
}: {
  attachments: DisbursementAttachment[];
  isReadonly: boolean;
  onAttachmentsChange: (attachments: DisbursementAttachment[]) => void;
}) {
  const inputId = "disbursement-voucher-file-attachments";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);

    if (files.length === 0) {
      return;
    }

    const nextAttachments = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      sizeLabel: formatAttachmentSize(file.size),
    }));

    onAttachmentsChange([...attachments, ...nextAttachments]);
    event.currentTarget.value = "";
  }

  function removeAttachment(attachmentId: string) {
    onAttachmentsChange(
      attachments.filter((attachment) => attachment.id !== attachmentId),
    );
  }

  return (
    <section className="grid min-w-0 gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <label
        htmlFor={inputId}
        className={joinClasses(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-darknavy/20 bg-offwhite/35 p-5 text-center transition",
          isReadonly
            ? "cursor-not-allowed opacity-60"
            : "hover:border-skyblue/55 hover:bg-skyblue/5",
        )}
      >
        <Upload className="h-5 w-5 text-darknavy/70" aria-hidden="true" />
        <span className="text-sm font-semibold text-darknavy">
          Attach disbursement voucher files
        </span>
        <span className="text-xs text-darknavy/55">
          Choose one or more supporting documents.
        </span>
        <input
          id={inputId}
          name="disbursementVoucherAttachments"
          type="file"
          multiple
          disabled={isReadonly}
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      <div className="overflow-hidden rounded-lg border border-darknavy/10">
        <div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3 text-sm font-semibold text-darknavy">
          <Paperclip className="h-4 w-4 text-skyblue" aria-hidden="true" />
          Attachments
          <span className="rounded-full border border-darknavy/10 px-2 py-0.5 text-xs font-medium text-darknavy/60">
            {attachments.length}
          </span>
        </div>

        {attachments.length > 0 ? (
          <ul className="divide-y divide-darknavy/10">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-offwhite text-darknavy/70">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-darknavy">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-darknavy/55">
                      {attachment.sizeLabel}
                    </p>
                  </div>
                </div>

                {!isReadonly ? (
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-5 text-sm text-darknavy/55">
            No files attached yet.
          </p>
        )}
      </div>
    </section>
  );
}

function formatAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
  if (nextStatus === DisbursementVoucherStatuses.posted) {
    return canApproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.disapproved) {
    return canDisapproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.cancelled) {
    return canCancelDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.forApproval) {
    return (
      currentStatus === DisbursementVoucherStatuses.posted ||
      currentStatus === DisbursementVoucherStatuses.disapproved ||
      currentStatus === DisbursementVoucherStatuses.cancelled
    );
  }

  if (
    nextStatus === DisbursementVoucherStatuses.draft &&
    (currentStatus === DisbursementVoucherStatuses.posted ||
      currentStatus === DisbursementVoucherStatuses.disapproved)
  ) {
    return true;
  }

  if (
    nextStatus === DisbursementVoucherStatuses.draft ||
    nextStatus === DisbursementVoucherStatuses.forApproval
  ) {
    return currentStatus === DisbursementVoucherStatuses.cancelled;
  }

  return false;
}

function createVoucherActionReturnHref(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return `${DisbursementVoucherHref}/view/${transactionId}`;
  }

  return DisbursementVoucherHref;
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

type DisbursementEntryColumnId =
  | "accountCode"
  | "atcCode"
  | "accountName"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refId"
  | "responsibilityCenter"
  | "vatType"
  | "debit"
  | "credit";

type DisbursementEntryView = "accounting" | "expense";

type ExpenseEntryColumnId =
  | "expenseType"
  | "amount"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "netAmount"
  | "vatCode"
  | "vatPercent"
  | "vatAmount"
  | "ewtCode"
  | "ewtPercent"
  | "ewtAmount"
  | "totalAmountDue"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "responsibilityCenter"
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
  "totalAmountDue",
  "partyCode",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
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
  amount: "Gross Amount",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  netAmount: "Net Amount",
  vatCode: "VAT Type",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  ewtCode: "EWT Code",
  ewtPercent: "EWT %",
  ewtAmount: "EWT Amount",
  totalAmountDue: "Total Disbursement",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Remarks",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
};

const DefaultExpenseEntryColumnWidths: Record<ExpenseEntryColumnId, number> = {
  expenseType: 235,
  amount: 155,
  checkDate: 150,
  checkNo: 180,
  checkStatus: 160,
  netAmount: 145,
  vatCode: 190,
  vatPercent: 105,
  vatAmount: 135,
  ewtCode: 210,
  ewtPercent: 105,
  ewtAmount: 135,
  totalAmountDue: 165,
  partyCode: 150,
  partyName: 260,
  particulars: 320,
  responsibilityCenter: 220,
  refId: 180,
};

const DefaultDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refId",
  "checkNo",
  "checkStatus",
  "checkDate",
];

const DefaultVisibleDisbursementEntryColumnOrder: DisbursementEntryColumnId[] = [
  "accountName",
  "debit",
  "credit",
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
  atcCode: "EWT Code",
  checkDate: "Check Date",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  particulars: "Remarks",
  partyCode: "Party Code",
  partyName: "Party Name",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  vatType: "VAT Type",
  debit: "Debit",
  credit: "Credit",
};

const DefaultDisbursementEntryColumnWidths: Record<
  DisbursementEntryColumnId,
  number
> = {
  accountCode: 160,
  accountName: 260,
  atcCode: 140,
  checkDate: 150,
  checkNo: 180,
  checkStatus: 160,
  credit: 160,
  debit: 160,
  particulars: 320,
  partyCode: 150,
  partyName: 220,
  refId: 160,
  responsibilityCenter: 220,
  vatType: 150,
};

const AccountingPartyFallbackValuePrefix = "entry-party:";
const CashInHandAccountCode = "1001111";
const CashInHandAccountName = "Cash in Hand";
const InputVatAccountCode = "2010002011";
const InputVatAccountName = "Input VAT";
const ExpandedWithholdingTaxAccountCode = "2010002002";
const ExpandedWithholdingTaxAccountName = "Expanded Withholding Tax";
const MultiCheckColumnIds = new Set<string>([
  "checkNo",
  "checkStatus",
  "checkDate",
]);

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
    entry.id.startsWith("auto-credit-") ||
    entry.id.startsWith("payment-credit-") ||
    entry.id.startsWith("cash-in-hand-")
  );
}

function isGeneratedVatEntry(entry: DisbursementLineEntry) {
  return (
    entry.id.startsWith("auto-input-vat-") ||
    entry.accountName.trim().toLowerCase() === "input vat"
  );
}

function isGeneratedEwtEntry(entry: DisbursementLineEntry) {
  return (
    entry.id.startsWith("auto-ewt-") ||
    entry.accountName.trim().toLowerCase() === "expanded withholding tax"
  );
}

function isGeneratedAccountingEntry(entry: DisbursementLineEntry) {
  return (
    isPaymentCreditEntry(entry) ||
    isGeneratedVatEntry(entry) ||
    isGeneratedEwtEntry(entry)
  );
}

function shouldSyncDisbursementEntryParty(
  entry: DisbursementLineEntry,
  previousPartyCode: string,
  previousPartyName: string,
) {
  const entryPartyCode = (entry.partyCode ?? "").trim();
  const entryPartyName = (entry.partyName ?? "").trim();

  return (
    (!entryPartyCode && !entryPartyName) ||
    entryPartyCode === previousPartyCode ||
    entryPartyName === previousPartyName
  );
}

function applyVoucherPartyToEntryUpdates(
  entry: DisbursementLineEntry | undefined,
  updates: Partial<DisbursementLineEntry>,
  partyCode: string,
  partyName: string,
) {
  const hasAccountUpdate =
    Object.prototype.hasOwnProperty.call(updates, "accountCode") ||
    Object.prototype.hasOwnProperty.call(updates, "accountName");

  if (
    !hasAccountUpdate ||
    (entry?.partyCode ?? "").trim() ||
    (entry?.partyName ?? "").trim()
  ) {
    return updates;
  }

  return {
    ...updates,
    partyCode,
    partyName,
  };
}

function createAutomaticAccountingEntries(
  entries: DisbursementLineEntry[],
  options: {
    bankAccount?: DisbursementVoucherBankAccount | null;
    isCashPayment: boolean;
    paymentMethod: string;
  },
) {
  const editableExpenseEntries = entries
    .filter((entry) => !isGeneratedAccountingEntry(entry))
    .map((entry) => {
      const normalizedEntry = normalizeDisbursementLineEntryFields({
        ...entry,
        credit: 0,
      });
      const netEntryAmounts = getSignedAccountingEntryAmounts(
        normalizedEntry.taxDetails.netAmount,
        "debit",
      );

      return {
        ...normalizedEntry,
        debit: netEntryAmounts.debit,
        credit: netEntryAmounts.credit,
        status: "Balanced" as const,
      };
    });
  const expenseEntriesWithAmount = editableExpenseEntries.filter(
    (entry) =>
      hasNonZeroAccountingAmount(entry.taxDetails.grossAmount) ||
      hasNonZeroAccountingAmount(entry.debit) ||
      hasNonZeroAccountingAmount(entry.credit),
  );

  if (expenseEntriesWithAmount.length === 0) {
    return editableExpenseEntries;
  }

  const referenceEntry =
    expenseEntriesWithAmount[0] ?? editableExpenseEntries[0];
  const totalVatAmount = expenseEntriesWithAmount.reduce(
    (sum, entry) => sum + Number(entry.taxDetails.vatAmount || 0),
    0,
  );
  const totalEwtAmount = expenseEntriesWithAmount.reduce(
    (sum, entry) => sum + Number(entry.taxDetails.ewtAmount || 0),
    0,
  );
  const totalDisbursementAmount = expenseEntriesWithAmount.reduce(
    (sum, entry) => sum + Number(entry.taxDetails.amount || 0),
    0,
  );
  const commonFields = {
    partyCode: referenceEntry?.partyCode ?? "",
    partyName: referenceEntry?.partyName ?? "",
    refId: referenceEntry?.refId ?? "",
    responsibilityCenter: referenceEntry?.responsibilityCenter ?? "",
  };
  const generatedEntries: DisbursementLineEntry[] = [];

  if (hasNonZeroAccountingAmount(totalVatAmount)) {
    const vatEntryAmounts = getSignedAccountingEntryAmounts(totalVatAmount, "debit");

    generatedEntries.push(
      {
        ...createBlankDisbursementLineEntry(),
        ...commonFields,
        accountCode: InputVatAccountCode,
        accountName: InputVatAccountName,
        debit: vatEntryAmounts.debit,
        credit: vatEntryAmounts.credit,
        id: "auto-input-vat-current",
        particulars: "Input VAT",
        taxDetails: {
          ...createTaxDetails(totalVatAmount, "0%"),
          ...commonFields,
        },
        taxRate: "0%",
        vatType: "Input VAT",
        status: "Balanced",
      },
    );
  }

  if (hasNonZeroAccountingAmount(totalEwtAmount)) {
    const ewtEntryAmounts = getSignedAccountingEntryAmounts(totalEwtAmount, "credit");

    generatedEntries.push(
      {
        ...createBlankDisbursementLineEntry(),
        ...commonFields,
        accountCode: ExpandedWithholdingTaxAccountCode,
        accountName: ExpandedWithholdingTaxAccountName,
        atcCode: referenceEntry?.taxDetails.ewtCode ?? "",
        debit: ewtEntryAmounts.debit,
        credit: ewtEntryAmounts.credit,
        id: "auto-ewt-current",
        particulars: "Expanded Withholding Tax",
        taxDetails: {
          ...createTaxDetails(totalEwtAmount, "0%"),
          ...commonFields,
          atcCode: referenceEntry?.taxDetails.ewtCode ?? "",
        },
        taxRate: "0%",
        vatType: "EWT",
        status: "Balanced",
      },
    );
  }

  if (
    hasNonZeroAccountingAmount(totalDisbursementAmount) &&
    (options.isCashPayment || options.bankAccount)
  ) {
    const creditAccount = options.isCashPayment
      ? {
          accountCode: CashInHandAccountCode,
          accountName: CashInHandAccountName,
        }
      : {
          accountCode: options.bankAccount?.accountCode ?? "",
          accountName: options.bankAccount?.accountTitle ?? "",
        };
    const paymentEntryAmounts = getSignedAccountingEntryAmounts(
      totalDisbursementAmount,
      "credit",
    );

    generatedEntries.push(
      {
        ...createBlankDisbursementLineEntry(),
        ...commonFields,
        accountCode: creditAccount.accountCode,
        accountName: creditAccount.accountName,
        debit: paymentEntryAmounts.debit,
        credit: paymentEntryAmounts.credit,
        id: "auto-credit-current",
        particulars: `Settlement via ${options.paymentMethod || "payment"}`,
        taxDetails: {
          ...createTaxDetails(totalDisbursementAmount, "0%"),
          ...commonFields,
        },
        taxRate: "0%",
        vatType: "",
        status: "Balanced",
      },
    );
  }

  return [...editableExpenseEntries, ...generatedEntries];
}

function getSignedAccountingEntryAmounts(
  value: number,
  positiveSide: "credit" | "debit",
) {
  const roundedValue = roundAccountingAmount(value);
  const amount = Math.abs(roundedValue);
  const isDebitSide =
    roundedValue >= 0 ? positiveSide === "debit" : positiveSide === "credit";

  return {
    credit: isDebitSide ? 0 : amount,
    debit: isDebitSide ? amount : 0,
  };
}

function hasNonZeroAccountingAmount(value: number) {
  return Math.abs(roundAccountingAmount(value)) > 0;
}

function roundAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function VoucherDataEntry({
  bankAccount,
  canAddExpenseType,
  canAddPartyName,
  canAddResponsibilityCenter,
  defaultAccounts,
  entries,
  errors,
  isReadonly,
  isMultiCheckNumber,
  onAddEntries,
  onAddExpenseType,
  onAddPartyName,
  onAddResponsibilityCenter,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onReplaceEntries,
  onUpdateEntry,
  onUpdateEntryFields,
  paymentMethod,
  paymentTypeRecord,
  partyCode,
  partyName,
  totalCredit,
  totalDebit,
  onRemoveEntry,
}: {
  bankAccount: DisbursementVoucherBankAccount | null;
  canAddExpenseType: boolean;
  canAddPartyName: boolean;
  canAddResponsibilityCenter: boolean;
  defaultAccounts: DefaultAccount[];
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  isMultiCheckNumber: boolean;
  onAddEntries: (count: number) => void;
  onAddExpenseType: () => void;
  onAddPartyName: () => void;
  onAddResponsibilityCenter: () => void;
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
  partyCode: string;
  partyName: string;
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
}) {
  const variance = Math.abs(totalDebit - totalCredit);
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
  const hasMultiCheckNumberColumn =
    isMultiCheckNumber &&
    getPaymentTypeDetailKind(paymentMethod, paymentTypeRecord) === "with-bank";
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId)
      ? hasMultiCheckNumberColumn
      : visibleColumnIds.includes(columnId),
  );
  const visibleExpenseColumnOrder = expenseColumnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId)
      ? hasMultiCheckNumberColumn
      : visibleExpenseColumnIds.includes(columnId),
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
    () => entries.filter((entry) => !isGeneratedAccountingEntry(entry)),
    [entries],
  );
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => {
      const options: AppAdvancedDropdownOption[] = [
        ...DisbursementVoucherPartyOptions,
      ];
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
    [entries],
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
    const currentEntry = entries.find((entry) => entry.id === entryId);
    const nextUpdates = applyVoucherPartyToEntryUpdates(
      currentEntry,
      updates,
      partyCode,
      partyName,
    );
    const isCashPayment =
      paymentTypeRecord?.type === "Cash" ||
      paymentMethod.trim().toLowerCase() === "cash";
    const updatedEntries = entries.map((entry) =>
      entry.id === entryId
        ? syncDisbursementLineEntryTaxDetails({
            ...entry,
            ...nextUpdates,
          })
        : entry,
    );

    onReplaceEntries(
      createAutomaticAccountingEntries(updatedEntries, {
        bankAccount,
        isCashPayment,
        paymentMethod,
      }),
    );
  }, [
    bankAccount,
    entries,
    onReplaceEntries,
    partyCode,
    partyName,
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
      checkNo: {
        header: columnLabels.checkNo,
        id: "checkNo",
        width: columnWidths.checkNo,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.checkNo ?? ""}
            onChange={(value) => onUpdateEntry(entry.id, "checkNo", value)}
            disabled={isReadonly}
          />
        ),
      },
      checkStatus: {
        header: columnLabels.checkStatus,
        id: "checkStatus",
        width: columnWidths.checkStatus,
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.checkStatus ?? ""}
            onChange={(value) => onUpdateEntry(entry.id, "checkStatus", value)}
            disabled={isReadonly}
          />
        ),
      },
      checkDate: {
        header: columnLabels.checkDate,
        id: "checkDate",
        width: columnWidths.checkDate,
        widthClassName: "w-[10rem]",
        renderCell: (entry) => (
          <input
            type="date"
            value={entry.checkDate ?? ""}
            disabled={isReadonly}
            onChange={(event) =>
              onUpdateEntry(entry.id, "checkDate", event.target.value)
            }
            className={accountingCellControlClassName()}
          />
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
            addAction={
              !isReadonly && canAddPartyName
                ? {
                    label: "Add Party Name",
                    onClick: onAddPartyName,
                  }
                : undefined
            }
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
            addAction={
              !isReadonly && canAddResponsibilityCenter
                ? {
                    label: "Add Responsibility Center",
                    onClick: onAddResponsibilityCenter,
                  }
                : undefined
            }
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
        renderCell: (entry) => {
          const vatType = entry.vatType ?? "";

          if (vatType && !vatOptions.some((option) => option.value === vatType)) {
            return (
              <EntryInput
                value={vatType}
                onChange={(value) => onUpdateEntry(entry.id, "vatType", value)}
                disabled={isReadonly}
              />
            );
          }

          return (
            <AppAdvancedDropdown
              value={vatType}
              readOnly={isReadonly}
              isClearable
              options={vatOptions}
              placeholder="Select VAT"
              searchPlaceholder="Search VAT rate or description"
              className={AccountingDropdownClassName}
              onChange={(value) =>
                onUpdateEntry(entry.id, "vatType", String(value))
              }
            />
          );
        },
      },
      atcCode: {
        header: columnLabels.atcCode,
        id: "atcCode",
        width: columnWidths.atcCode,
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <AppAdvancedDropdown
            value={entry.atcCode ?? ""}
            readOnly={isReadonly}
            isClearable
            options={ewtOptions}
            placeholder="Select EWT"
            searchPlaceholder="Search EWT code, rate, or description"
            className={AccountingDropdownClassName}
            onChange={(value) =>
              onUpdateEntry(entry.id, "atcCode", String(value))
            }
          />
        ),
      },
    }),
    [
      chartAccounts,
      columnLabels,
      columnWidths,
      canAddPartyName,
      canAddResponsibilityCenter,
      ewtOptions,
      isReadonly,
      onAddPartyName,
      onAddResponsibilityCenter,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
      responsibilityCenterOptions,
      setParticularsEditorEntryId,
      vatOptions,
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
            addAction={
              !isReadonly && canAddExpenseType
                ? {
                  label: "Add Expense Type",
                  onClick: onAddExpenseType,
                }
                : undefined
            }
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
            allowNegative
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
      checkNo: {
        ...allColumns.checkNo,
        header: expenseColumnLabels.checkNo,
        id: "checkNo",
        width: expenseColumnWidths.checkNo,
      },
      checkStatus: {
        ...allColumns.checkStatus,
        header: expenseColumnLabels.checkStatus,
        id: "checkStatus",
        width: expenseColumnWidths.checkStatus,
      },
      checkDate: {
        ...allColumns.checkDate,
        header: expenseColumnLabels.checkDate,
        id: "checkDate",
        width: expenseColumnWidths.checkDate,
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
      totalAmountDue: {
        header: expenseColumnLabels.totalAmountDue,
        id: "totalAmountDue",
        width: expenseColumnWidths.totalAmountDue,
        widthClassName: "w-[10rem]",
        renderCell: (entry) => (
          <ExpenseDetailValue value={entry.taxDetails.amount} />
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
      responsibilityCenter: {
        ...allColumns.responsibilityCenter,
        header: expenseColumnLabels.responsibilityCenter,
        id: "responsibilityCenter",
        width: expenseColumnWidths.responsibilityCenter,
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
      canAddExpenseType,
      onAddExpenseType,
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
      columnOrder
        .filter(
          (columnId) =>
            !MultiCheckColumnIds.has(columnId) || hasMultiCheckNumberColumn,
        )
        .map((columnId) => ({
          id: columnId,
          isHideable:
            MultiCheckColumnIds.has(columnId)
              ? false
              : !ProtectedDisbursementEntryColumnIds.has(columnId),
          isVisible:
            MultiCheckColumnIds.has(columnId) || visibleColumnIds.includes(columnId),
          label: columnLabels[columnId],
          width: columnWidths[columnId],
          widthMode: "fixed",
        })),
    [
      columnLabels,
      columnOrder,
      columnWidths,
      hasMultiCheckNumberColumn,
      visibleColumnIds,
    ],
  );
  const expenseColumnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      expenseColumnOrder
        .filter(
          (columnId) =>
            !MultiCheckColumnIds.has(columnId) || hasMultiCheckNumberColumn,
        )
        .map((columnId) => ({
          id: columnId,
          isHideable:
            MultiCheckColumnIds.has(columnId)
              ? false
              : !ProtectedExpenseEntryColumnIds.has(columnId),
          isVisible:
            MultiCheckColumnIds.has(columnId) ||
            visibleExpenseColumnIds.includes(columnId),
          label: expenseColumnLabels[columnId],
          width: expenseColumnWidths[columnId],
          widthMode: "fixed",
        })),
    [
      expenseColumnLabels,
      expenseColumnOrder,
      expenseColumnWidths,
      hasMultiCheckNumberColumn,
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
              : {
                amount: formatAccountingAmount(
                  getExpenseEntryColumnTotal(entries, "amount"),
                ),
                ewtAmount: formatAccountingAmount(
                  getExpenseEntryColumnTotal(entries, "ewtAmount"),
                ),
                netAmount: formatAccountingAmount(
                  getExpenseEntryColumnTotal(entries, "netAmount"),
                ),
                totalAmountDue: formatAccountingAmount(
                  getExpenseEntryColumnTotal(entries, "totalAmountDue"),
                ),
                vatAmount: formatAccountingAmount(
                  getExpenseEntryColumnTotal(entries, "vatAmount"),
                ),
              }
          }
          summaryRowHeader="Totals"
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

function getExpenseEntryColumnTotal(
  entries: DisbursementLineEntry[],
  columnId: "amount" | "ewtAmount" | "netAmount" | "totalAmountDue" | "vatAmount",
) {
  return entries.reduce((sum, entry) => {
    switch (columnId) {
      case "amount":
        return sum + Number(entry.taxDetails.grossAmount || 0);
      case "ewtAmount":
        return sum + Number(entry.taxDetails.ewtAmount || 0);
      case "netAmount":
        return sum + Number(entry.taxDetails.netAmount || 0);
      case "totalAmountDue":
        return sum + Number(entry.taxDetails.amount || 0);
      case "vatAmount":
        return sum + Number(entry.taxDetails.vatAmount || 0);
      default:
        return sum;
    }
  }, 0);
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
        aria-label="Open remarks"
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
      title="Remarks"
      subtitle={entry?.accountName || "Accounting entry"}
      textareaId="disbursement-entry-remarks-dialog-text"
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
    case "checkNo":
      return entry.checkNo ?? "";
    case "checkStatus":
      return entry.checkStatus ?? "";
    case "checkDate":
      return entry.checkDate ?? "";
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
  allowNegative = false,
  disabled = false,
  onChange,
  value,
}: {
  allowNegative?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing
    ? draftValue
    : value !== 0
      ? formatMoneyNumberInput(String(value), allowNegative)
      : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <MoneyNumberField
      allowNegative={allowNegative}
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
    (entry.checkDate ?? "").trim() !== "" ||
    (entry.checkNo ?? "").trim() !== "" ||
    (entry.checkStatus ?? "").trim() !== "" ||
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
