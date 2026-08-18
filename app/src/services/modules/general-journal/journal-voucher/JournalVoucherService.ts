import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  JournalVoucherRecord,
  JournalVoucherStatus,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

export type JournalVoucherListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: "transactionNo" | "documentDate" | "totalDebit" | "totalCredit" | "currencyCode" | "status" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  status?: JournalVoucherStatus | "all" | null;
};

export type JournalVoucherPermissions = {
  canApprove: boolean;
  canCancel: boolean;
  canCreate: boolean;
  canDisapprove: boolean;
  canExport: boolean;
  canPost: boolean;
  canSubmitForApproval: boolean;
  canUncancel: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type JournalVoucherStatistics = {
  cancelledVouchers: number;
  disapprovedVouchers: number;
  draftVouchers: number;
  forApprovalVouchers: number;
  postedVouchers: number;
  totalVouchers: number;
};

export type JournalVoucherListData = {
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  permissions: JournalVoucherPermissions;
  records: JournalVoucherRecord[];
  statistics: JournalVoucherStatistics;
};

export type JournalVoucherNumberSuggestion = {
  branchUnitId: number;
  inputMode: "AUTO" | "MANUAL";
  moduleCode: string;
  sequenceId: number;
  transactionNo: string;
};

type ApiJournalVoucherStatus = "DRAFT" | "FOR_APPROVAL" | "POSTED" | "DISAPPROVED" | "CANCELLED";

type ApiJournalVoucherLine = {
  accountCode: string;
  accountId?: string | null;
  accountTitle: string;
  atcCode?: string | null;
  credit: number | string;
  debit: number | string;
  id: string;
  lineNumber: number;
  particulars?: string | null;
  partyCode?: string | null;
  partyName?: string | null;
  refNo?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterId?: string | null;
  vatType?: string | null;
};

type ApiJournalVoucherListItem = {
  branchUnitId: number;
  createdAt: string;
  currencyCode: string;
  documentDate: string;
  exchangeRate: number | string;
  id: string;
  remarks?: string | null;
  status: ApiJournalVoucherStatus;
  totalCredit: number | string;
  totalDebit: number | string;
  transactionNo: string;
  updatedAt: string;
};

type ApiJournalVoucher = ApiJournalVoucherListItem & {
  companyId: number;
  lines: ApiJournalVoucherLine[];
};

type ApiJournalVoucherListResponse = {
  pagination: JournalVoucherListData["pagination"];
  permissions: JournalVoucherPermissions;
  statistics: Partial<JournalVoucherStatistics>;
  vouchers: ApiJournalVoucherListItem[];
};

type ApiJournalVoucherResponse = {
  message?: string;
  permissions: JournalVoucherPermissions;
  voucher: ApiJournalVoucher;
};

const JournalVoucherApiPath = "/general-journal/journal-voucher";

const StatusFromApi: Record<ApiJournalVoucherStatus, JournalVoucherStatus> = {
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<JournalVoucherStatus, ApiJournalVoucherStatus> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

export async function fetchJournalVouchers(query: JournalVoucherListQuery = {}): Promise<JournalVoucherListData> {
  const response = await ApiClient.get<ApiJournalVoucherListResponse>(JournalVoucherApiPath, {
    params: cleanQueryParams({
      amountFrom: query.amountFrom,
      amountTo: query.amountTo,
      branchUnitId: query.branchUnitId,
      documentDateFrom: query.documentDateFrom,
      documentDateTo: query.documentDateTo,
      limit: query.limit ?? 500,
      page: query.page ?? 1,
      search: query.search,
      sortBy: query.sortBy ?? "documentDate",
      sortDirection: query.sortDirection ?? "desc",
      status: query.status && query.status !== "all" ? mapStatusToApi(query.status) : undefined,
    }),
  });

  return {
    pagination: response.data.pagination,
    permissions: response.data.permissions,
    records: response.data.vouchers.map(mapApiJournalVoucherListItem),
    statistics: {
      cancelledVouchers: response.data.statistics.cancelledVouchers ?? 0,
      disapprovedVouchers: response.data.statistics.disapprovedVouchers ?? 0,
      draftVouchers: response.data.statistics.draftVouchers ?? 0,
      forApprovalVouchers: response.data.statistics.forApprovalVouchers ?? 0,
      postedVouchers: response.data.statistics.postedVouchers ?? 0,
      totalVouchers: response.data.statistics.totalVouchers ?? 0,
    },
  };
}

export async function fetchJournalVoucher(id: string, branchUnitId?: number | null): Promise<JournalVoucherRecord> {
  const response = await ApiClient.get<ApiJournalVoucherResponse>(`${JournalVoucherApiPath}/${id}`, {
    params: cleanQueryParams({ branchUnitId }),
  });

  return mapApiJournalVoucher(response.data.voucher);
}

export async function fetchJournalVoucherNumberSuggestion(branchUnitId?: number | null): Promise<JournalVoucherNumberSuggestion> {
  const response = await ApiClient.get<JournalVoucherNumberSuggestion>(`${JournalVoucherApiPath}/transaction-number`, {
    params: cleanQueryParams({ branchUnitId }),
  });

  return response.data;
}

export type JournalVoucherLookupAccount = {
  accountCode: string;
  accountNature: string;
  accountTitle: string;
  accountType: string;
  id: string;
  status: string;
};

export type JournalVoucherLookupParty = {
  id: string;
  name: string;
  partyCodeNo: string;
  partyTypes: string[];
  status: string;
};

export type JournalVoucherLookupResponsibilityCenter = {
  code: string;
  id: string;
  name: string;
  status: string;
  typeName: string;
};

export type JournalVoucherLookups = {
  accounts: JournalVoucherLookupAccount[];
  parties: JournalVoucherLookupParty[];
  responsibilityCenters: JournalVoucherLookupResponsibilityCenter[];
};

export async function fetchJournalVoucherLookups(): Promise<JournalVoucherLookups> {
  const response = await ApiClient.get<{
    accounts: JournalVoucherLookupAccount[];
    parties: JournalVoucherLookupParty[];
    responsibilityCenters: JournalVoucherLookupResponsibilityCenter[];
  }>(`${JournalVoucherApiPath}/lookups`);

  return response.data;
}

export async function createJournalVoucher(record: JournalVoucherRecord, branchUnitId?: number | null) {
  const response = await ApiClient.post<ApiJournalVoucherResponse>(JournalVoucherApiPath, toApiJournalVoucherPayload(record, branchUnitId));

  return mapApiJournalVoucher(response.data.voucher);
}

export async function updateJournalVoucher(record: JournalVoucherRecord, branchUnitId?: number | null) {
  const response = await ApiClient.patch<ApiJournalVoucherResponse>(
    `${JournalVoucherApiPath}/${record.id}`,
    toApiJournalVoucherPayload(record, branchUnitId),
  );

  return mapApiJournalVoucher(response.data.voucher);
}

export async function updateJournalVoucherStatus(input: { recordId: string; status: JournalVoucherStatus }) {
  const response = await ApiClient.patch<ApiJournalVoucherResponse>(`${JournalVoucherApiPath}/${input.recordId}/status`, {
    status: mapStatusToApi(input.status),
  });

  return mapApiJournalVoucher(response.data.voucher);
}

function mapApiJournalVoucherListItem(voucher: ApiJournalVoucherListItem): JournalVoucherRecord {
  return {
    branchUnitId: voucher.branchUnitId,
    createdAt: voucher.createdAt,
    currencyRate: toNumber(voucher.exchangeRate, 1),
    currencyType: voucher.currencyCode,
    documentDate: voucher.documentDate,
    id: voucher.id,
    lines: [],
    remarks: voucher.remarks ?? "",
    status: mapStatusFromApi(voucher.status),
    totalCredit: toNumber(voucher.totalCredit),
    totalDebit: toNumber(voucher.totalDebit),
    transactionNo: voucher.transactionNo,
    updatedAt: voucher.updatedAt,
  };
}

function mapApiJournalVoucher(voucher: ApiJournalVoucher): JournalVoucherRecord {
  return {
    branchUnitId: voucher.branchUnitId,
    createdAt: voucher.createdAt,
    currencyRate: toNumber(voucher.exchangeRate, 1),
    currencyType: voucher.currencyCode,
    documentDate: voucher.documentDate,
    id: voucher.id,
    lines: voucher.lines.map((line) => ({
      accountCode: line.accountCode,
      accountTitle: line.accountTitle,
      atcCode: line.atcCode ?? "",
      credit: toNumber(line.credit),
      debit: toNumber(line.debit),
      id: line.id,
      lineNumber: line.lineNumber,
      particulars: line.particulars ?? "",
      partyCode: line.partyCode ?? "",
      partyName: line.partyName ?? "",
      refNo: line.refNo ?? "",
      responsibilityCenter: line.responsibilityCenter ?? "",
      vatType: line.vatType ?? "",
    })),
    remarks: voucher.remarks ?? "",
    status: mapStatusFromApi(voucher.status),
    totalCredit: toNumber(voucher.totalCredit),
    totalDebit: toNumber(voucher.totalDebit),
    transactionNo: voucher.transactionNo,
    updatedAt: voucher.updatedAt,
  };
}

function toApiJournalVoucherPayload(record: JournalVoucherRecord, branchUnitId?: number | null) {
  return {
    branchUnitId: branchUnitId ?? record.branchUnitId ?? null,
    currencyCode: record.currencyType.trim(),
    documentDate: record.documentDate,
    exchangeRate: toNumber(record.currencyRate, 1),
    lines: record.lines.map((line) => ({
      accountCode: line.accountCode.trim(),
      accountTitle: line.accountTitle.trim(),
      atcCode: cleanOptional(line.atcCode),
      credit: toNumber(line.credit),
      debit: toNumber(line.debit),
      lineNumber: line.lineNumber,
      particulars: cleanOptional(line.particulars),
      partyCode: cleanOptional(line.partyCode),
      partyName: cleanOptional(line.partyName),
      refNo: cleanOptional(line.refNo),
      responsibilityCenter: cleanOptional(line.responsibilityCenter),
      vatType: cleanOptional(line.vatType),
    })),
    remarks: cleanOptional(record.remarks),
    transactionNo: cleanOptional(record.transactionNo),
  };
}

function cleanQueryParams(params: Record<string, number | string | null | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  );
}

function cleanOptional(value?: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function mapStatusFromApi(value: ApiJournalVoucherStatus): JournalVoucherStatus {
  return StatusFromApi[value] ?? (value as JournalVoucherStatus);
}

function mapStatusToApi(value: JournalVoucherStatus): ApiJournalVoucherStatus {
  return StatusToApi[value] ?? (value as ApiJournalVoucherStatus);
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}
