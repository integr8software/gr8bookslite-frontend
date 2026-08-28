"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BankReconciliationHref } from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import {
  calculateBankReconciliationTotals,
  createDefaultBankReconciliationFormValues,
} from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import {
  useBankReconciliationDetailQuery,
  useSaveBankReconciliationMutation,
  useUpdateBankReconciliationStatusMutation,
} from "@/app/src/hooks/modules/cash-receipt/bank-reconciliation/useBankReconciliation";
import {
  parseAndAutoMatchBankStatement,
} from "@/app/src/services/modules/cash-receipt/bank-reconciliation/BankReconciliationApi";
import type {
  BankMasterfile,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import type {
  BankReconciliationActionMode,
  BankReconciliationFormErrors,
  BankReconciliationFormValues,
  BankReconciliationTabKey,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
import { validateBankReconciliationForm } from "@/app/src/validations/modules/cash-receipt/bank-reconciliation/BankReconciliationValidation";

export function useBankReconciliationFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getActionMode(pathname);
  const { data: existingRecord, isLoading: isRecordLoading } =
    useBankReconciliationDetailQuery(params.recordId);

  const saveMutation = useSaveBankReconciliationMutation();
  const updateStatusMutation = useUpdateBankReconciliationStatusMutation();

  const isReadonly =
    mode === "view" || existingRecord?.status === "Posted";
  const needsRecord = mode !== "add";

  const [values, setValues] = useState<BankReconciliationFormValues>(() =>
    createDefaultBankReconciliationFormValues(existingRecord),
  );
  const [errors, setErrors] = useState<BankReconciliationFormErrors>({});

  // Active Tab & Selection State
  const [activeTab, setActiveTab] =
    useState<BankReconciliationTabKey>("deposit-in-transit");
  const [tabSearchQuery, setTabSearchQuery] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  // File Upload State for Smart Recon
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Confirmation Dialogs
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Re-sync when existingRecord loads in edit/view
  const syncRecordValues = useCallback(() => {
    if (existingRecord) {
      setValues(createDefaultBankReconciliationFormValues(existingRecord));
    }
  }, [existingRecord]);

  useMemo(() => {
    if (existingRecord) {
      syncRecordValues();
    }
  }, [existingRecord, syncRecordValues]);

  // Recalculate totals whenever balances or items change
  const totals = useMemo(() => {
    return calculateBankReconciliationTotals(
      values.bookBalance,
      values.bankBalance,
      values.checkingItems,
    );
  }, [values.bookBalance, values.bankBalance, values.checkingItems]);

  function updateHeaderField<TKey extends keyof BankReconciliationFormValues>(
    field: TKey,
    value: BankReconciliationFormValues[TKey],
  ) {
    if (isReadonly) return;

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const field = event.target.name as keyof BankReconciliationFormValues;
    const rawVal = event.target.value;
    const value =
      field === "bookBalance" || field === "bankBalance"
        ? Number(rawVal || 0)
        : rawVal;

    updateHeaderField(field, value as BankReconciliationFormValues[typeof field]);
  }

  function selectBankAccount(bank: BankMasterfile | null) {
    if (!bank) {
      updateHeaderField("bankId", "");
      updateHeaderField("bankName", "");
      updateHeaderField("accountCode", "");
      updateHeaderField("accountTitle", "");
      return;
    }

    updateHeaderField("bankId", bank.id);
    updateHeaderField("bankName", bank.bankName);
    updateHeaderField("accountCode", bank.accountCode);
    updateHeaderField("accountTitle", bank.accountTitle);
    updateHeaderField("currency", bank.currencyCode);
  }

  // Row Selection in Tabs
  function toggleSelectRow(id: string) {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll(itemIds: string[], select: boolean) {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      itemIds.forEach((id) => {
        if (select) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }

  // Clear Action: Moves selected rows from Tab 1 or Tab 2 to Tab 3 (Cleared)
  function handleClearSelected() {
    if (isReadonly || selectedItemIds.size === 0) return;

    setValues((current) => ({
      ...current,
      checkingItems: current.checkingItems.map((item) =>
        selectedItemIds.has(item.id)
          ? { ...item, isCleared: true, isAutoMatched: false }
          : item,
      ),
    }));

    const count = selectedItemIds.size;
    setSelectedItemIds(new Set());
    toast.success(`Cleared ${count} transaction(s).`);
  }

  // Unclear Action: Moves selected rows from Tab 3 back to uncleared
  function handleUnclearSelected() {
    if (isReadonly || selectedItemIds.size === 0) return;

    setValues((current) => ({
      ...current,
      checkingItems: current.checkingItems.map((item) =>
        selectedItemIds.has(item.id)
          ? { ...item, isCleared: false, isAutoMatched: false }
          : item,
      ),
    }));

    const count = selectedItemIds.size;
    setSelectedItemIds(new Set());
    toast.success(`Uncleared ${count} transaction(s).`);
  }

  // Smart Recon Upload Handler
  async function handleUploadStatement() {
    if (!selectedFile) {
      toast.error("Please choose a statement file to upload.");
      return;
    }

    if (!values.bankTemplate) {
      toast.error("Please select a Bank Template.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await parseAndAutoMatchBankStatement(
        selectedFile,
        values.bankTemplate,
        values.checkingItems,
      );

      setValues((current) => ({
        ...current,
        statementFileName: selectedFile.name,
        checkingItems: result.updatedItems,
      }));

      toast.success(
        `Smart Recon: Automatically cleared ${result.clearedCount} matched transaction(s).`,
      );
    } catch {
      toast.error("Failed to parse statement file.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReadonly) return;

    const payload: BankReconciliationFormValues = {
      ...values,
      outstandingCheck: totals.outstandingCheck,
      depositInTransit: totals.depositInTransit,
      adjustedBookBalance: totals.adjustedBookBalance,
      adjustedBankBalance: totals.adjustedBankBalance,
      variance: totals.variance,
    };

    const validation = validateBankReconciliationForm(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please resolve the validation errors before saving.");
      return;
    }

    setIsSaveDialogOpen(true);
  }

  async function handleConfirmSave() {
    setIsSaveDialogOpen(false);
    const payload: BankReconciliationFormValues = {
      ...values,
      outstandingCheck: totals.outstandingCheck,
      depositInTransit: totals.depositInTransit,
      adjustedBookBalance: totals.adjustedBookBalance,
      adjustedBankBalance: totals.adjustedBankBalance,
      variance: totals.variance,
    };

    await saveMutation.mutateAsync({
      id: params.recordId,
      values: payload,
    });
    router.push(BankReconciliationHref);
  }

  async function handleConfirmCancel() {
    setIsCancelDialogOpen(false);
    if (!params.recordId) return;

    await updateStatusMutation.mutateAsync({
      id: params.recordId,
      status: "Cancelled",
    });
    router.push(BankReconciliationHref);
  }

  return {
    activeTab,
    existingRecord,
    errors,
    handleClearSelected,
    handleConfirmCancel,
    handleConfirmSave,
    handleInputChange,
    handleSubmit,
    handleUnclearSelected,
    handleUploadStatement,
    isCancelDialogOpen,
    isMutating: saveMutation.isPending || updateStatusMutation.isPending,
    isReadonly,
    isRecordLoading,
    isSaveDialogOpen,
    isUploading,
    mode,
    needsRecord,
    selectedFile,
    selectedItemIds,
    selectBankAccount,
    setActiveTab,
    setIsCancelDialogOpen,
    setIsSaveDialogOpen,
    setSelectedFile,
    setTabSearchQuery,
    tabSearchQuery,
    toggleSelectAll,
    toggleSelectRow,
    totals,
    updateHeaderField,
    values,
  };
}

function getActionMode(pathname: string): BankReconciliationActionMode {
  if (pathname.includes("/add")) return "add";
  if (pathname.includes("/view")) return "view";
  return "edit";
}
