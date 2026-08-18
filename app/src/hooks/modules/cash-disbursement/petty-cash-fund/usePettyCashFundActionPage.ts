"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  PettyCashFundPartyOptions,
  PettyCashFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  calculatePettyCashFundTotals,
  createBlankPettyCashFundItem,
  createPettyCashFundFormValues,
  createPettyCashFundRecord,
  formatPettyCashFundAmount,
  PettyCashFundCopyFromRecords,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import {
  createNextPettyCashFundNumber,
  getPettyCashFundRecords,
  savePettyCashFundRecords,
  upsertPettyCashFundRecord,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundService";
import type {
  PettyCashFundActionMode,
  PettyCashFundActionTab,
  PettyCashFundBoolean,
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { validatePettyCashFundForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-fund/PettyCashFundValidation";
import { parseAmount } from "@/app/src/utils/number.util";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";

export function usePettyCashFundActionPage(options: { onSaved?: () => void } = {}) {
  const transactionCurrency = useTransactionCurrency();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode: PettyCashFundActionMode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
  const initialRecord = mode === "add" ? undefined : getPettyCashFundRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<PettyCashFundFormValues>(() =>
    createPettyCashFundFormValues(initialRecord, createNextPettyCashFundNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashFundActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isReadonly = mode === "view";
  const totals = useMemo(() => calculatePettyCashFundTotals(values.items), [values.items]);

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof PettyCashFundFormValues>(field: TKey, value: PettyCashFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItem(rowId: string, updates: Partial<PettyCashFundItem>) {
    if (isReadonly) return;
    updateField(
      "items",
      values.items.map((item) => (item.id === rowId ? calculateItem({ ...item, ...updates }) : item)),
    );
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, exchangeRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);

      if (exchangeRate != null) {
        updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function updateItems(items: PettyCashFundItem[]) {
    updateField("items", items);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankPettyCashFundItem)]);
  }

  function removeItem(rowId: string) {
    if (values.items.length > 1) updateItems(values.items.filter((item) => item.id !== rowId));
  }

  function duplicateItem(rowId: string) {
    const item = values.items.find((row) => row.id === rowId);
    if (item) updateItems([...values.items, { ...item, id: createBlankPettyCashFundItem().id }]);
  }

  function insertItem(rowId: string, position: "above" | "below") {
    const index = values.items.findIndex((item) => item.id === rowId);
    if (index < 0) return;
    const next = [...values.items];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashFundItem());
    updateItems(next);
  }

  function moveItem(fromRowId: string, toRowId: string) {
    if (fromRowId === toRowId) return;
    const fromIndex = values.items.findIndex((item) => item.id === fromRowId);
    const toIndex = values.items.findIndex((item) => item.id === toRowId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateItems(next);
  }

  function copyFrom(recordIds: string[]) {
    if (isReadonly) return;
    const source = PettyCashFundCopyFromRecords.find((item) => recordIds.includes(item.id));
    if (!source) {
      toast.error("Select a Petty Cash Voucher to copy.");
      return;
    }
    const party = PettyCashFundPartyOptions.find((option) => option.name === source.partyName);
    const amount = formatPettyCashFundAmount(Number(source.amount?.replace(/,/g, "")) || 0);
    setValues((current) => ({
      ...current,
      partyCode: String(party?.value ?? ""),
      partyName: source.partyName ?? "",
      remarks: source.remarks ?? "",
      items: [
        {
          ...createBlankPettyCashFundItem(),
          amount,
          date: source.documentDate ?? current.documentDate,
          grossAmount: amount,
          netAmount: amount,
          particulars: source.remarks ?? "",
          payeeCode: String(party?.value ?? ""),
          payeeName: source.partyName ?? "",
        },
      ],
    }));
    setErrors({});
    toast.success(`Copied details from ${source.sourceNo}.`);
  }

  function save(status: PettyCashFundStatus) {
    const nextErrors = status === PettyCashFundStatuses.draft ? {} : validatePettyCashFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted petty cash fund fields.");
      return false;
    }
    const nextRecord = createPettyCashFundRecord(values, status, mode === "edit" ? record : undefined);
    savePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundFormValues(nextRecord));
    toast.success(status === PettyCashFundStatuses.draft ? "Petty cash fund saved as draft." : "Petty cash fund submitted for approval.");
    options.onSaved?.();
    return true;
  }

  function updateStatus(status: PettyCashFundStatus) {
    if (!record) return false;
    const nextRecord = createPettyCashFundRecord(values, status, record);
    savePettyCashFundRecords(upsertPettyCashFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createPettyCashFundFormValues(nextRecord));
    toast.success(`Petty cash fund marked as ${status}.`);
    return true;
  }

  return {
    activeTab,
    addItems,
    copyFrom,
    currencyOptions: transactionCurrency.currencyOptions,
    duplicateItem,
    errors,
    isReadonly,
    isPreviewOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isRecordMissing: mode !== "add" && !initialRecord,
    insertItem,
    mode,
    moveItem,
    record,
    removeItem,
    save,
    setActiveTab,
    setIsPreviewOpen,
    totals,
    updateField,
    updateCurrency,
    updateItem,
    updateItems,
    updateStatus,
    values,
  };
}

function calculateItem(item: PettyCashFundItem): PettyCashFundItem {
  const amount = parseAmount(item.amount) ?? 0;
  const rate = item.vatable === "True" ? 0.12 : 0;
  const vat = rate ? (item.vatInclusive === "True" ? amount - amount / (1 + rate) : amount * rate) : 0;
  const net = item.vatInclusive === "True" ? amount - vat : amount;
  const gross = item.vatInclusive === "True" ? amount : amount + vat;
  return {
    ...item,
    netAmount: formatPettyCashFundAmount(net),
    vatAmount: formatPettyCashFundAmount(vat),
    grossAmount: formatPettyCashFundAmount(gross),
    vatable: item.vatable as PettyCashFundBoolean,
  };
}

export type { PettyCashFundActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
