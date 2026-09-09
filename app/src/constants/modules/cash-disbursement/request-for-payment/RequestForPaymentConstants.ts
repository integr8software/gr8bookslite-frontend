import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  RequestForPaymentActionTab,
  RequestForPaymentConfirmationAction,
  RequestForPaymentItemColumnId,
  RequestForPaymentStatus,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const RequestForPaymentLink = getModuleRoute("RFP");
export const RequestForPaymentAddLink = `${RequestForPaymentLink}/add`;
export const getRequestForPaymentEditLink = (recordId: string) => `${RequestForPaymentLink}/edit/${recordId}`;
export const getRequestForPaymentViewLink = (recordId: string) => `${RequestForPaymentLink}/view/${recordId}`;
export const RequestForPaymentStorageKey = "cash-disbursement-request-for-payment-records";
export const RequestForPaymentPaginationStorageKey = "cash-disbursement-request-for-payment-table";
export const RequestForPaymentTransactionPrefix = "RFP";
export const RequestForPaymentBackendModuleKey = "cash-disbursement:request-for-payment";

export const RequestForPaymentCopyFromSources = [
  "Purchase Order",
  "Billing Invoice",
  "Expense Claim",
] as const;

export const RequestForPaymentColumnLabels = {
  transactionNo: "RFP No.",
  documentDate: "Document Date",
  dateNeeded: "Date Needed",
  partyCode: "Payee Code",
  partyName: "Payee Name",
  paymentMethod: "Payment Method",
  responsibilityCenterName: "Responsibility Center",
  amount: "Total Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  createdAt: "Date Created",
  updatedBy: "Updated By",
  updatedAt: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;

export const RequestForPaymentDefaultVisibleColumnIds = [
  "transactionNo",
  "documentDate",
  "dateNeeded",
  "partyName",
  "paymentMethod",
  "amount",
  "status",
  "actions",
] as const;

export const RequestForPaymentDefaultColumnVisibility = Object.fromEntries(
  Object.keys(RequestForPaymentColumnLabels).map((columnId) => [
    columnId,
    RequestForPaymentDefaultVisibleColumnIds.includes(
      columnId as (typeof RequestForPaymentDefaultVisibleColumnIds)[number],
    ),
  ]),
);

export const RequestForPaymentStatuses = {
  cancelled: "Cancelled",
  closed: "Closed",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  approved: "Approved",
} as const;

export const RequestForPaymentConfirmationDialogTitles: Record<RequestForPaymentConfirmationAction, string> = {
  save: "Save Request for Payment?",
  draft: "Save Request for Payment as Draft?",
  approve: "Approve Request for Payment?",
  disapprove: "Disapprove Request for Payment?",
  cancel: "Cancel Request for Payment?",
};

export const RequestForPaymentConfirmationDialogConfirmLabels: Record<RequestForPaymentConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
  approve: "Approve",
  disapprove: "Disapprove",
  cancel: "Cancel",
};

export const RequestForPaymentRecordStatuses = [
  "Approved",
  "For Approval",
  "Draft",
  "Disapproved",
  "Cancelled",
  "Closed",
] as const satisfies readonly RequestForPaymentStatus[];

export const RequestForPaymentStatusOptions = ["All", ...RequestForPaymentRecordStatuses] as const;

export const RequestForPaymentActionTabs: { id: RequestForPaymentActionTab; label: string }[] = [
  { id: "details", label: "Request Details" },
  { id: "attachments", label: "File Attachments" },
];

export const RequestForPaymentDefaultItemColumnIds: RequestForPaymentItemColumnId[] = [
  "date",
  "refType",
  "refNumber",
  "particulars",
  "responsibilityCenterName",
  "amount",
];

export const RequestForPaymentDefaultVisibleItemColumnIds: RequestForPaymentItemColumnId[] = [
  "date",
  "refType",
  "refNumber",
  "particulars",
  "responsibilityCenterName",
  "amount",
];

export const RequestForPaymentItemColumnLabels: Record<RequestForPaymentItemColumnId, string> = {
  date: "Date",
  refType: "Ref Type",
  refNumber: "Ref Number",
  particulars: "Particulars",
  responsibilityCenterCode: "RC Code",
  responsibilityCenterName: "Responsibility Center",
  amount: "Amount",
};

export const RequestForPaymentItemColumnWidths: Record<RequestForPaymentItemColumnId, number> = {
  date: 140,
  refType: 140,
  refNumber: 170,
  particulars: 260,
  responsibilityCenterCode: 150,
  responsibilityCenterName: 200,
  amount: 180,
};

export const RequestForPaymentProtectedItemColumnIds = new Set<RequestForPaymentItemColumnId>(["particulars", "amount"]);

export const RequestForPaymentPaymentMethodOptions: AppAdvancedDropdownOption[] = [
  { label: "Check", name: "Check", value: "Check" },
  { label: "Cash", name: "Cash", value: "Cash" },
  { label: "Bank Transfer", name: "Bank Transfer", value: "Bank Transfer" },
  { label: "Online", name: "Online", value: "Online" },
];

export const RequestForPaymentRefTypeOptions: AppAdvancedDropdownOption[] = [
  { label: "PO", name: "Purchase Order", value: "PO" },
  { label: "Billing", name: "Billing Invoice", value: "Billing" },
  { label: "Expense", name: "Expense Claim", value: "Expense" },
  { label: "Contract", name: "Contract / Agreement", value: "Contract" },
  { label: "Manual", name: "Manual Request", value: "Manual" },
];

export const RequestForPaymentPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "V100006", name: "All4U Restaurant", value: "V100006" },
  { label: "S000041", name: "Pacific Office Solutions, Inc.", value: "S000041" },
  { label: "S000058", name: "Metro Industrial Trading", value: "S000058" },
  { label: "S000073", name: "Northstar Equipment Supply", value: "S000073" },
  { label: "E000102", name: "Raymark B. Arsicolo", value: "E000102" },
  { label: "E000117", name: "Maria L. Dela Cruz", value: "E000117" },
  { label: "E000145", name: "Jose P. Santos", value: "E000145" },
];

export const RequestForPaymentResponsibilityCenterLookupOptions: AppAdvancedDropdownOption[] = [
  { label: "RC-ADM", name: "Administration", value: "RC-ADM" },
  { label: "RC-OPS", name: "Operations", value: "RC-OPS" },
  { label: "RC-SAL", name: "Sales", value: "RC-SAL" },
  { label: "RC-IT", name: "Information Technology", value: "RC-IT" },
];

export const RequestForPaymentProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
  { label: "PRJ-003", name: "IT Infrastructure Upgrade", value: "PRJ-003" },
];

export const RequestForPaymentBankOptions: AppAdvancedDropdownOption[] = [
  { label: "BDO-001", name: "BDO Unibank - 001150002717", value: "BDO-001" },
  { label: "BPI-002", name: "BPI Checking - 2390119283", value: "BPI-002" },
  { label: "MBTC-003", name: "Metrobank - 6520991823", value: "MBTC-003" },
];

export function canEditRequestForPayment(status: RequestForPaymentStatus) {
  return (
    status === RequestForPaymentStatuses.draft ||
    status === RequestForPaymentStatuses.forApproval ||
    status === RequestForPaymentStatuses.disapproved
  );
}
