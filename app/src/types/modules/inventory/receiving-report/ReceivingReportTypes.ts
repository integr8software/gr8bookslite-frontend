import type { ChangeEvent } from "react";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type {
  ReceivingReportAccountingEntry,
  ReceivingReportFormValues,
  ReceivingReportLine,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";

export type ReceivingReportActionMode = "add" | "edit" | "view";
export type ReceivingReportActionTab = "details" | "attachments";
export type ReceivingReportEntryTab = "items" | "accounting";
export type ReceivingReportLineField = keyof ReceivingReportLine;
export type ReceivingReportAccountingEntryField =
  keyof ReceivingReportAccountingEntry;
export type ReceivingReportColumnKind = "amount" | "date" | "dropdown" | "text";
export type ReceivingReportFormField = Exclude<
  keyof ReceivingReportFormValues,
  "lines"
>;
export type ReceivingReportFormErrors = Partial<
  Record<ReceivingReportFormField | "lines", string>
>;

export type ReceivingReportColumnConfig = {
  header: string;
  id: ReceivingReportLineField;
  kind: ReceivingReportColumnKind;
  options?: AppAdvancedDropdownOption[];
  width: number;
  widthClassName: string;
};

export type ReceivingReportAccountingColumnConfig = {
  header: string;
  id: ReceivingReportAccountingEntryField;
  kind: "amount" | "text";
  width: number;
  widthClassName: string;
};

export type ReceivingReportEntryUpdater = (
  rowId: string,
  field: ReceivingReportLineField,
  value: string,
) => void;

export type ReceivingReportAccountingEntryUpdater = (
  rowId: string,
  field: ReceivingReportAccountingEntryField,
  value: string,
) => void;

export type ReceivingReportSectionChangeHandler = (
  event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => void;

export type ReceivingReportSectionProps = {
  errors: ReceivingReportFormErrors;
  isReadonly: boolean;
  onChange: ReceivingReportSectionChangeHandler;
  values: ReceivingReportFormValues;
};

export type ReceivingReportRangeValue = {
  from: string;
  to: string;
};
