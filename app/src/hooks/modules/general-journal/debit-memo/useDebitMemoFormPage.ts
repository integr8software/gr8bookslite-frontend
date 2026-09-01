"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DebitMemoHref } from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import {
  createDebitMemoAccountingEntry,
  createDebitMemoFormValues,
  getDebitMemoAccountingTotals,
  renumberDebitMemoAccountingEntries,
} from "@/app/src/data/modules/general-journal/debit-memo/DebitMemoData";
import {
  saveDebitMemoRecord,
  useDebitMemoStore,
} from "@/app/src/hooks/modules/general-journal/debit-memo/useDebitMemo";
import type {
  ModuleDataEntryClearAction,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type {
  DebitMemoAccountingEntryField,
  DebitMemoActionMode,
  DebitMemoFormErrors,
  DebitMemoFormValues,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import { validateDebitMemoForm } from "@/app/src/validations/modules/general-journal/debit-memo/DebitMemoValidation";

export function useDebitMemoFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getActionMode(pathname);
  const store = useDebitMemoStore();
  const existingRecord = store.findRecord(params.recordId);
  const isReadonly = mode === "view" || existingRecord?.status === "Posted";
  const [values, setValues] = useState<DebitMemoFormValues>(() =>
    createDebitMemoFormValues(existingRecord),
  );
  const [errors, setErrors] = useState<DebitMemoFormErrors>({});
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pendingSaveValues, setPendingSaveValues] =
    useState<DebitMemoFormValues | null>(null);
  const accountingTotals = useMemo(
    () => getDebitMemoAccountingTotals(values.accountingEntries),
    [values.accountingEntries],
  );
  const needsRecord = mode !== "add";

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const field = event.target.name as keyof DebitMemoFormValues;
    const value =
      field === "exchangeRate" || field === "amount"
        ? Number(event.target.value || 0)
        : event.target.value;

    updateHeaderField(field, value as DebitMemoFormValues[typeof field]);
  }

  function updateHeaderField<TKey extends keyof DebitMemoFormValues>(
    field: TKey,
    value: DebitMemoFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateAccountingEntry(
    entryId: string,
    field: DebitMemoAccountingEntryField,
    value: string | number,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountingEntries: current.accountingEntries.map((entry) =>
        entry.id === entryId
          ? normalizeAccountingEntryUpdate(entry, field, value)
          : entry,
      ),
    }));
    setErrors((current) => ({
      ...current,
      balance: undefined,
      accountingEntryErrors: {
        ...current.accountingEntryErrors,
        [entryId]: {
          ...current.accountingEntryErrors?.[entryId],
          [field]: undefined,
        },
      },
    }));
  }

  function addAccountingEntries(count = 1) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountingEntries: [
        ...current.accountingEntries,
        ...Array.from({ length: count }, (_, index) =>
          createDebitMemoAccountingEntry(current.accountingEntries.length + index + 1, {
            partyCode: current.partyCode,
            partyName: current.partyName,
            particulars: current.remarks,
            refNo: current.referenceNo,
          }),
        ),
      ],
    }));
  }

  function removeAccountingEntry(entryId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries = current.accountingEntries.filter(
        (entry) => entry.id !== entryId,
      );

      return {
        ...current,
        accountingEntries: renumberDebitMemoAccountingEntries(
          nextEntries.length > 0
            ? nextEntries
            : [createDebitMemoAccountingEntry(1)],
        ),
      };
    });
  }

  function insertAccountingEntry(entryId: string, position: "above" | "below") {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === entryId,
      );
      const insertIndex =
        rowIndex === -1
          ? current.accountingEntries.length
          : rowIndex + (position === "below" ? 1 : 0);
      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(
        insertIndex,
        0,
        createDebitMemoAccountingEntry(insertIndex + 1, {
          partyCode: current.partyCode,
          partyName: current.partyName,
          particulars: current.remarks,
          refNo: current.referenceNo,
        }),
      );

      return {
        ...current,
        accountingEntries: renumberDebitMemoAccountingEntries(nextEntries),
      };
    });
  }

  function duplicateAccountingEntry(entryId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === entryId,
      );
      const sourceEntry = current.accountingEntries[rowIndex];

      if (!sourceEntry) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(rowIndex + 1, 0, {
        ...sourceEntry,
        id: `dm-entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });

      return {
        ...current,
        accountingEntries: renumberDebitMemoAccountingEntries(nextEntries),
      };
    });
  }

  function moveAccountingEntry(fromEntryId: string, toEntryId: string) {
    if (isReadonly || fromEntryId === toEntryId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === fromEntryId,
      );
      const toIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === toEntryId,
      );

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];
      const [movedEntry] = nextEntries.splice(fromIndex, 1);

      nextEntries.splice(toIndex, 0, movedEntry);

      return {
        ...current,
        accountingEntries: renumberDebitMemoAccountingEntries(nextEntries),
      };
    });
  }

  function clearAccountingEntries(action: ModuleDataEntryClearAction) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries =
        action === "all"
          ? []
          : current.accountingEntries.filter(
              (entry) => !shouldClearAccountingEntry(entry, action),
            );

      return {
        ...current,
        accountingEntries: renumberDebitMemoAccountingEntries(
          nextEntries.length > 0 ? nextEntries : [createDebitMemoAccountingEntry(1)],
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly) {
      return;
    }

    const nextErrors = validateDebitMemoForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    setPendingSaveValues(values);
    setIsSaveDialogOpen(true);
  }

  async function handleConfirmSaveVoucher() {
    if (!pendingSaveValues) {
      setIsSaveDialogOpen(false);
      return;
    }

    try {
      if (mode === "edit" && existingRecord) {
        await store.updateRecord(saveDebitMemoRecord(existingRecord, pendingSaveValues));
        toast.success("Debit Memo updated.");
      } else {
        await store.addRecord(pendingSaveValues);
        toast.success("Debit Memo saved.");
      }

      router.push(DebitMemoHref);
    } finally {
      setIsSaveDialogOpen(false);
      setPendingSaveValues(null);
    }
  }

  async function handleConfirmCancelVoucher() {
    if (!existingRecord) {
      setIsCancelDialogOpen(false);
      return;
    }

    await store.updateStatus(existingRecord.id, "Cancelled");
    toast.success("Debit Memo cancelled.");
    setIsCancelDialogOpen(false);
    router.push(DebitMemoHref);
  }

  return {
    accountingTotals,
    addAccountingEntries,
    clearAccountingEntries,
    duplicateAccountingEntry,
    errors,
    existingRecord,
    handleCancelSaveVoucher: () => {
      setIsSaveDialogOpen(false);
      setPendingSaveValues(null);
    },
    handleConfirmCancelVoucher,
    handleConfirmSaveVoucher,
    handleInputChange,
    handleSubmit,
    isAccountingEntriesReadonly: isReadonly,
    isCancelDialogOpen,
    isMutating: false,
    isReadonly,
    isSaveDialogOpen,
    mode,
    moveAccountingEntry,
    needsRecord,
    removeAccountingEntry,
    setIsCancelDialogOpen,
    insertAccountingEntry,
    updateAccountingEntry,
    updateHeaderField,
    values,
  };
}

function shouldClearAccountingEntry(
  entry: DebitMemoFormValues["accountingEntries"][number],
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return accountingEntryHasData(entry);
  }

  if (action === "incomplete") {
    return accountingEntryHasData(entry) && !accountingEntryIsComplete(entry);
  }

  return !accountingEntryHasData(entry);
}

function accountingEntryHasData(
  entry: DebitMemoFormValues["accountingEntries"][number],
) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.atcCode.trim() !== "" ||
    entry.partyCode.trim() !== "" ||
    entry.partyName.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.refNo.trim() !== "" ||
    Number(entry.debit || 0) > 0 ||
    Number(entry.credit || 0) > 0
  );
}

function accountingEntryIsComplete(
  entry: DebitMemoFormValues["accountingEntries"][number],
) {
  const hasDebit = Number(entry.debit || 0) > 0;
  const hasCredit = Number(entry.credit || 0) > 0;

  return (
    entry.accountCode.trim() !== "" &&
    entry.accountTitle.trim() !== "" &&
    (hasDebit || hasCredit) &&
    !(hasDebit && hasCredit)
  );
}

function getActionMode(pathname: string): DebitMemoActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function normalizeAccountingEntryUpdate<
  TField extends DebitMemoAccountingEntryField,
>(
  entry: DebitMemoFormValues["accountingEntries"][number],
  field: TField,
  value: string | number,
) {
  const nextValue =
    field === "debit" || field === "credit" ? Number(value || 0) : value;

  return {
    ...entry,
    [field]: nextValue,
  };
}
