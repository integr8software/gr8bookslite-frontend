import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { usePettyCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type { usePettyCashVoucherOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherOverviewPage";

export type PettyCashVoucherStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";

export type PettyCashVoucherFormStatus = "Open" | PettyCashVoucherStatus;

export type PettyCashVoucherVATable = "False" | "True";

export type PettyCashVoucherRecord = {
  id: string;
  voucherNo: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  documentDate: string;
  currency?: string;
  exchangeRate?: string;
  remarks: string;
  createdBy: string;
  dateCreated: string;
  updatedBy: string;
  dateModified: string;
  status: PettyCashVoucherStatus;
};

export type PettyCashVoucherFormValues = {
  accountCode: string;
  accountTitle: string;
  amount: string;
  attachments: TransactionAttachment[];
  documentDate: string;
  currency: string;
  exchangeRate: string;
  netAmount: string;
  remarks: string;
  responsibilityCenter: string;
  responsibilityCenterCode: string;
  status: PettyCashVoucherFormStatus;
  transactionNo: string;
  vatable: PettyCashVoucherVATable;
  vatAmount: string;
  partyCode: string;
  partyName: string;
};

export type PettyCashVoucherFormErrors = Partial<Record<keyof PettyCashVoucherFormValues, string>>;

export type PettyCashVoucherTextFieldName = {
  [TKey in keyof PettyCashVoucherFormValues]: PettyCashVoucherFormValues[TKey] extends string ? TKey : never;
}[keyof PettyCashVoucherFormValues];

export type PettyCashVoucherFormMode = "add" | "edit" | "view";

export type PettyCashVoucherActionTab = "details" | "attachments";

export type PettyCashVoucherConfirmation = { action: "submit" | "draft" } | { action: "status"; status: PettyCashVoucherStatus };

export type PettyCashVoucherActionPageState = ReturnType<typeof usePettyCashVoucherActionPage>;
export type PettyCashVoucherOverviewPageState = ReturnType<typeof usePettyCashVoucherOverviewPage>;

export type PettyCashVoucherActionPageOptions = {
  existingVoucher?: PettyCashVoucherRecord;
  mode: PettyCashVoucherFormMode;
  onSaved?: () => void;
};

export type PettyCashVoucherUpdateStatusHandler = (record: PettyCashVoucherRecord, status: PettyCashVoucherStatus) => void | Promise<void>;

export type PettyCashVoucherRecordActionsProps = {
  onUpdateStatus: PettyCashVoucherUpdateStatusHandler;
  record: PettyCashVoucherRecord;
};
