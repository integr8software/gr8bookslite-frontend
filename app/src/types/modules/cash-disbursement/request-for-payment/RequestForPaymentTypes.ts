import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useRequestForPaymentActionPage } from "@/app/src/hooks/modules/cash-disbursement/request-for-payment/useRequestForPaymentActionPage";
import type { useRequestForPaymentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/request-for-payment/useRequestForPaymentOverviewPage";

export type RequestForPaymentStatus =
  | "Draft"
  | "For Approval"
  | "Approved"
  | "Disapproved"
  | "Cancelled"
  | "Closed";

export type RequestForPaymentFormStatus = "Open" | RequestForPaymentStatus;
export type RequestForPaymentActionMode = "add" | "edit" | "view";
export type RequestForPaymentActionTab = "details" | "attachments";
export type RequestForPaymentConfirmationAction =
  | "save"
  | "draft"
  | "approve"
  | "disapprove"
  | "cancel";

export type RequestForPaymentActionPageState = ReturnType<typeof useRequestForPaymentActionPage>;
export type RequestForPaymentOverviewPageState = ReturnType<typeof useRequestForPaymentOverviewPage>;

export type RequestForPaymentOpenResponsibilityCenterDrawerHandler = (rowId: string) => void;
export type RequestForPaymentOpenSupplierDrawerHandler = (rowId: string) => void;

export type RequestForPaymentEntrySectionProps = {
  page: RequestForPaymentActionPageState;
  onOpenResponsibilityCenterDrawer?: RequestForPaymentOpenResponsibilityCenterDrawerHandler;
  onOpenSupplierDrawer?: RequestForPaymentOpenSupplierDrawerHandler;
};

export type RequestForPaymentDetailEntryTableProps = RequestForPaymentEntrySectionProps;

export type RequestForPaymentRefType = "PO" | "Billing" | "Expense" | "Contract" | "Manual";
export type RequestForPaymentPaymentMethod = "Check" | "Cash" | "Bank Transfer" | "Online";

export type RequestForPaymentItem = {
  id: string;
  date: string;
  refType: RequestForPaymentRefType;
  refNumber: string;
  particulars: string;
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
  amount: string;
  remarks?: string;
};

export type RequestForPaymentItemColumnId = Exclude<keyof RequestForPaymentItem, "id" | "remarks">;

export type RequestForPaymentFormValues = {
  transactionNo: string;
  documentDate: string;
  dateNeeded: string;
  status: RequestForPaymentFormStatus;
  partyCode: string;
  partyName: string;
  partyTin?: string;
  partyAddress?: string;
  paymentMethod: RequestForPaymentPaymentMethod;
  bankId?: string;
  bankAccountNo?: string;
  bankName?: string;
  responsibilityCenter: string;
  responsibilityCenterCode: string;
  projectCode: string;
  projectName: string;
  currency: string;
  exchangeRate: string;
  remarks: string;
  items: RequestForPaymentItem[];
  attachments: TransactionAttachment[];
};

export type RequestForPaymentRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  dateNeeded: string;
  partyCode: string;
  partyName: string;
  paymentMethod: RequestForPaymentPaymentMethod;
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
  projectCode?: string;
  projectName?: string;
  bankName?: string;
  bankAccountNo?: string;
  amount: number;
  currency: string;
  remarks: string;
  status: RequestForPaymentStatus;
  convertedTo?: "DV" | "APV";
  convertedRefNo?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: RequestForPaymentFormValues;
};

export type RequestForPaymentFormErrors = Partial<Record<keyof RequestForPaymentFormValues | "items", string>>;
export type RequestForPaymentUpdateStatusHandler = (
  record: RequestForPaymentRecord,
  status: RequestForPaymentStatus,
) => void;
