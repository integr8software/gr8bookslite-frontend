"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import {
  createBlankCanvassFormItem,
  createCanvassFormId,
  createCanvassFormRecord,
  createCanvassFormValues,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import {
  formatPurchaseRequestCurrency,
  getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import {
  formatPurchaseOrderAmount,
  getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { useCanvassFormStore } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassForm";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useItemManagementStore } from "@/app/src/hooks/modules/item-management/items/useItemManagement";
import { usePurchaseOrderStore } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrder";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { fetchServicesMaintenanceOptions } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceApi";
import { ServicesMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceQueryKeys";
import type {
  CanvassFormItem,
  CanvassFormAccountingEntry,
  CanvassFormMode,
  CanvassFormErrors,
  CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { validateCanvassForm } from "@/app/src/validations/modules/purchasing/canvass-form/CanvassFormValidation";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

export function useCanvassFormActionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const { addForm, forms, updateForm } = useCanvassFormStore();
  const itemDescriptionOptions = useItemManagementStore(selectPurchasableItemOptions);
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const serviceOptionsQuery = useQuery({
    queryKey: ServicesMaintenanceQueryKeys.options(companyId, "Purchases"),
    queryFn: () => fetchServicesMaintenanceOptions("Purchases"),
    enabled: Boolean(companyId),
    retry: false,
  });
  const { requests: purchaseRequests } = usePurchaseRequestStore();
  const { orders: purchaseOrders } = usePurchaseOrderStore();
  const copyFromRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      [
        ...purchaseRequests.map((record) => ({
          amount: formatPurchaseRequestCurrency(getPurchaseRequestTotal(record)),
          documentDate: record.prDate,
          id: createCopyFromId("pr", record.id),
          partyName: record.vceName,
          remarks: record.remarks,
          source: "Purchase Request",
          sourceNo: record.transNo,
        })),
        ...purchaseOrders.map((record) => ({
          amount: formatPurchaseOrderAmount(getPurchaseOrderTotals(record).netAmount),
          documentDate: record.documentDate,
          id: createCopyFromId("po", record.id),
          partyName: record.vceName,
          remarks: record.remarks,
          source: "Purchase Order",
          sourceNo: record.transNo,
        })),
      ],
    [purchaseOrders, purchaseRequests],
  );
  const mode = getMode(pathname);
  const isReadonly = mode === "view";
  const existingForm = forms.find((form) => form.id === params.recordId);
  const [values, setValues] = useState<CanvassFormValues>(() => createCanvassFormValues(existingForm));
  const [errors, setErrors] = useState<CanvassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");
  const previewRecord = useMemo(() => createCanvassFormRecord(values, params.recordId ?? "preview"), [params.recordId, values]);
  const draft = useModuleDraft({
    enabled: !isReadonly,
    key: createModuleDraftKey({
      mode,
      moduleId: "purchasing:canvass-form",
      recordId: params.recordId,
    }),
    setValues,
    values,
  });

  function updateField<TKey extends keyof CanvassFormValues>(field: TKey, value: CanvassFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItems(items: CanvassFormItem[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, items }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateAccountingEntries(accountingEntries: CanvassFormAccountingEntry[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, accountingEntries }));
  }

  function copyFromSourceRecords(recordIds: string[]) {
    const purchaseOrderIds = getCopyFromRecordIds(recordIds, "po");
    if (purchaseOrderIds.length > 0) {
      copyFromPurchaseOrders(purchaseOrderIds);
      return;
    }

    copyFromPurchaseRequests(getCopyFromRecordIds(recordIds, "pr"));
  }

  function copyFromPurchaseRequests(recordIds: string[]) {
    if (isReadonly) return;

    const selectedRecords = purchaseRequests.filter((record) => recordIds.includes(record.id));

    if (selectedRecords.length === 0) {
      toast.error("Select at least one purchase request to copy.");
      return;
    }

    const copiedItems = selectedRecords.flatMap((record) =>
      record.items.map((item) => ({
        ...createBlankCanvassFormItem(),
        id: createCanvassFormId("item"),
        prNo: record.transNo,
        itemCode: item.itemCode,
        barcode: item.barcode,
        description: item.description,
        uom: item.uom,
        quantity: Number(item.quantity) || 0,
        minimumOrderQuantity: Number(item.quantity) || 0,
        responsibilityCenter: item.responsibilityCenter,
        supplierCode1: record.vceCode,
        supplierName1: record.vceName,
        unitCost1: Number(item.cost) || 0,
        selectedSupplier: record.vceName || record.vceCode,
      })),
    );
    const prNos = selectedRecords.map((record) => record.transNo);
    const remarks = selectedRecords
      .map((record) => record.remarks)
      .filter(Boolean)
      .join("; ");

    setValues((current) => ({
      ...current,
      currency: selectedRecords[0]?.currency || current.currency,
      exchangeRate: selectedRecords[0]?.exchangeRate || current.exchangeRate,
      prNo: mergeUniqueTextValues("", prNos),
      poNo: "",
      projectCode: selectedRecords[0]?.projectCode || current.projectCode,
      projectName: selectedRecords[0]?.projectName || current.projectName,
      purchaseType: selectedRecords[0]?.purchaseType || current.purchaseType,
      remarks: current.remarks || remarks,
      items: copiedItems,
    }));
    setErrors((current) => ({ ...current, items: undefined, poNo: undefined, prNo: undefined }));
    toast.success("Purchase request copied.");
  }

  function copyFromPurchaseOrders(recordIds: string[]) {
    if (isReadonly) return;

    const selectedRecords = purchaseOrders.filter((record) => recordIds.includes(record.id));
    if (selectedRecords.length === 0) {
      toast.error("Select at least one purchase order to copy.");
      return;
    }

    const copiedItems = selectedRecords.flatMap((record) =>
      record.items.map((item) => ({
        ...createBlankCanvassFormItem(),
        id: createCanvassFormId("item"),
        prNo: item.linePrNo || record.prNo,
        itemCode: item.itemCode,
        barcode: item.barcode,
        description: item.itemName,
        uom: item.uom,
        quantity: Number(item.quantity) || 0,
        minimumOrderQuantity: Number(item.quantity) || 0,
        responsibilityCenter: item.responsibilityCenter,
        supplierCode1: record.vceCode,
        supplierName1: record.vceName,
        unitCost1: Number(item.cost) || 0,
        vatable1: item.vatable || "False",
        vatInclusive1: item.vatInclusive || "False",
        selectedSupplier: record.vceName || record.vceCode,
      })),
    );
    const poNos = selectedRecords.map((record) => record.transNo);
    const remarks = selectedRecords.map((record) => record.remarks).filter(Boolean).join("; ");

    setValues((current) => ({
      ...current,
      currency: selectedRecords[0]?.currency || current.currency,
      exchangeRate: selectedRecords[0]?.exchangeRate || current.exchangeRate,
      prNo: "",
      poNo: mergeUniqueTextValues("", poNos),
      projectCode: selectedRecords[0]?.projectCode || current.projectCode,
      projectName: selectedRecords[0]?.projectName || current.projectName,
      purchaseType: selectedRecords[0]?.purchaseType || current.purchaseType,
      requiredBefore: selectedRecords[0]?.deliveryDate || current.requiredBefore,
      termsOfPayment: selectedRecords[0]?.termsOfPayment || current.termsOfPayment,
      remarks: current.remarks || remarks,
      items: copiedItems,
    }));
    setErrors((current) => ({ ...current, items: undefined, poNo: undefined, prNo: undefined }));
    toast.success("Purchase order copied.");
  }

  function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) return;

    const releaseSubmitLock = acquireModuleActionLock(`purchasing:canvass-form:submit:${mode}:${params.recordId ?? values.transNo}`);

    if (!releaseSubmitLock) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = validateCanvassForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete the required canvass form fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }
    try {
      const nextForm = createCanvassFormRecord(values, params.recordId);
      if (mode === "edit") {
        updateForm(nextForm);
        toast.success("Canvass form updated.");
      } else {
        addForm(nextForm);
        toast.success("Canvass form created.");
      }
      draft.clearDraft();
      router.push(`${CanvassFormHref}/view/${nextForm.id}`);
    } catch {
      toast.error("Could not save the canvass form. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  return {
    errors,
    existingForm,
    handleSubmit,
    isSubmitting,
    isReadonly,
    itemDescriptionOptions,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    previewRecord,
    copyFromRecords,
    recordId: params.recordId,
    serviceDescriptionOptions: serviceOptionsQuery.data ?? [],
    setShowPreview,
    showPreview,
    copyFromSourceRecords,
    updateField,
    updateAccountingEntries,
    updateItems,
    values,
  };
}

function selectPurchasableItemOptions({ items }: { items: ItemRecord[] }) {
  return items.filter((item) => item.status === "Active" && item.purchasable && !item.service);
}

function createCopyFromId(source: "po" | "pr", recordId: string) {
  return `${source}:${recordId}`;
}

function getCopyFromRecordIds(recordIds: string[], source: "po" | "pr") {
  const prefix = `${source}:`;
  return recordIds.filter((recordId) => recordId.startsWith(prefix)).map((recordId) => recordId.slice(prefix.length));
}

function mergeUniqueTextValues(currentValue: string, nextValues: string[]) {
  return Array.from(
    new Set([
      ...(currentValue ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      ...nextValues.map((value) => String(value ?? "").trim()).filter(Boolean),
    ]),
  ).join(", ");
}

function getMode(pathname: string): CanvassFormMode {
  if (pathname.includes("/edit/")) return "edit";
  if (pathname.includes("/view/")) return "view";
  return "add";
}
