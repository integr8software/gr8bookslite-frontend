import type { PurchasingAccountingEntry } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import type { ModuleFileAttachment } from "@/app/src/types/shared/module/ModuleFileAttachmentTypes";

export type BillingStatementFieldUpdater<TValues> = <Key extends keyof TValues>(
  key: Key,
  value: TValues[Key],
) => void;

export type BillingStatementStatus =
  | "Cancelled"
  | "Disapproved"
  | "Draft"
  | "For Approval"
  | "Posted";

export type BillingStatementItem = {
  id: string;
  description: string;
  particulars: string;
  amount: number;
  quantity: number;
  netAmount: number;
  vatAmount: number;
  wvatAmount: number;
  ewtAmount: number;
  discountPercent: string;
  discountAmount: number;
  grossAmount: number;
  vatType: string;
  vatable: string;
  vatInclusive: string;
  withWvat: string;
  wvatType: string;
  withEwt: string;
  ewtType: string;
  responsibilityCenter: string;
};

export type BillingStatementRecord = {
  id: string;
  code: string;
  name: string;
  currency: string;
  exchangeRate: number;
  contactPerson: string;
  remarks: string;
  terms: string;
  dueDate: string;
  description: string;
  defaultAccount: string;
  teamAssigned: string;
  startDate: string;
  expirationDate: string;
  netAmount: number;
  vatAmount: number;
  wvatAmount: number;
  ewtAmount: number;
  discountAmount: number;
  grossAmount: number;
  salesAssociate: string;
  resCustomerCode: string;
  resCustomer: string;
  recoupment: number;
  retention: number;
  donation: number;
  transNo: string;
  documentDate: string;
  sjNo: string;
  joNo: string;
  poNo: string;
  sqNo: string;
  invoiceNo: string;
  refNo: string;
  businessStyle: string;
  status: BillingStatementStatus;
  projectRef: string;
  projectName: string;
  attachments: BillingStatementAttachment[];
  accountingEntries: BillingStatementAccountingEntry[];
  items: BillingStatementItem[];
};

export type BillingStatementFormValues = Omit<BillingStatementRecord, "id">;
export type BillingStatementAccountingEntry = PurchasingAccountingEntry;
export type BillingStatementAttachment = ModuleFileAttachment;
export type BillingStatementFormMode = "add" | "edit" | "view";

export type BillingStatementFormErrors = Partial<
  Record<keyof BillingStatementFormValues | "items", string>
>;
