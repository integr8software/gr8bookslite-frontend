import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type {
  ReceivingReportAccountingEntry,
  ReceivingReportLine,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";
import { ReceivingReportDefaultEmptyValues } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { receivingReportEntryIsComplete } from "@/app/src/validations/modules/inventory/receiving-report/ReceivingReportValidation";

export function formatReceivingReportEntryAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatReceivingReportAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function shouldClearReceivingReportEntry(
  entry: ReceivingReportLine,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return receivingReportEntryHasData(entry);
  }

  if (action === "incomplete") {
    return receivingReportEntryHasData(entry) && !receivingReportEntryIsComplete(entry);
  }

  return !receivingReportEntryHasData(entry);
}

export function shouldClearAccountingEntry(
  entry: ReceivingReportAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return accountingEntryHasData(entry);
  }

  if (action === "incomplete") {
    return (
      accountingEntryHasData(entry) && (!entry.accountCode.trim() || !entry.accountTitle.trim())
    );
  }

  return !accountingEntryHasData(entry);
}

function receivingReportEntryHasData(entry: ReceivingReportLine) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !ReceivingReportDefaultEmptyValues.has(String(value));
  });
}

function accountingEntryHasData(entry: ReceivingReportAccountingEntry) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !ReceivingReportDefaultEmptyValues.has(String(value));
  });
}
