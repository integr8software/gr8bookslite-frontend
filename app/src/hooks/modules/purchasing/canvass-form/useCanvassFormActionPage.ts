"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { useCanvassFormStore } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassForm";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import type {
  CanvassFormItem,
  CanvassFormAccountingEntry,
  CanvassFormMode,
  CanvassFormErrors,
  CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { validateCanvassForm } from "@/app/src/validations/modules/purchasing/canvass-form/CanvassFormValidation";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export function useCanvassFormActionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const { addForm, forms, updateForm } = useCanvassFormStore();
  const { requests: purchaseRequests } = usePurchaseRequestStore();
  const purchaseRequestCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      purchaseRequests.map((record) => ({
        amount: formatPurchaseRequestCurrency(getPurchaseRequestTotal(record)),
        documentDate: record.prDate,
        id: record.id,
        partyName: record.vceName,
        remarks: record.remarks,
        source: "Purchase Request",
        sourceNo: record.transNo,
      })),
    [purchaseRequests],
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
      prNo: mergeUniqueTextValues(current.prNo, prNos),
      purchaseType: selectedRecords[0]?.purchaseType || current.purchaseType,
      remarks: current.remarks || remarks,
      items: current.items.some(canvassFormItemHasData) ? [...current.items, ...copiedItems] : copiedItems,
    }));
    setErrors((current) => ({ ...current, items: undefined, prNo: undefined }));
    toast.success("Purchase request copied.");
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
    mode,
    needsRecord: mode === "edit" || mode === "view",
    previewRecord,
    purchaseRequestCopyRecords,
    recordId: params.recordId,
    setShowPreview,
    showPreview,
    copyFromPurchaseRequests,
    updateField,
    updateAccountingEntries,
    updateItems,
    values,
  };
}

function canvassFormItemHasData(item: CanvassFormItem) {
  return Boolean(
    item.prNo.trim() ||
    item.itemCode.trim() ||
    item.barcode.trim() ||
    item.description.trim() ||
    item.supplierName1.trim() ||
    item.supplierName2.trim() ||
    item.supplierName3.trim() ||
    item.supplierName4.trim() ||
    Number(item.quantity) ||
    Number(item.minimumOrderQuantity),
  );
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
