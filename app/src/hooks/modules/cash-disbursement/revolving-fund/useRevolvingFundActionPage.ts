"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  RevolvingFundPartyOptions,
  RevolvingFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  calculateRevolvingFundTotals,
  createBlankRevolvingFundItem,
  createRevolvingFundFormValues,
  createRevolvingFundRecord,
  formatRevolvingFundAmount,
  RevolvingFundCopyFromRecords,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import {
  createNextRevolvingFundNumber,
  getRevolvingFundRecords,
  saveRevolvingFundRecords,
  upsertRevolvingFundRecord,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundService";
import type {
  RevolvingFundActionMode,
  RevolvingFundActionTab,
  RevolvingFundBoolean,
  RevolvingFundFormErrors,
  RevolvingFundFormValues,
  RevolvingFundItem,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { validateRevolvingFundForm } from "@/app/src/validations/modules/cash-disbursement/revolving-fund/RevolvingFundValidation";
import { parseAmount } from "@/app/src/utils/number.util";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";

export function useRevolvingFundActionPage(options: { mode: RevolvingFundActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getRevolvingFundRecords().find((record) => record.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<RevolvingFundFormValues>(() =>
    createRevolvingFundFormValues(initialRecord, createNextRevolvingFundNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RevolvingFundFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isReadonly = mode === "view";
  const totals = useMemo(() => calculateRevolvingFundTotals(values.items), [values.items]);

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

  function updateField<TKey extends keyof RevolvingFundFormValues>(field: TKey, value: RevolvingFundFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItem(rowId: string, updates: Partial<RevolvingFundItem>) {
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

  function updateItems(items: RevolvingFundItem[]) {
    updateField("items", items);
  }

  function addItems(count: number) {
    updateItems([...values.items, ...Array.from({ length: count }, createBlankRevolvingFundItem)]);
  }

  function removeItem(rowId: string) {
    if (values.items.length > 1) updateItems(values.items.filter((item) => item.id !== rowId));
  }

  function duplicateItem(rowId: string) {
    const item = values.items.find((row) => row.id === rowId);
    if (item) updateItems([...values.items, { ...item, id: createBlankRevolvingFundItem().id }]);
  }

  function insertItem(rowId: string, position: "above" | "below") {
    const index = values.items.findIndex((item) => item.id === rowId);
    if (index < 0) return;
    const next = [...values.items];
    next.splice(position === "above" ? index : index + 1, 0, createBlankRevolvingFundItem());
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
    const source = RevolvingFundCopyFromRecords.find((item) => recordIds.includes(item.id));
    if (!source) {
      toast.error("Select a Disbursement Voucher to copy.");
      return;
    }
    const party = RevolvingFundPartyOptions.find((option) => option.name === source.partyName);
    const amount = formatRevolvingFundAmount(Number(source.amount?.replace(/,/g, "")) || 0);
    setValues((current) => ({
      ...current,
      partyCode: String(party?.value ?? ""),
      partyName: source.partyName ?? "",
      remarks: source.remarks ?? "",
      items: [
        {
          ...createBlankRevolvingFundItem(),
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

  function save(status: RevolvingFundStatus) {
    const nextErrors = status === RevolvingFundStatuses.draft ? {} : validateRevolvingFundForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted revolving fund fields.");
      return false;
    }
    const nextRecord = createRevolvingFundRecord(values, status, mode === "edit" ? record : undefined);
    saveRevolvingFundRecords(upsertRevolvingFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createRevolvingFundFormValues(nextRecord));
    toast.success(status === RevolvingFundStatuses.draft ? "Revolving fund saved as draft." : "Revolving fund submitted for approval.");
    options.onSaved?.();
    return true;
  }

  function updateStatus(status: RevolvingFundStatus) {
    if (!record) return false;
    const nextRecord = createRevolvingFundRecord(values, status, record);
    saveRevolvingFundRecords(upsertRevolvingFundRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createRevolvingFundFormValues(nextRecord));
    toast.success(`Revolving fund marked as ${status}.`);
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

function calculateItem(item: RevolvingFundItem): RevolvingFundItem {
  const amount = parseAmount(item.amount) ?? 0;
  const rate = item.vatable === "True" ? 0.12 : 0;
  const vat = rate ? (item.vatInclusive === "True" ? amount - amount / (1 + rate) : amount * rate) : 0;
  const net = item.vatInclusive === "True" ? amount - vat : amount;
  const gross = item.vatInclusive === "True" ? amount : amount + vat;
  return {
    ...item,
    netAmount: formatRevolvingFundAmount(net),
    vatAmount: formatRevolvingFundAmount(vat),
    grossAmount: formatRevolvingFundAmount(gross),
    vatable: item.vatable as RevolvingFundBoolean,
  };
}

export type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
