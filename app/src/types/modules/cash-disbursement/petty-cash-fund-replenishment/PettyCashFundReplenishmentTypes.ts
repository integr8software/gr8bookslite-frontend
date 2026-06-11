export type PettyCashFundReplenishmentStatus = "Active" | "Pending" | "Closed";

export type PettyCashFundReplenishmentRecord = {
  id: string;
  replenishmentNo: string;
  vceCode: string;
  vceName: string;
  documentDate: string;
  totalAmount: string;
  status: PettyCashFundReplenishmentStatus;
};

export type PettyCashFundReplenishmentEntry = {
  id: string;
  pettyCashDate: string;
  pettyCashNo: string;
  code: string;
  name: string;
  totalAmount: string;
  netAmount: string;
  vatAmount: string;
  remarks: string;
};

export type PettyCashFundReplenishmentFormValues = {
  documentDate: string;
  projectName: string;
  projectRef: string;
  remarks: string;
  status: PettyCashFundReplenishmentStatus;
  transNo: string;
  vceCode: string;
  vceName: string;
};

export type PettyCashFundReplenishmentFormErrors = Partial<
  Record<keyof PettyCashFundReplenishmentFormValues | "entries", string>
>;

export type PettyCashFundReplenishmentTotals = {
  netAmount: string;
  totalAmount: string;
  vatAmount: string;
};

export type PettyCashFundReplenishmentCopyFromRecord = {
  amount: string;
  documentDate: string;
  id: string;
  vceCode: string;
  vceName: string;
  voucherNo: string;
};

export type PettyCashFundReplenishmentCopySource =
  | "Petty Cash Voucher"
  | "Petty Cash Fund";

export type PettyCashFundReplenishmentFormMode = "add" | "edit" | "view";
