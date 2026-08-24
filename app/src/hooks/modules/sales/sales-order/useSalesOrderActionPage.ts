"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SalesOrderHref } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import {
  createSalesOrderFormValues,
  createSalesOrderRecord,
  loadSalesOrders,
  saveSalesOrders,
} from "@/app/src/data/modules/sales/sales-order/SalesOrderData";
import { createSalesQuotationFormValues } from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { useSalesQuotationStore } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotation";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import type {
  SalesOrderFormErrors,
  SalesOrderFormMode,
  SalesOrderFormValues,
} from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import { validateSalesQuotationForm } from "@/app/src/validations/modules/sales/sales-quotation/SalesQuotationValidation";

export function useSalesOrderActionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getMode(pathname);
  const isReadonly = mode === "view";
  const [orders, setOrders] = useState(loadSalesOrders);
  const { requests: quotations } = useSalesQuotationStore();
  const existingOrder = orders.find((order) => order.id === params.recordId);
  const [values, setValues] = useState<SalesOrderFormValues>(() => createSalesOrderFormValues(existingOrder));
  const [errors, setErrors] = useState<SalesOrderFormErrors>({});
  const previewRecord = useMemo(() => createSalesOrderRecord(values, params.recordId ?? "preview"), [params.recordId, values]);

  function updateField<TKey extends keyof SalesOrderFormValues>(field: TKey, value: SalesOrderFormValues[TKey]) {
    if (!isReadonly) setValues((current) => ({ ...current, [field]: value }));
  }

  function copyFromQuotation(quotation: SalesQuotationRecord) {
    if (isReadonly) return;
    setValues((current) => ({
      ...current,
      ...createSalesQuotationFormValues(quotation),
      items: quotation.items.map((item) => ({ ...item })),
      referenceNo: quotation.transNo,
    }));
    setErrors({});
    toast.success(`Sales quotation ${quotation.transNo} copied.`);
  }

  function save() {
    if (isReadonly) return;
    const nextErrors = validateSalesQuotationForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete the required sales order fields.");
      return;
    }
    const nextOrder = createSalesOrderRecord(values, params.recordId);
    const nextOrders = mode === "edit" ? orders.map((order) => (order.id === nextOrder.id ? nextOrder : order)) : [nextOrder, ...orders];
    setOrders(nextOrders);
    saveSalesOrders(nextOrders);
    toast.success(mode === "edit" ? "Sales order updated." : "Sales order created.");
    router.push(`${SalesOrderHref}/view/${nextOrder.id}`);
  }

  return {
    copyFromQuotation,
    errors,
    existingOrder,
    isReadonly,
    mode,
    needsRecord: mode !== "add",
    previewRecord,
    quotations: quotations.filter((quotation) => quotation.status === "Open" || quotation.status === "Approved"),
    save,
    updateField,
    values,
  };
}

function getMode(pathname: string): SalesOrderFormMode {
  if (pathname.includes("/edit/")) return "edit";
  if (pathname.includes("/view/")) return "view";
  return "add";
}
