import { PostDatedCheckStorageKey } from "@/app/src/constants/modules/cash-receipt/post-dated-check/PostDatedCheckConstants";
import type {
  PostDatedCheckDetail,
  PostDatedCheckFormValues,
  PostDatedCheckParty,
  PostDatedCheckRecord,
} from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export const MockPostDatedCheckParties: PostDatedCheckParty[] = [
  { id: "party-1001", partyCode: "CUS-0001", partyName: "Pacific Office Supplies Inc." },
  { id: "party-1002", partyCode: "CUS-0002", partyName: "Manila Retail Solutions Corp." },
  { id: "party-1003", partyCode: "CUS-0003", partyName: "Cebu Prime Distribution" },
  { id: "party-1004", partyCode: "CUS-0004", partyName: "Northstar Trading Company" },
  { id: "party-1005", partyCode: "CUS-0005", partyName: "Emerald Food Services" },
];

export const MockPostDatedCheckCopyFromRecords: AppCopyFromRecord[] = [
  {
    id: "si-2026-0081",
    source: "Sales Invoice",
    sourceNo: "SI-2026-0081",
    documentDate: "2026-08-05",
    partyName: "Pacific Office Supplies Inc.",
    amount: "85000.00",
    remarks: "Office supplies invoice",
  },
  {
    id: "si-2026-0084",
    source: "Sales Invoice",
    sourceNo: "SI-2026-0084",
    documentDate: "2026-08-08",
    partyName: "Cebu Prime Distribution",
    amount: "98500.00",
    remarks: "Cebu branch sale",
  },
  {
    id: "bi-2026-0042",
    source: "Billing Invoice",
    sourceNo: "BI-2026-0042",
    documentDate: "2026-08-03",
    partyName: "Manila Retail Solutions Corp.",
    amount: "137500.00",
    remarks: "July billing",
  },
  {
    id: "bi-2026-0045",
    source: "Billing Invoice",
    sourceNo: "BI-2026-0045",
    documentDate: "2026-08-09",
    partyName: "Northstar Trading Company",
    amount: "90000.00",
    remarks: "Quarterly billing",
  },
  {
    id: "svi-2026-0027",
    source: "Service Invoice",
    sourceNo: "SVI-2026-0027",
    documentDate: "2026-08-07",
    partyName: "Emerald Food Services",
    amount: "25750.00",
    remarks: "Equipment servicing",
  },
];

export const MockPostDatedCheckRegistries: PostDatedCheckRecord[] = [
  createMockRegistry(
    "pdc-reg-001",
    "PDC-2026-0001",
    "2026-08-01",
    "party-1001",
    "CUS-0001",
    "Pacific Office Supplies Inc.",
    "Monthly office supplies settlement.",
    "Posted",
    [
      ["2026-08-15", "BDO Unibank", "00018452", "SI-2026-0081", 42500],
      ["2026-09-15", "BDO Unibank", "00018453", "SI-2026-0081", 42500],
    ],
  ),
  createMockRegistry(
    "pdc-reg-002",
    "PDC-2026-0002",
    "2026-08-03",
    "party-1002",
    "CUS-0002",
    "Manila Retail Solutions Corp.",
    "Two-check settlement for July invoices.",
    "For Approval",
    [
      ["2026-08-30", "Bank of the Philippine Islands", "BPI-771204", "BI-2026-0042", 68750],
      ["2026-09-30", "Bank of the Philippine Islands", "BPI-771205", "BI-2026-0042", 68750],
    ],
  ),
  createMockRegistry(
    "pdc-reg-003",
    "PDC-2026-0003",
    "2026-08-05",
    "party-1003",
    "CUS-0003",
    "Cebu Prime Distribution",
    "Cebu branch customer payment.",
    "Draft",
    [["2026-08-28", "Metrobank", "MB-903118", "SI-2026-0084", 98500]],
  ),
  createMockRegistry(
    "pdc-reg-004",
    "PDC-2026-0004",
    "2026-08-06",
    "party-1004",
    "CUS-0004",
    "Northstar Trading Company",
    "Replacement checks received and verified.",
    "Disapproved",
    [
      ["2026-09-05", "Security Bank", "SB-440091", "BI-2026-0045", 30000],
      ["2026-10-05", "Security Bank", "SB-440092", "BI-2026-0045", 30000],
      ["2026-11-05", "Security Bank", "SB-440093", "BI-2026-0045", 30000],
    ],
  ),
  createMockRegistry(
    "pdc-reg-005",
    "PDC-2026-0005",
    "2026-08-08",
    "party-1005",
    "CUS-0005",
    "Emerald Food Services",
    "Cancelled after customer requested check replacement.",
    "Cancelled",
    [["2026-08-25", "UnionBank", "UB-118807", "SVI-2026-0027", 25750]],
  ),
];

export function createPostDatedCheckDetail(index = 0): PostDatedCheckDetail {
  return {
    id: `pdc-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    lineNumber: index + 1,
    pdcDate: "",
    pdcBank: "",
    pdcNo: "",
    referenceNo: "",
    amount: 0,
  };
}

export function createNextPostDatedCheckDetail(
  previous: PostDatedCheckDetail,
  index: number,
  existingDetails: PostDatedCheckDetail[],
): PostDatedCheckDetail {
  return {
    ...createPostDatedCheckDetail(index),
    pdcBank: previous.pdcBank,
    pdcNo: getNextCheckNumber(previous, existingDetails),
  };
}

function getNextCheckNumber(previous: PostDatedCheckDetail, existingDetails: PostDatedCheckDetail[]) {
  const match = previous.pdcNo.match(/^(.*?)(\d+)$/);
  if (!match) return previous.pdcNo;

  const [, prefix, digits] = match;
  const normalizedBank = previous.pdcBank.trim().toLowerCase();
  const highestNumber = existingDetails.reduce((highest, detail) => {
    if (detail.pdcBank.trim().toLowerCase() !== normalizedBank) return highest;
    const candidate = detail.pdcNo.match(/^(.*?)(\d+)$/);
    if (!candidate || candidate[1].toLowerCase() !== prefix.toLowerCase()) return highest;
    return Math.max(highest, Number(candidate[2]));
  }, Number(digits));
  const incremented = String(highestNumber + 1).padStart(digits.length, "0");
  return `${prefix}${incremented}`;
}
export function createPostDatedCheckValues(): PostDatedCheckFormValues {
  return {
    registryNo: "",
    registryDate: new Date().toISOString().slice(0, 10),
    partyId: "",
    partyCode: "",
    partyName: "",
    type: "Lodgment",
    remarks: "",
    details: [createPostDatedCheckDetail()],
  };
}
export function renumberPostDatedCheckDetails(details: PostDatedCheckDetail[]) {
  return details.map((detail, index) => ({ ...detail, lineNumber: index + 1 }));
}
export function getPostDatedCheckTotal(details: PostDatedCheckDetail[]) {
  return details.reduce((sum, detail) => sum + Number(detail.amount || 0), 0);
}

export function getInitialPostDatedCheckRegistries() {
  return readStoredPostDatedCheckRegistries() ?? MockPostDatedCheckRegistries.map(cloneRegistry);
}

export function readStoredPostDatedCheckRegistries() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(PostDatedCheckStorageKey);
  if (!stored) return null;
  try {
    const records = JSON.parse(stored) as PostDatedCheckRecord[];
    return Array.isArray(records) ? records.map(cloneRegistry) : null;
  } catch {
    return null;
  }
}

export function writeStoredPostDatedCheckRegistries(records: PostDatedCheckRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PostDatedCheckStorageKey, JSON.stringify(records));
}

function createMockRegistry(
  id: string,
  registryNo: string,
  registryDate: string,
  partyId: string,
  partyCode: string,
  partyName: string,
  remarks: string,
  status: PostDatedCheckRecord["status"],
  checks: Array<[string, string, string, string, number]>,
): PostDatedCheckRecord {
  const details = checks.map(([pdcDate, pdcBank, pdcNo, referenceNo, amount], index) => ({
    id: `${id}-line-${index + 1}`,
    lineNumber: index + 1,
    pdcDate,
    pdcBank,
    pdcNo,
    referenceNo,
    amount,
  }));
  return {
    id,
    branchUnitId: 1,
    registryNo,
    registryDate,
    partyId,
    partyCode,
    partyName,
    type: status === "Posted" || status === "Cancelled" ? "Release" : "Lodgment",
    remarks,
    totalAmount: getPostDatedCheckTotal(details),
    status,
    details,
    createdAt: `${registryDate}T08:00:00.000Z`,
    updatedAt: `${registryDate}T08:00:00.000Z`,
  };
}

function cloneRegistry(record: PostDatedCheckRecord): PostDatedCheckRecord {
  return {
    ...record,
    type: record.type ?? "Lodgment",
    details: record.details.map((detail) => ({ ...detail, referenceNo: detail.referenceNo ?? "" })),
  };
}
