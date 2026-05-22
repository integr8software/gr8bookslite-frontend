export type PettyCashVoucherStatus = "Pending" | "Approved" | "Cancelled";

export type PettyCashVoucherRecord = {
  id: string;
  voucherNo: string;
  vceCode: string;
  vceName: string;
  accountCode: string;
  amount: string;
  documentDate: string;
  status: PettyCashVoucherStatus;
};

export type PettyCashVoucherFormValues = {
  accountCode: string;
  accountTitle: string;
  amount: string;
  costCenter: string;
  documentDate: string;
  netAmount: string;
  remarks: string;
  status: PettyCashVoucherStatus;
  transactionNo: string;
  vatable: "False" | "True";
  vatAmount: string;
  vceCode: string;
  vceName: string;
};

export type PettyCashVoucherFormErrors = Partial<
  Record<keyof PettyCashVoucherFormValues, string>
>;

export type PettyCashVoucherFormMode = "add" | "edit" | "view";
