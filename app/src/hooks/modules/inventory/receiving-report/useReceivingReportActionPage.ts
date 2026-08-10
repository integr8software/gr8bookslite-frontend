"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  calculateReceivingReportTotals,
  createNextReceivingReportNo,
  createReceivingReportFormValues,
  createReceivingReportFormValuesFromRecord,
  createReceivingReportLine,
  createReceivingReportRecordFromForm,
  getInitialReceivingReports,
  upsertReceivingReportRecord,
  type ReceivingReportAccountingEntry,
  type ReceivingReportFormValues,
  type ReceivingReportLine,
  type ReceivingReportRecord,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  getPurchaseOrderItemGrossAmount,
  getPurchaseOrderItemNetAmount,
  getPurchaseOrderTotals,
  loadPurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { ReceivingReportHref } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { openReceivingReportPdf } from "@/app/src/ui/modules/inventory/receiving-report/reports/ReceivingReportPdf";
import { validateReceivingReport } from "@/app/src/validations/modules/inventory/receiving-report/ReceivingReportValidation";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type {
  ReceivingReportAccountingEntryField,
  ReceivingReportActionMode,
  ReceivingReportActionTab,
  ReceivingReportFormErrors,
  ReceivingReportFormField,
  ReceivingReportLineField,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function useReceivingReportActionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getReceivingReportActionMode(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const initialRecord =
    mode === "add"
      ? null
      : (getInitialReceivingReports().find((record) => record.id === recordId) ?? null);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [loadedRecord, setLoadedRecord] = useState<ReceivingReportRecord | null>(initialRecord);
  const [values, setValues] = useState<ReceivingReportFormValues>(() =>
    initialRecord
      ? createReceivingReportFormValuesFromRecord(initialRecord)
      : {
          ...createReceivingReportFormValues(),
          transNo: createNextReceivingReportNo(getInitialReceivingReports()),
        },
  );
  const [errors, setErrors] = useState<ReceivingReportFormErrors>({});
  const [activeTab, setActiveTab] = useState<ReceivingReportActionTab>("details");
  const totals = useMemo(() => calculateReceivingReportTotals(values.lines), [values.lines]);
  const purchaseOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      loadPurchaseOrders()
        .filter((order) => order.status !== "Cancelled")
        .map((order) => ({
          amount: String(getPurchaseOrderTotals(order).netAmount),
          documentDate: order.documentDate,
          id: order.id,
          partyName: order.vceName,
          remarks: order.prNo || order.remarks,
          source: "Purchase Order",
          sourceNo: order.transNo,
        })),
    [],
  );
  const isMissingRecord = mode !== "add" && !initialRecord;

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[name as ReceivingReportFormField];
      return nextErrors;
    });
  }

  function updateLine(rowId: string, field: ReceivingReportLineField, value: string) {
    if (isReadonly) return;

    setValues((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === rowId ? { ...line, [field]: value } : line)),
    }));
    clearLineError();
  }

  function updateLines(lines: ReceivingReportLine[]) {
    if (isReadonly) return;

    setValues((current) => ({ ...current, lines }));
    clearLineError();
  }

  function updateAccountingEntry(
    rowId: string,
    field: ReceivingReportAccountingEntryField,
    value: string,
  ) {
    if (isReadonly) return;

    setValues((current) => ({
      ...current,
      accountingEntries: current.accountingEntries.map((entry) =>
        entry.id === rowId ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  function updateAccountingEntries(accountingEntries: ReceivingReportAccountingEntry[]) {
    if (isReadonly) return;

    setValues((current) => ({ ...current, accountingEntries }));
  }

  function copyFromPurchaseOrders(recordIds: string[]) {
    if (isReadonly) return;

    const selectedOrders = loadPurchaseOrders().filter((order) => recordIds.includes(order.id));

    if (selectedOrders.length === 0) {
      toast.error("No purchase orders were selected.");
      return;
    }

    const firstOrder = selectedOrders[0];
    const purchaseOrderNos = selectedOrders.map((order) => order.transNo);
    const purchaseRequestNos = selectedOrders.map((order) => order.prNo).filter(Boolean);
    const copiedLines = selectedOrders.flatMap((order) =>
      order.items
        .filter((item) => item.itemCode.trim() || item.itemName.trim() || Number(item.quantity) > 0)
        .map((item) => {
          const grossAmount = getPurchaseOrderItemGrossAmount(item);
          const netAmount = getPurchaseOrderItemNetAmount(item);

          return createReceivingReportLine({
            itemCode: item.itemCode,
            barcode: item.barcode,
            description: item.itemName,
            itemCategory: item.itemCategory,
            warehouse: values.warehouse || "Laguna",
            poQty: formatReceivingReportQuantity(item.quantity),
            rrQty: formatReceivingReportQuantity(item.quantity),
            uom: item.uom,
            expiryDate: item.expiryDate,
            freightCost: formatReceivingReportMoney(item.freightCost),
            cost: formatReceivingReportMoney(item.cost),
            grossAmount: formatReceivingReportMoney(grossAmount),
            vatAmount: formatReceivingReportMoney(item.vatAmount),
            discountAmount: formatReceivingReportMoney(item.discountAmount),
            netAmount: formatReceivingReportMoney(netAmount),
            vatable: item.vatable,
            vatInclusive: item.vatInclusive,
            responsibilityCenter: item.responsibilityCenter,
          });
        }),
    );

    setValues((current) => ({
      ...current,
      vceCode: firstOrder.vceCode || current.vceCode,
      vceName: firstOrder.vceName || current.vceName,
      currency: firstOrder.currency || current.currency,
      exchangeRate: String(firstOrder.exchangeRate || current.exchangeRate),
      address: firstOrder.address || current.address,
      contactNo: firstOrder.contactNo || current.contactNo,
      deliveryDate: firstOrder.deliveryDate || current.deliveryDate,
      dueDate: firstOrder.deliveryDate || current.dueDate,
      termsOfPayment: firstOrder.termsOfPayment || current.termsOfPayment,
      remarks: firstOrder.remarks || current.remarks,
      poNo: joinUniqueReceivingReportValues(purchaseOrderNos) || current.poNo,
      prNo: joinUniqueReceivingReportValues(purchaseRequestNos) || current.prNo,
      importationRefNo: firstOrder.importationNo || current.importationRefNo,
      projectRef: firstOrder.projectCode || current.projectRef,
      projectCode: firstOrder.projectCode || current.projectCode,
      projectName: firstOrder.projectName || current.projectName,
      responsibilityCenter:
        firstOrder.items.find((item) => item.responsibilityCenter.trim().length > 0)
          ?.responsibilityCenter || current.responsibilityCenter,
      lines: copiedLines.length > 0 ? copiedLines : current.lines,
    }));
    clearCopiedPurchaseOrderErrors();
    toast.success("Purchase order details copied.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateReceivingReport(values);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please complete the required receiving report fields.");
      return;
    }

    try {
      const nextRecord = createReceivingReportRecordFromForm(
        values,
        mode === "edit" ? (loadedRecord ?? undefined) : undefined,
      );
      upsertReceivingReportRecord(nextRecord);
      setLoadedRecord(nextRecord);
      toast.success(mode === "edit" ? "Receiving report updated." : "Receiving report saved.");
      router.push(ReceivingReportHref);
    } catch {
      toast.error("Unable to save receiving report.");
    }
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    setValues((current) => ({
      ...current,
      attachments: [
        ...current.attachments,
        ...files.map((file) => ({
          id: `rr-attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
        })),
      ],
    }));
    toast.success("Attachment added.");
    event.target.value = "";
  }

  function removeAttachment(attachmentId: string) {
    setValues((current) => ({
      ...current,
      attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId),
    }));
    toast.success("Attachment removed.");
  }

  function openReportPreview() {
    setIsReportPreviewOpen(true);
  }

  function closeReportPreview() {
    setIsReportPreviewOpen(false);
  }

  function generatePdf() {
    try {
      openReceivingReportPdf(values);
      toast.success("Receiving report PDF opened.");
    } catch {
      toast.error("Unable to open receiving report PDF.");
    }
  }

  function clearLineError() {
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.lines;
      return nextErrors;
    });
  }

  function clearCopiedPurchaseOrderErrors() {
    setErrors((current) => {
      const nextErrors = { ...current };
      [
        "vceCode",
        "vceName",
        "currency",
        "exchangeRate",
        "address",
        "contactNo",
        "dueDate",
        "termsOfPayment",
        "deliveryDate",
        "poNo",
        "responsibilityCenter",
        "lines",
      ].forEach((field) => {
        delete nextErrors[field as ReceivingReportFormField | "lines"];
      });
      return nextErrors;
    });
  }

  return {
    activeTab,
    closeReportPreview,
    copyFromPurchaseOrders,
    errors,
    generatePdf,
    handleAttachmentChange,
    handleInputChange,
    handleSubmit,
    isMissingRecord,
    isReadonly,
    isReportPreviewOpen,
    mode,
    openReportPreview,
    purchaseOrderCopyRecords,
    removeAttachment,
    setActiveTab,
    totals,
    updateAccountingEntries,
    updateAccountingEntry,
    updateLine,
    updateLines,
    values,
  };
}

function getReceivingReportActionMode(pathname: string): ReceivingReportActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function formatReceivingReportMoney(value: number) {
  return value.toFixed(2);
}

function formatReceivingReportQuantity(value: number) {
  return value.toFixed(2);
}

function joinUniqueReceivingReportValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
}
