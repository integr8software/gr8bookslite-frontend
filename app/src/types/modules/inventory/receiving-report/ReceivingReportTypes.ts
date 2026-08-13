import type { ChangeEvent } from "react";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export type ReceivingReportActionMode = "add" | "edit" | "view";
export type ReceivingReportActionTab = "details" | "attachments";
export type ReceivingReportEntryTab = "items" | "accounting";

export type ReceivingReportStatus =
  | "Approved"
  | "Cancelled"
  | "Closed"
  | "Disapproved"
  | "Draft"
  | "Pending";

export type ReceivingReportLine = {
  id: string;
  itemCode: string;
  barcode: string;
  description: string;
  itemCategory: string;
  serialNo: string;
  lotNo: string;
  color: string;
  brand: string;
  size: string;
  model: string;
  warehouse: string;
  poQty: string;
  rrQty: string;
  uom: string;
  expiryDate: string;
  freightCost: string;
  cost: string;
  grossAmount: string;
  vatAmount: string;
  discountAmount: string;
  ewtAmount: string;
  atc: string;
  netAmount: string;
  vatable: string;
  vatInclusive: string;
  withEwt: string;
  responsibilityCenter: string;
};

export type ReceivingReportAttachment = {
  id: string;
  name: string;
  size: number;
};

export type ReceivingReportAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
  vatType: string;
  ewtCode: string;
  responsibilityCenter: string;
  referenceNo: string;
};

export type ReceivingReportFormValues = {
  vceCode: string;
  vceName: string;
  currency: string;
  exchangeRate: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  deliveryDate: string;
  dueDate: string;
  remarks: string;
  defaultAccount: string;
  termsOfPayment: string;
  grossAmount: string;
  discountAmount: string;
  vatAmount: string;
  ewtAmount: string;
  netAmount: string;
  warehouse: string;
  status: string;
  transNo: string;
  documentDate: string;
  drNo: string;
  poNo: string;
  prNo: string;
  siNo: string;
  importationRefNo: string;
  projectRef: string;
  projectCode: string;
  projectName: string;
  pjNo: string;
  responsibilityCenter: string;
  attachments: ReceivingReportAttachment[];
  accountingEntries: ReceivingReportAccountingEntry[];
  lines: ReceivingReportLine[];
};

export type ReceivingReportRecord = {
  id: string;
  documentDate: string;
  formValues?: ReceivingReportFormValues;
  netAmount: number;
  poNo: string;
  status: ReceivingReportStatus;
  transactionNo: string;
  vceCode: string;
  vceName: string;
  warehouse: string;
};

export type ReceivingReportTotals = {
  discountAmount: number;
  ewtAmount: number;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
};

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
