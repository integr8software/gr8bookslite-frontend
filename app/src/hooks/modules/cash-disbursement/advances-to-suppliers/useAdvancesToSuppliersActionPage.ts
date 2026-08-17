"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import {
  calculateAdvancePayment,
  createAdvancesToSuppliersFormValues,
  createAdvancesToSuppliersRecord,
  formatAdvancesToSuppliersAmount,
} from "@/app/src/data/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersData";
import {
  getPurchaseOrderParty,
  getPurchaseOrderTotals,
  loadPurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import {
  createNextAdvancesToSuppliersNumber,
  getAdvancesToSuppliersRecords,
  saveAdvancesToSuppliersRecords,
  upsertAdvancesToSuppliersRecord,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersService";
import type {
  AdvancesToSuppliersActionMode,
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersFormErrors,
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { validateAdvancesToSuppliersForm } from "@/app/src/validations/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersValidation";

export function useAdvancesToSuppliersActionPage(
  options: { onSaved?: () => void } = {},
) {
  const transactionCurrency = useTransactionCurrency();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode: AdvancesToSuppliersActionMode = pathname.includes("/view/")
    ? "view"
    : pathname.includes("/edit/")
      ? "edit"
      : "add";
  const initialRecord = mode === "add"
    ? undefined
    : getAdvancesToSuppliersRecords().find((item) => item.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<AdvancesToSuppliersFormValues>(() =>
    createAdvancesToSuppliersFormValues(
      initialRecord,
      createNextAdvancesToSuppliersNumber(),
      transactionCurrency.baseCurrencyCode,
    ),
  );
  const [errors, setErrors] = useState<AdvancesToSuppliersFormErrors>({});
  const [activeTab, setActiveTab] = useState<AdvancesToSuppliersActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isReadonly = mode === "view";
  const purchaseOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      loadPurchaseOrders()
        .filter((order) => order.status !== "Cancelled")
        .map((order) => {
          const party = getPurchaseOrderParty(order);

          return {
            amount: String(getPurchaseOrderTotals(order).netAmount),
            documentDate: order.documentDate,
            id: order.id,
            partyName: party.partyName,
            remarks: order.remarks || order.prNo,
            source: "Purchase Order",
            sourceNo: order.transNo,
          };
        }),
    [],
  );

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof AdvancesToSuppliersFormValues>(
    field: TKey,
    value: AdvancesToSuppliersFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "totalPoAmount" || field === "advancePaymentPercentage") {
        next.advancePaymentAmount = formatAdvancesToSuppliersAmount(
          calculateAdvancePayment(next.totalPoAmount, next.advancePaymentPercentage),
        );
      }
      return next;
    });
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "totalPoAmount" || field === "advancePaymentPercentage"
        ? { advancePaymentAmount: undefined }
        : {}),
    }));
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
    } catch {
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function copyFromPurchaseOrder(recordIds: string[]) {
    if (isReadonly) return;

    const order = loadPurchaseOrders().find((item) => recordIds.includes(item.id));

    if (!order) {
      toast.error("No purchase order was selected.");
      return;
    }

    const totalPoAmount = formatAdvancesToSuppliersAmount(
      getPurchaseOrderTotals(order).netAmount,
    );
    const party = getPurchaseOrderParty(order);
    hasEditedCurrencyRef.current = true;
    setValues((current) => ({
      ...current,
      partyCode: party.partyCode || current.partyCode,
      partyName: party.partyName || current.partyName,
      projectCode: order.projectCode || current.projectCode,
      projectName: order.projectName || current.projectName,
      currency: order.currency || current.currency,
      exchangeRate: formatLoadedExchangeRate(order.exchangeRate || 1),
      poReference: order.transNo,
      totalPoAmount,
      advancePaymentAmount: formatAdvancesToSuppliersAmount(
        calculateAdvancePayment(totalPoAmount, current.advancePaymentPercentage),
      ),
      remarks: order.remarks || current.remarks,
    }));
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
      projectCode: undefined,
      projectName: undefined,
      currency: undefined,
      exchangeRate: undefined,
      poReference: undefined,
      totalPoAmount: undefined,
      advancePaymentAmount: undefined,
    }));
    toast.success("Purchase order details copied.");
  }

  function save(status: AdvancesToSuppliersStatus) {
    const nextErrors = status === AdvancesToSuppliersStatuses.draft
      ? {}
      : validateAdvancesToSuppliersForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Advances to Suppliers fields.");
      return false;
    }
    const nextRecord = createAdvancesToSuppliersRecord(
      values,
      status,
      mode === "edit" ? record : undefined,
    );
    saveAdvancesToSuppliersRecords(upsertAdvancesToSuppliersRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createAdvancesToSuppliersFormValues(nextRecord));
    toast.success(
      status === AdvancesToSuppliersStatuses.draft
        ? "Advances to Suppliers saved as draft."
        : "Advances to Suppliers submitted for approval.",
    );
    options.onSaved?.();
    return true;
  }

  function updateStatus(status: AdvancesToSuppliersStatus) {
    if (!record) return false;
    const nextRecord = createAdvancesToSuppliersRecord(values, status, record);
    saveAdvancesToSuppliersRecords(upsertAdvancesToSuppliersRecord(nextRecord));
    setRecord(nextRecord);
    setValues(createAdvancesToSuppliersFormValues(nextRecord));
    toast.success(`Advances to Suppliers marked as ${status}.`);
    return true;
  }

  return {
    activeTab,
    currencyOptions: transactionCurrency.currencyOptions,
    errors,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== "add" && !initialRecord,
    mode,
    purchaseOrderCopyRecords,
    record,
    save,
    setActiveTab,
    setIsPreviewOpen,
    updateCurrency,
    copyFromPurchaseOrder,
    updateField,
    updateStatus,
    values,
  };
}

export type AdvancesToSuppliersActionPageState = ReturnType<
  typeof useAdvancesToSuppliersActionPage
>;
