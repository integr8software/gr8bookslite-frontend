import { RequestForPaymentStatuses } from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentFormValues,
  RequestForPaymentItem,
  RequestForPaymentPaymentMethod,
  RequestForPaymentRecord,
  RequestForPaymentStatus,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { formatAmount } from "@/app/src/utils/currency.util";
import { addDays, todayDateValue } from "@/app/src/utils/date.util";

function createSeed(
  id: string,
  transactionNo: string,
  documentDate: string,
  dateNeeded: string,
  partyCode: string,
  partyName: string,
  paymentMethod: RequestForPaymentPaymentMethod,
  responsibilityCenterCode: string,
  responsibilityCenterName: string,
  amount: number,
  remarks: string,
  status: RequestForPaymentStatus,
  items: RequestForPaymentItem[],
): RequestForPaymentRecord {
  return {
    id,
    transactionNo,
    documentDate,
    dateNeeded,
    partyCode,
    partyName,
    paymentMethod,
    responsibilityCenterCode,
    responsibilityCenterName,
    amount,
    currency: "PHP",
    remarks,
    status,
    createdBy: "Raymark B. Arsicolo",
    createdAt: `${documentDate}T08:30:00.000Z`,
    updatedBy: "Raymark B. Arsicolo",
    updatedAt: `${documentDate}T09:15:00.000Z`,
    formValues: {
      transactionNo,
      documentDate,
      dateNeeded,
      status,
      partyCode,
      partyName,
      paymentMethod,
      responsibilityCenter: responsibilityCenterName,
      responsibilityCenterCode,
      projectCode: "PRJ-001",
      projectName: "Main Office Operations",
      currency: "PHP",
      exchangeRate: "1.00",
      remarks,
      items,
      attachments: [],
    },
  };
}

export const RequestForPaymentSeedRecords: RequestForPaymentRecord[] = [
  createSeed(
    "1",
    "RFP-000005",
    "2026-02-24",
    "2026-03-02",
    "S000041",
    "Pacific Office Solutions, Inc.",
    "Bank Transfer",
    "RC-IT",
    "Information Technology",
    125000,
    "Payment request for server equipment and annual license renewal",
    RequestForPaymentStatuses.forApproval,
    [
      {
        id: "rfp-item-1",
        date: "2026-02-24",
        refType: "PO",
        refNumber: "PO-2026-0089",
        particulars: "Hardware equipment batch 1",
        responsibilityCenterCode: "RC-IT",
        responsibilityCenterName: "Information Technology",
        amount: "75,000.00",
      },
      {
        id: "rfp-item-2",
        date: "2026-02-24",
        refType: "Billing",
        refNumber: "BIL-99402",
        particulars: "Data center colocation fee",
        responsibilityCenterCode: "RC-IT",
        responsibilityCenterName: "Information Technology",
        amount: "35,000.00",
      },
      {
        id: "rfp-item-3",
        date: "2026-02-24",
        refType: "Expense",
        refNumber: "EXP-10492",
        particulars: "Cabling and onsite setup",
        responsibilityCenterCode: "RC-OPS",
        responsibilityCenterName: "Operations",
        amount: "15,000.00",
      },
    ],
  ),
  createSeed(
    "2",
    "RFP-000004",
    "2026-02-20",
    "2026-02-27",
    "S000058",
    "Metro Industrial Trading",
    "Check",
    "RC-OPS",
    "Operations",
    48500,
    "Facility maintenance supplies and HVAC inspection payment",
    RequestForPaymentStatuses.approved,
    [
      {
        id: "rfp-item-4",
        date: "2026-02-20",
        refType: "PO",
        refNumber: "PO-2026-0074",
        particulars: "Warehouse spare parts and air filters",
        responsibilityCenterCode: "RC-OPS",
        responsibilityCenterName: "Operations",
        amount: "32,500.00",
      },
      {
        id: "rfp-item-5",
        date: "2026-02-20",
        refType: "Billing",
        refNumber: "INV-44102",
        particulars: "Quarterly HVAC servicing labor charge",
        responsibilityCenterCode: "RC-OPS",
        responsibilityCenterName: "Operations",
        amount: "16,000.00",
      },
    ],
  ),
  createSeed(
    "3",
    "RFP-000003",
    "2026-02-15",
    "2026-02-22",
    "V100006",
    "All4U Restaurant",
    "Cash",
    "RC-ADM",
    "Administration",
    8650,
    "Staff quarterly alignment lunch catering",
    RequestForPaymentStatuses.draft,
    [
      {
        id: "rfp-item-6",
        date: "2026-02-15",
        refType: "Expense",
        refNumber: "EXP-09821",
        particulars: "Catering package for 35 pax",
        responsibilityCenterCode: "RC-ADM",
        responsibilityCenterName: "Administration",
        amount: "8,650.00",
      },
    ],
  ),
  createSeed(
    "4",
    "RFP-000002",
    "2026-02-10",
    "2026-02-14",
    "S000073",
    "Northstar Equipment Supply",
    "Check",
    "RC-OPS",
    "Operations",
    62000,
    "Disapproved requisition due to missing quotation attachment",
    RequestForPaymentStatuses.disapproved,
    [
      {
        id: "rfp-item-7",
        date: "2026-02-10",
        refType: "Manual",
        refNumber: "REQ-0012",
        particulars: "Electric pallet jack repair parts",
        responsibilityCenterCode: "RC-OPS",
        responsibilityCenterName: "Operations",
        amount: "62,000.00",
      },
    ],
  ),
  createSeed(
    "5",
    "RFP-000001",
    "2026-02-01",
    "2026-02-08",
    "S000041",
    "Pacific Office Solutions, Inc.",
    "Bank Transfer",
    "RC-ADM",
    "Administration",
    18200,
    "Cancelled payment request - consolidated into RFP-000005",
    RequestForPaymentStatuses.cancelled,
    [
      {
        id: "rfp-item-8",
        date: "2026-02-01",
        refType: "Billing",
        refNumber: "BIL-90112",
        particulars: "Monthly copier rental",
        responsibilityCenterCode: "RC-ADM",
        responsibilityCenterName: "Administration",
        amount: "18,200.00",
      },
    ],
  ),
];

export const RequestForPaymentCopyFromRecords: AppCopyFromRecord[] = [
  {
    amount: "75,000.00",
    documentDate: "2026-02-24",
    id: "po-copy-000089",
    partyName: "Pacific Office Solutions, Inc.",
    remarks: "Hardware equipment batch 1",
    source: "Purchase Order",
    sourceNo: "PO-2026-0089",
  },
  {
    amount: "35,000.00",
    documentDate: "2026-02-22",
    id: "bil-copy-0099402",
    partyName: "Pacific Office Solutions, Inc.",
    remarks: "Data center colocation fee",
    source: "Billing Invoice",
    sourceNo: "BIL-99402",
  },
  {
    amount: "15,000.00",
    documentDate: "2026-02-18",
    id: "exp-copy-0010492",
    partyName: "Maria L. Dela Cruz",
    remarks: "Cabling and onsite setup",
    source: "Expense Claim",
    sourceNo: "EXP-10492",
  },
];

export function createBlankRequestForPaymentItem(): RequestForPaymentItem {
  return {
    id: `rfp-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayDateValue(),
    refType: "Manual",
    refNumber: "",
    particulars: "",
    responsibilityCenterCode: "",
    responsibilityCenterName: "",
    amount: "",
    remarks: "",
  };
}

export function createRequestForPaymentFormValues(
  record?: RequestForPaymentRecord,
  transactionNo = "RFP-000001",
  baseCurrencyCode = "PHP",
): RequestForPaymentFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      items: record.formValues.items.map((item) => ({ ...item })),
      attachments: record.formValues.attachments.map((item) => ({ ...item })),
    };
  }

  if (record) {
    return {
      transactionNo: record.transactionNo,
      documentDate: record.documentDate,
      dateNeeded: record.dateNeeded,
      status: record.status,
      partyCode: record.partyCode,
      partyName: record.partyName,
      paymentMethod: record.paymentMethod,
      responsibilityCenter: record.responsibilityCenterName,
      responsibilityCenterCode: record.responsibilityCenterCode,
      projectCode: record.projectCode ?? "",
      projectName: record.projectName ?? "",
      bankName: record.bankName ?? "",
      bankAccountNo: record.bankAccountNo ?? "",
      currency: record.currency || baseCurrencyCode,
      exchangeRate: "1.00",
      remarks: record.remarks,
      items: [
        {
          ...createBlankRequestForPaymentItem(),
          date: record.documentDate,
          amount: formatMoneyNumberDisplayValue(String(record.amount)),
          particulars: record.remarks,
          responsibilityCenterCode: record.responsibilityCenterCode,
          responsibilityCenterName: record.responsibilityCenterName,
        },
      ],
      attachments: [],
    };
  }

  const today = todayDateValue();
  const nextWeek = addDays(new Date(), 7);

  return {
    transactionNo,
    documentDate: today,
    dateNeeded: nextWeek ? nextWeek.toISOString().slice(0, 10) : today,
    status: RequestForPaymentStatuses.open,
    partyCode: "",
    partyName: "",
    paymentMethod: "Check",
    responsibilityCenter: "",
    responsibilityCenterCode: "",
    projectCode: "",
    projectName: "",
    bankName: "",
    bankAccountNo: "",
    currency: baseCurrencyCode,
    exchangeRate: "1.00",
    remarks: "",
    items: [createBlankRequestForPaymentItem()],
    attachments: [],
  };
}

export function calculateRequestForPaymentTotals(items: RequestForPaymentItem[]) {
  const totalAmount = items.reduce((sum, item) => sum + parseMoneyNumberInput(item.amount), 0);
  return {
    totalAmount,
    totalItems: items.length,
  };
}

export function formatRequestForPaymentAmount(value: number) {
  return formatAmount(value);
}

export function createRequestForPaymentRecord(
  values: RequestForPaymentFormValues,
  status: RequestForPaymentStatus,
  existing?: RequestForPaymentRecord,
): RequestForPaymentRecord {
  const now = new Date().toISOString();
  const totals = calculateRequestForPaymentTotals(values.items);

  return {
    id: existing?.id ?? `rfp-rec-${Date.now()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    dateNeeded: values.dateNeeded,
    partyCode: values.partyCode,
    partyName: values.partyName,
    paymentMethod: values.paymentMethod,
    responsibilityCenterCode: values.responsibilityCenterCode,
    responsibilityCenterName: values.responsibilityCenter || "",
    projectCode: values.projectCode,
    projectName: values.projectName,
    bankName: values.bankName,
    bankAccountNo: values.bankAccountNo,
    amount: totals.totalAmount,
    currency: values.currency,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Raymark B. Arsicolo",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Raymark B. Arsicolo",
    updatedAt: now,
    formValues: {
      ...values,
      status,
      items: values.items.map((item) => ({ ...item })),
      attachments: values.attachments.map((item) => ({ ...item })),
    },
  };
}
