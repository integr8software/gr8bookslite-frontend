import type {
  PettyCashFundReplenishmentCopyFromRecord,
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentFormValues,
  PettyCashFundReplenishmentRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";

export const PettyCashFundReplenishmentRecords: PettyCashFundReplenishmentRecord[] = [
  {
    id: "1",
    replenishmentNo: "PCR-2026-001",
    vceCode: "VCE-1081",
    vceName: "Metro Supplies Inc.",
    documentDate: "2026-05-21",
    totalAmount: "18,750.00",
    status: "Active",
  },
  {
    id: "2",
    replenishmentNo: "PCR-2026-002",
    vceCode: "VCE-1143",
    vceName: "Northfield Traders",
    documentDate: "2026-05-18",
    totalAmount: "9,420.50",
    status: "Closed",
  },
  {
    id: "3",
    replenishmentNo: "PCR-2026-003",
    vceCode: "VCE-1195",
    vceName: "Oceanic Logistics",
    documentDate: "2026-05-14",
    totalAmount: "12,500.00",
    status: "Pending",
  },
];

export const PettyCashFundReplenishmentInitialFormValues: PettyCashFundReplenishmentFormValues =
  {
    documentDate: "2026-05-21",
    projectName: "",
    projectRef: "",
    remarks: "",
    status: "Active",
    transNo: "",
    vceCode: "",
    vceName: "",
  };

export const PettyCashFundReplenishmentInitialEntries: PettyCashFundReplenishmentEntry[] =
  [
    {
      id: "1",
      pettyCashDate: "2026-05-21",
      pettyCashNo: "PC-001",
      code: "101-300",
      name: "Office Supplies",
      totalAmount: "8,750.00",
      netAmount: "8,000.00",
      vatAmount: "750.00",
      remarks: "Stationery and printer ink",
    },
  ];

export function createPettyCashFundReplenishmentFormValues(
  record: PettyCashFundReplenishmentRecord,
): PettyCashFundReplenishmentFormValues {
  return {
    ...PettyCashFundReplenishmentInitialFormValues,
    documentDate: record.documentDate,
    status: record.status,
    transNo: record.replenishmentNo,
    vceCode: record.vceCode,
    vceName: record.vceName,
  };
}

export const PettyCashFundReplenishmentCopyFromRecords: PettyCashFundReplenishmentCopyFromRecord[] =
  [
    {
      id: "1",
      voucherNo: "PCV-2026-001",
      vceCode: "VCE-1098",
      vceName: "Waldo Enterprises",
      amount: "12,500.00",
      documentDate: "2026-05-21",
    },
    {
      id: "2",
      voucherNo: "PCV-2026-002",
      vceCode: "VCE-1134",
      vceName: "Pacific Supplies",
      amount: "8,320.50",
      documentDate: "2026-05-18",
    },
    {
      id: "3",
      voucherNo: "PCV-2026-003",
      vceCode: "VCE-1210",
      vceName: "Greenfield Logistics",
      amount: "4,200.00",
      documentDate: "2026-05-14",
    },
    {
      id: "4",
      voucherNo: "PCV-2026-004",
      vceCode: "VCE-1156",
      vceName: "Summit Trading Co.",
      amount: "15,600.00",
      documentDate: "2026-05-10",
    },
  ];

export function createEmptyPettyCashFundReplenishmentEntry(): PettyCashFundReplenishmentEntry {
  return {
    id: String(Date.now()),
    pettyCashDate: "",
    pettyCashNo: "",
    code: "",
    name: "",
    totalAmount: "0.00",
    netAmount: "0.00",
    vatAmount: "0.00",
    remarks: "",
  };
}

export function calculatePettyCashFundReplenishmentTotals(
  entries: PettyCashFundReplenishmentEntry[],
) {
  const totalAmount = entries.reduce(
    (sum, entry) => sum + parseAmount(entry.totalAmount),
    0,
  );
  const vatAmount = entries.reduce(
    (sum, entry) => sum + parseAmount(entry.vatAmount),
    0,
  );
  const netAmount = entries.reduce(
    (sum, entry) => sum + parseAmount(entry.netAmount),
    0,
  );

  return {
    totalAmount: totalAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
    netAmount: netAmount.toFixed(2),
  };
}

function parseAmount(value: string) {
  return Number(value.replace(/,/g, "")) || 0;
}
