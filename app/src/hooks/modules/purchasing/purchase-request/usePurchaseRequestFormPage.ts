"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { AiAssistantPurchaseRequestPrefillStorageKey } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
  createPurchaseRequestFormValues,
  createPurchaseRequestId,
  createPurchaseRequestRecord,
  emptyPurchaseRequestItem,
  PurchaseRequestMaterialPlanRecords,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
  PurchaseRequestFormErrors,
  PurchaseRequestFormValues,
  PurchaseRequestAccountingEntry,
  PurchaseRequestItem,
  PurchaseRequestFormMode,
  PurchaseRequestRecord,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { AiAssistantPurchaseRequestPrefill } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";
import { validatePurchaseRequestForm } from "@/app/src/validations/modules/purchasing/purchase-request/PurchaseRequestValidation";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useItemManagementStore } from "@/app/src/hooks/modules/item-management/items/useItemManagement";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { fetchServicesMaintenanceOptions } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceApi";
import { ServicesMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceQueryKeys";
import { recordPurchaseRequestAuditLog } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestAuditLog";
import {
  createPurchaseRequest,
  updatePurchaseRequest,
} from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestApi";

export function usePurchaseRequestFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const { addRequest, requests, updateRequest } = usePurchaseRequestStore();
  const itemDescriptionOptions = useItemManagementStore(selectPurchasableItemOptions);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeBranchName = useAppStore((state) => state.activeBranchName);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const mode = getPurchaseRequestFormMode(pathname);
  const isReadonly = mode === "view";
  const existingRequest = findPurchaseRequestByRouteId(requests, params.recordId);
  const assistantPrefill =
    mode === "add" && searchParams.get("assistant") === "1"
      ? loadAssistantPurchaseRequestPrefill()
      : null;
  const [values, setValues] = useState<PurchaseRequestFormValues>(() => {
    const initialValues = createPurchaseRequestFormValues(existingRequest);

    if (!assistantPrefill) {
      return initialValues;
    }

    return applyAssistantPurchaseRequestPrefill(initialValues, assistantPrefill);
  });
  const [errors, setErrors] = useState<PurchaseRequestFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");
  const serviceOptionsQuery = useQuery({
    queryKey: ServicesMaintenanceQueryKeys.options(companyId),
    queryFn: () => fetchServicesMaintenanceOptions("Purchases"),
    enabled: Boolean(companyId),
    retry: false,
  });

  useEffect(() => {
    if (!assistantPrefill) {
      return;
    }

    clearAssistantPurchaseRequestPrefill();
  }, [assistantPrefill]);

  const previewRecord = useMemo(
    () => createPurchaseRequestRecord(values, params.recordId ?? "preview"),
    [params.recordId, values],
  );
  const draft = useModuleDraft({
    enabled: !isReadonly,
    key: createModuleDraftKey({
      mode,
      moduleId: "purchasing:purchase-request",
      recordId: params.recordId,
    }),
    setValues,
    values,
  });

  function updateField<TKey extends keyof PurchaseRequestFormValues>(
    field: TKey,
    value: PurchaseRequestFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    const nextValue =
      field === "vatRegTin" && typeof value === "string" ? FormatTinNumber(value) : value;

    setValues((current) => {
      if (field === "purchaseType" && nextValue !== current.purchaseType) {
        return {
          ...current,
          purchaseType: String(nextValue),
          items: current.items.map((item) => ({
            ...item,
            itemId: "",
            serviceMaintenanceId: "",
            itemCode: "",
            barcode: "",
            description: "",
            uom: "",
          })),
        };
      }

      return { ...current, [field]: nextValue };
    });
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "purchaseType" ? { items: undefined } : {}),
    }));
  }

  function updateItem(itemId: string, field: keyof PurchaseRequestItem, value: string | number) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateItems(items: PurchaseRequestItem[]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, items }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateAccountingEntries(accountingEntries: PurchaseRequestAccountingEntry[]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, accountingEntries }));
  }

  function addItem() {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      items: [
        ...current.items,
        { ...emptyPurchaseRequestItem, id: createPurchaseRequestId("item") },
      ],
    }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function removeItem(itemId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      items:
        current.items.length > 1
          ? current.items.filter((item) => item.id !== itemId)
          : current.items,
    }));
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function copyFromSourceTransactions(recordIds: string[]) {
    if (isReadonly) {
      return;
    }

    const selectedRecords = PurchaseRequestMaterialPlanRecords.filter((record) =>
      recordIds.includes(record.id),
    );

    if (selectedRecords.length === 0) {
      return;
    }

    const copiedItems = selectedRecords.flatMap((record) =>
      record.items.map((item) => ({
        ...emptyPurchaseRequestItem,
        ...item,
        id: createPurchaseRequestId("item"),
      })),
    );

    setValues((current) => ({
      ...current,
      items: current.items.some(purchaseRequestEntryHasData)
        ? [...current.items, ...copiedItems]
        : copiedItems,
      remarks:
        current.remarks ||
        selectedRecords
          .map((record) => record.remarks)
          .filter(Boolean)
          .join("; "),
    }));
    setErrors((current) => ({ ...current, items: undefined }));
    toast.success("Source transaction copied.");
  }

  async function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) {
      return;
    }

    const releaseSubmitLock = acquireModuleActionLock(
      `purchasing:purchase-request:submit:${mode}:${params.recordId ?? values.transNo}`,
    );

    if (!releaseSubmitLock) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = validatePurchaseRequestForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete the required purchase request fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    try {
      const response =
        mode === "edit" && params.recordId
          ? await updatePurchaseRequest(params.recordId, values, activeBranchId)
          : await createPurchaseRequest(values, activeBranchId);
      const nextRequest = createPurchaseRequestRecord(
        values,
        response.purchaseRequest.id,
      );

      if (mode === "edit") {
        updateRequest(nextRequest);
        recordPurchaseRequestAuditLog("UPDATE", nextRequest, {
          branchId: activeBranchId,
          branchName: activeBranchName,
        });
        toast.success("Purchase request updated.");
      } else {
        addRequest(nextRequest);
        recordPurchaseRequestAuditLog("CREATE", nextRequest, {
          branchId: activeBranchId,
          branchName: activeBranchName,
        });
        toast.success("Purchase request created.");
      }

      draft.clearDraft();
      router.push(`${PurchaseRequestHref}/view/${nextRequest.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the purchase request. Please try again.",
      );
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  return {
    addItem,
    copyFromSourceTransactions,
    errors,
    existingRequest,
    handleSubmit,
    itemDescriptionOptions,
    isSubmitting,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    previewRecord,
    removeItem,
    serviceDescriptionOptions: serviceOptionsQuery.data ?? [],
    setShowPreview,
    showPreview,
    updateField,
    updateAccountingEntries,
    updateItem,
    updateItems,
    values,
  };
}

function getPurchaseRequestFormMode(pathname: string): PurchaseRequestFormMode {
  if (pathname.includes("/edit/")) {
    return "edit";
  }

  if (pathname.includes("/view/")) {
    return "view";
  }

  return "add";
}

function findPurchaseRequestByRouteId(
  requests: PurchaseRequestRecord[],
  routeId?: string,
) {
  if (!routeId) {
    return undefined;
  }

  const normalizedRouteId = routeId.trim().toLowerCase();

  return requests.find((request) => {
    const normalizedId = request.id.trim().toLowerCase();
    const normalizedTransNo = request.transNo.trim().toLowerCase();

    return (
      normalizedId === normalizedRouteId ||
      normalizedTransNo === normalizedRouteId ||
      `pr-${normalizedTransNo}` === normalizedRouteId
    );
  });
}

function selectPurchasableItemOptions({ items }: { items: ItemRecord[] }) {
  return items.filter((item) => item.status === "Active" && item.purchasable && !item.service);
}

function loadAssistantPurchaseRequestPrefill() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(AiAssistantPurchaseRequestPrefillStorageKey);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as AiAssistantPurchaseRequestPrefill;
  } catch {
    return null;
  }
}

function clearAssistantPurchaseRequestPrefill() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AiAssistantPurchaseRequestPrefillStorageKey);
}

function applyAssistantPurchaseRequestPrefill(
  values: PurchaseRequestFormValues,
  prefill: AiAssistantPurchaseRequestPrefill,
): PurchaseRequestFormValues {
  const items =
    prefill.items && prefill.items.length > 0
      ? prefill.items.map((item) => ({
          ...emptyPurchaseRequestItem,
          id: createPurchaseRequestId("item"),
          description: item.description ?? "",
          quantity: Number(item.quantity) || 1,
          uom: item.uom || "PC",
          cost: Number(item.cost) || 0,
        }))
      : values.items;

  return {
    ...values,
    purchaseType: prefill.purchaseType || values.purchaseType,
    vceName: prefill.supplierName || values.vceName,
    forDepartment: prefill.department || values.forDepartment,
    remarks: prefill.remarks || values.remarks,
    items,
  };
}

function purchaseRequestEntryHasData(entry: PurchaseRequestItem) {
  return Boolean(
    entry.itemCode.trim() ||
    entry.barcode.trim() ||
    entry.description.trim() ||
    entry.lotNo.trim() ||
    entry.responsibilityCenter.trim() ||
    Number(entry.quantity) ||
    Number(entry.cost),
  );
}
