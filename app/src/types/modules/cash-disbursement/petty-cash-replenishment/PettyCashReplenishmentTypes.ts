export type PettyCashReplenishmentStatus = "Active" | "Pending" | "Closed";

export type PettyCashReplenishmentRecord = {
  id: string;
  replenishmentNo: string;
  vceCode: string;
  vceName: string;
  documentDate: string;
  totalAmount: string;
  status: PettyCashReplenishmentStatus;
};

export type PettyCashReplenishmentEntry = {
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

export type PettyCashReplenishmentFormValues = {
  documentDate: string;
  projectName: string;
  projectRef: string;
  remarks: string;
  status: PettyCashReplenishmentStatus;
  transNo: string;
  vceCode: string;
  vceName: string;
};

export type PettyCashReplenishmentFormErrors = Partial<
  Record<keyof PettyCashReplenishmentFormValues | "entries", string>
>;

export type PettyCashReplenishmentTotals = {
  netAmount: string;
  totalAmount: string;
  vatAmount: string;
};

export type PettyCashReplenishmentCopyFromRecord = {
  amount: string;
  documentDate: string;
  id: string;
  vceCode: string;
  vceName: string;
  voucherNo: string;
};

export type PettyCashReplenishmentCopySource =
  | "Petty Cash Voucher"
  | "Petty Cash Fund";
