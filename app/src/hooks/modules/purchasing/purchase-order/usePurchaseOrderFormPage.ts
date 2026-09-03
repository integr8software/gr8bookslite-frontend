"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { PurchaseOrderHref } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
  getCanvassFormTotal,
  getSelectedSupplierCost,
  loadCanvassForms,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import {
  formatPurchaseRequestCurrency,
  getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import {
  createBlankPurchaseOrderItem,
  createPurchaseOrderId,
  createPurchaseOrderFormValues,
  createPurchaseOrderRecord,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { usePurchaseOrderStore } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrder";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import type {
  PurchaseOrderFormErrors,
  PurchaseOrderAccountingEntry,
  PurchaseOrderFormMode,
  PurchaseOrderFormValues,
  PurchaseOrderItem,
  PurchaseOrderRecord,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import type { CanvassFormItem, CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import type { PurchaseRequestItem, PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { validatePurchaseOrderForm } from "@/app/src/validations/modules/purchasing/purchase-order/PurchaseOrderValidation";

export function usePurchaseOrderFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const { addOrder, orders, updateOrder } = usePurchaseOrderStore();
  const { requests: purchaseRequests } = usePurchaseRequestStore();
  const canvassForms = useMemo(() => loadCanvassForms(), []);
  const copyFromRecords = useMemo<AppCopyFromRecord[]>(
    () => [
      ...purchaseRequests.map((record) => ({
        amount: formatPurchaseRequestCurrency(getPurchaseRequestTotal(record)),
        documentDate: record.prDate,
        id: record.id,
        partyName: record.vceName,
        remarks: record.remarks,
        source: "Purchase Request",
        sourceNo: record.transNo,
      })),
      ...canvassForms.map((record) => ({
        amount: String(getCanvassFormTotal(record)),
        documentDate: record.documentDate,
        id: record.id,
        partyName: getCanvassSelectedSupplierName(record),
        remarks: record.remarks,
        source: "Canvass",
        sourceNo: record.transNo,
      })),
    ],
    [canvassForms, purchaseRequests],
  );
  const mode = getPurchaseOrderFormMode(pathname);
  const isReadonly = mode === "view";
  const existingOrder = findPurchaseOrderByRouteId(orders, params.recordId);
  const [values, setValues] = useState<PurchaseOrderFormValues>(() => createPurchaseOrderFormValues(existingOrder));
  const [errors, setErrors] = useState<PurchaseOrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");
  const previewRecord = useMemo(() => createPurchaseOrderRecord(values, params.recordId ?? "preview"), [params.recordId, values]);
  const draft = useModuleDraft({
    enabled: !isReadonly,
    key: createModuleDraftKey({
      mode,
      moduleId: "purchasing:purchase-order",
      recordId: params.recordId,
    }),
    setValues,
    values,
  });

  function updateField<TKey extends keyof PurchaseOrderFormValues>(field: TKey, value: PurchaseOrderFormValues[TKey]) {
    if (isReadonly) return;

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItems(items: PurchaseOrderItem[]) {
    if (isReadonly) return;

    setValues((current) => ({ ...current, items }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateAccountingEntries(accountingEntries: PurchaseOrderAccountingEntry[]) {
    if (isReadonly) return;

    setValues((current) => ({ ...current, accountingEntries }));
  }

  function copyFromSourceRecords(recordIds: string[]) {
    if (isReadonly) return;

    const selectedPurchaseRequests = purchaseRequests.filter((record) => recordIds.includes(record.id));
    const selectedCanvassForms = canvassForms.filter((record) => recordIds.includes(record.id));

    if (selectedPurchaseRequests.length === 0 && selectedCanvassForms.length === 0) {
      toast.error("Select at least one source transaction to copy.");
      return;
    }

    const copiedItems = [
      ...selectedPurchaseRequests.flatMap(createItemsFromPurchaseRequest),
      ...selectedCanvassForms.flatMap(createItemsFromCanvassForm),
    ];
    const firstPurchaseRequest = selectedPurchaseRequests[0];
    const firstCanvassForm = selectedCanvassForms[0];
    const prNos = [
      ...selectedPurchaseRequests.map((record) => record.transNo),
      ...selectedCanvassForms.flatMap((record) => [record.prNo, ...record.items.map((item) => item.prNo)]),
    ].filter(Boolean);
    const remarks = [...selectedPurchaseRequests.map((record) => record.remarks), ...selectedCanvassForms.map((record) => record.remarks)]
      .filter(Boolean)
      .join("; ");

    setValues((current) => ({
      ...current,
      vceCode: firstPurchaseRequest?.vceCode || current.vceCode,
      vceName: firstPurchaseRequest?.vceName || getCanvassSelectedSupplierName(firstCanvassForm) || current.vceName,
      currency: firstPurchaseRequest?.currency || firstCanvassForm?.currency || current.currency,
      exchangeRate: firstPurchaseRequest?.exchangeRate || firstCanvassForm?.exchangeRate || current.exchangeRate,
      address: firstPurchaseRequest?.vendorAddress || current.address,
      deliveryDate: firstCanvassForm?.requiredBefore || current.deliveryDate,
      prNo: mergeUniqueTextValues(current.prNo, prNos),
      projectCode: firstPurchaseRequest?.projectCode || current.projectCode,
      projectName: firstPurchaseRequest?.projectName || current.projectName,
      remarks: current.remarks || remarks,
      items: current.items.some(purchaseOrderItemHasData) ? [...current.items, ...copiedItems] : copiedItems,
    }));
    setErrors((current) => ({ ...current, items: undefined, prNo: undefined }));
    toast.success("Source transaction copied to purchase order.");
  }

  function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) return;

    const releaseSubmitLock = acquireModuleActionLock(`purchasing:purchase-order:submit:${mode}:${params.recordId ?? values.transNo}`);

    if (!releaseSubmitLock) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = validatePurchaseOrderForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete the required purchase order fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    try {
      const nextOrder = createPurchaseOrderRecord(values, params.recordId);

      if (mode === "edit") {
        updateOrder(nextOrder);
        toast.success("Purchase order updated.");
      } else {
        addOrder(nextOrder);
        toast.success("Purchase order created.");
      }

      draft.clearDraft();
      router.push(`${PurchaseOrderHref}/view/${nextOrder.id}`);
    } catch {
      toast.error("Could not save the purchase order. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  return {
    errors,
    existingOrder,
    handleSubmit,
    isSubmitting,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    previewRecord,
    copyFromRecords,
    recordId: params.recordId,
    setShowPreview,
    showPreview,
    copyFromSourceRecords,
    updateField,
    updateAccountingEntries,
    updateItems,
    values,
  };
}

function createItemsFromPurchaseRequest(record: PurchaseRequestRecord) {
  return record.items.map((item) => createPurchaseOrderItemFromPurchaseRequestItem(record, item));
}

function createPurchaseOrderItemFromPurchaseRequestItem(record: PurchaseRequestRecord, item: PurchaseRequestItem): PurchaseOrderItem {
  return {
    ...createBlankPurchaseOrderItem(),
    id: createPurchaseOrderId("item"),
    itemCode: item.itemCode,
    barcode: item.barcode,
    itemName: item.description,
    prQuantity: Number(item.quantity) || 0,
    quantity: Number(item.quantity) || 0,
    uom: item.uom || "PC",
    cost: Number(item.cost) || 0,
    responsibilityCenter: item.responsibilityCenter,
    linePrNo: record.transNo,
    canvassNo: "",
  };
}

function createItemsFromCanvassForm(record: CanvassFormRecord) {
  return record.items.map((item) => createPurchaseOrderItemFromCanvassItem(record, item));
}

function createPurchaseOrderItemFromCanvassItem(record: CanvassFormRecord, item: CanvassFormItem): PurchaseOrderItem {
  return {
    ...createBlankPurchaseOrderItem(),
    id: createPurchaseOrderId("item"),
    itemCode: item.itemCode,
    barcode: item.barcode,
    itemName: item.description,
    prQuantity: Number(item.quantity) || 0,
    quantity: Number(item.minimumOrderQuantity || item.quantity) || 0,
    uom: item.uom || "PC",
    cost: getSelectedSupplierCost(item),
    vatInclusive: item.vatInclusive,
    vatable: item.vatExclusive === "True" || item.vatInclusive === "True" ? "True" : "False",
    responsibilityCenter: item.responsibilityCenter,
    linePrNo: item.prNo || record.prNo,
    canvassNo: record.transNo,
  };
}

function getCanvassSelectedSupplierName(record: CanvassFormRecord | undefined) {
  if (!record) return "";

  return (
    record.items.find((item) => item.selectedSupplier.trim())?.selectedSupplier ??
    record.items.find((item) => item.supplierName1.trim())?.supplierName1 ??
    ""
  );
}

function purchaseOrderItemHasData(item: PurchaseOrderItem) {
  return Boolean(
    item.itemCode.trim() ||
    item.barcode.trim() ||
    item.itemName.trim() ||
    item.itemCategory.trim() ||
    item.color.trim() ||
    item.brand.trim() ||
    item.size.trim() ||
    item.model.trim() ||
    item.linePrNo.trim() ||
    item.canvassNo.trim() ||
    Number(item.quantity) ||
    Number(item.prQuantity) ||
    Number(item.cost),
  );
}

function mergeUniqueTextValues(currentValue: string, nextValues: string[]) {
  return Array.from(
    new Set([
      ...(currentValue ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      ...nextValues.map((value) => value.trim()).filter(Boolean),
    ]),
  ).join(", ");
}

function getPurchaseOrderFormMode(pathname: string): PurchaseOrderFormMode {
  if (pathname.includes("/edit/")) return "edit";
  if (pathname.includes("/view/")) return "view";

  return "add";
}

function findPurchaseOrderByRouteId(orders: PurchaseOrderRecord[], routeId?: string) {
  if (!routeId) {
    return undefined;
  }

  const normalizedRouteId = routeId.trim().toLowerCase();

  return orders.find((order) => {
    const normalizedId = order.id.trim().toLowerCase();
    const normalizedTransNo = order.transNo.trim().toLowerCase();

    return normalizedId === normalizedRouteId || normalizedTransNo === normalizedRouteId || `po-${normalizedTransNo}` === normalizedRouteId;
  });
}
