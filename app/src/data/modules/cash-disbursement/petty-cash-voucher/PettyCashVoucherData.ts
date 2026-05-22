import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

export const PettyCashVoucherRecords: PettyCashVoucherRecord[] = [
  {
    id: "1",
    voucherNo: "PCV-2026-001",
    vceCode: "VCE-1098",
    vceName: "Waldo Enterprises",
    accountCode: "101-200",
    amount: "12,500.00",
    documentDate: "2026-05-21",
    status: "Pending",
  },
  {
    id: "2",
    voucherNo: "PCV-2026-002",
    vceCode: "VCE-1134",
    vceName: "Pacific Supplies",
    accountCode: "101-300",
    amount: "8,320.50",
    documentDate: "2026-05-18",
    status: "Approved",
  },
  {
    id: "3",
    voucherNo: "PCV-2026-003",
    vceCode: "VCE-1210",
    vceName: "Greenfield Logistics",
    accountCode: "101-210",
    amount: "4,200.00",
    documentDate: "2026-05-14",
    status: "Cancelled",
  },
];

export const PettyCashVoucherInitialFormValues: PettyCashVoucherFormValues = {
  accountCode: "",
  accountTitle: "",
  amount: "",
  costCenter: "",
  documentDate: "",
  netAmount: "",
  remarks: "",
  status: "Pending",
  transactionNo: "",
  vatable: "False",
  vatAmount: "",
  vceCode: "",
  vceName: "",
};
