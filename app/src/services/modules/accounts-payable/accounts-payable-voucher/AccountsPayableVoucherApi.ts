import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { CreateAccountsPayableVoucherDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  accountsPayableVoucherControllerCreateV1,
  accountsPayableVoucherControllerFindAllV1,
  accountsPayableVoucherControllerFindOneV1,
  accountsPayableVoucherControllerFindPartyOptionsV1,
  accountsPayableVoucherControllerFindPayableAccountOptionsV1,
  accountsPayableVoucherControllerFindResponsibilityCenterOptionsV1,
  accountsPayableVoucherControllerFindTermOptionsV1,
  accountsPayableVoucherControllerSuggestTransactionNumberV1,
  accountsPayableVoucherControllerUpdateStatusV1,
  accountsPayableVoucherControllerUpdateV1,
} from "@/app/src/generated/api/accounts-payable-voucher/accounts-payable-voucher";
import type {
  AccountsPayableVoucherFormValues,
  AccountsPayableVoucherLookupAccount,
  AccountsPayableVoucherLookupAccountOptions,
  AccountsPayableVoucherLookupParty,
  AccountsPayableVoucherLookupResponsibilityCenter,
  AccountsPayableVoucherLookupTerm,
  AccountsPayableVoucherListData,
  AccountsPayableVoucherNumberSuggestion,
  AccountsPayableVoucherPayableType,
  AccountsPayableVoucherRecord,
  AccountsPayableVoucherStatistics,
  AccountsPayableVoucherStatus,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

type ApiAccountsPayableVoucherStatus = string;
type ApiAccountsPayableVoucherPayableType = string;

type ApiAccountsPayableVoucherDetails = {
  amount: number | string | null;
  branchUnitId?: number | null;
  companyId?: number | null;
  currencyCode?: string | null;
  ewt?: string | null;
  ewtAmount?: number | string | null;
  ewtPercent?: number | string | null;
  exchangeRate?: number | string | null;
  expenseAccountCode: string;
  expenseAccountId?: string | null;
  expenseType: string;
  id: string;
  lineNumber: number;
  netAmount?: number | string | null;
  particulars?: string | null;
  partyCode?: string | null;
  partyId?: string | null;
  partyName?: string | null;
  referenceNo?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterId?: string | null;
  totalAmountDue?: number | string | null;
  vat?: string | null;
  vatAmount?: number | string | null;
  vatPercent?: number | string | null;
};

type ApiJournalEntry = {
  accountCode: string;
  accountId?: string | null;
  accountTitle: string;
  atcCode?: string | null;
  credit?: number | string | null;
  currencyCode?: string | null;
  debit?: number | string | null;
  exchangeRate?: number | string | null;
  id: string;
  lineNumber: number;
  particulars?: string | null;
  partyCode?: string | null;
  partyName?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  refNo?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterId?: string | null;
  vatType?: string | null;
};

type ApiAccountsPayableVoucher = {
  id: string;
  transactionNo: string;
  documentDate: string;
  dueDate: string;
  partyCode: string;
  partyId?: string | null;
  partyName: string;
  address?: string | null;
  contactNo?: string | null;
  contactPerson?: string | null;
  projectCode?: string | null;
  projectName?: string | null;
  currency: string;
  exchangeRate: number | string | null;
  amount: number | string | null;
  termId?: string | null;
  terms?: string | null;
  referenceNo?: string | null;
  creditAccountId?: string | null;
  creditAccountCode: string;
  creditAccountTitle: string;
  payableType: ApiAccountsPayableVoucherPayableType;
  remarks?: string | null;
  status: ApiAccountsPayableVoucherStatus;
  branchUnitId?: number | null;
  createdAt: string;
  updatedAt: string;
  details: ApiAccountsPayableVoucherDetails[];
  journalEntries: ApiJournalEntry[];
};

type AccountsPayableVoucherPartyLookupResponse = {
  parties: AccountsPayableVoucherLookupParty[];
};

// Local response types — the generated functions return `void` (untyped) so we cast.
type ApiApvListResponse = {
  pagination: AccountsPayableVoucherListData["pagination"];
  permissions: AccountsPayableVoucherListData["permissions"];
  vouchers: ApiAccountsPayableVoucher[];
  statistics?: Partial<AccountsPayableVoucherStatistics & { approvedVouchers: number; closedVouchers: number }>;
};
type ApiApvSingleResponse = { voucher: ApiAccountsPayableVoucher };
type ApiApvPartyOptionsResponse = { parties: AccountsPayableVoucherLookupParty[] };
type ApiApvTermOptionsResponse = { terms: AccountsPayableVoucherLookupTerm[] };
type ApiApvResponsibilityCenterOptionsResponse = {
  responsibilityCenters: AccountsPayableVoucherLookupResponsibilityCenter[];
};
type ApiApvPayableAccountOptionsResponse = {
  accountOptions: AccountsPayableVoucherLookupAccountOptions;
};

type AccountsPayableVoucherListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: "transactionNo" | "documentDate" | "partyName" | "payableType" | "amount" | "currency" | "status" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  status?: AccountsPayableVoucherStatus | "all" | null;
};

type AccountsPayableVoucherAccountOptionsResponse = {
  accounts: AccountsPayableVoucherLookupAccount[];
};

const AccountsPayableVoucherLookupApiPath = "/accounts-payable/accounts-payable-voucher/lookups";

const StatusFromApi: Record<string, AccountsPayableVoucherStatus> = {
  APPROVED: "For Approval",
  CANCELLED: "Cancelled",
  CLOSED: "Posted",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<AccountsPayableVoucherStatus, ApiAccountsPayableVoucherStatus> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "APPROVED",
  Posted: "CLOSED",
};

const PayableTypeFromApi: Record<string, AccountsPayableVoucherPayableType> = {
  ACCRUED_PAYABLE: "Accrued Payable",
  EMPLOYEE_PAYABLE: "Employee Payable",
  NON_TRADE_PAYABLE: "Non-Trade Payable",
  TAX_PAYABLE: "Tax Payable",
  TRADE_PAYABLE: "Trade Payable",
};

const PayableTypeToApi: Record<AccountsPayableVoucherPayableType, ApiAccountsPayableVoucherPayableType> = {
  "Accrued Payable": "ACCRUED_PAYABLE",
  "Employee Payable": "EMPLOYEE_PAYABLE",
  "Non-Trade Payable": "NON_TRADE_PAYABLE",
  "Tax Payable": "TAX_PAYABLE",
  "Trade Payable": "TRADE_PAYABLE",
};

export async function fetchAccountsPayableVouchers(query: AccountsPayableVoucherListQuery = {}): Promise<AccountsPayableVoucherListData> {
  const response = await accountsPayableVoucherControllerFindAllV1(
    cleanQueryParams({
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
  ) as unknown as ApiApvListResponse;

  return {
    pagination: response.pagination,
    permissions: response.permissions,
    records: response.vouchers.map(mapApiAccountsPayableVoucher),
    statistics: mapApiAccountsPayableVoucherStatistics(response.statistics),
  };
}

export async function fetchAccountsPayableVoucher(
  id: string,
  query: Pick<AccountsPayableVoucherListQuery, "branchUnitId"> = {},
): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerFindOneV1(
    id,
    cleanQueryParams({
      branchUnitId: query.branchUnitId,
    }),
  ) as unknown as ApiApvSingleResponse;

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function fetchAccountsPayableVoucherNumberSuggestion(
  branchUnitId?: number | null,
): Promise<AccountsPayableVoucherNumberSuggestion> {
  const response = await accountsPayableVoucherControllerSuggestTransactionNumberV1(cleanQueryParams({ branchUnitId })) as unknown as AccountsPayableVoucherNumberSuggestion;

  return response;
}

export async function fetchAccountsPayableVoucherPartyOptions() {
  try {
    const response = await accountsPayableVoucherControllerFindPartyOptionsV1() as unknown as ApiApvPartyOptionsResponse;

    if (response.parties.length > 0) {
      return response.parties;
    }
  } catch {
    // Fall back to shared company-scoped party options so APV creation is not blocked by maintenance permissions.
  }

  return fetchAccountsPayableVoucherSharedPartyOptions();
}

export async function fetchAccountsPayableVoucherTermOptions() {
  const response = await accountsPayableVoucherControllerFindTermOptionsV1() as unknown as ApiApvTermOptionsResponse;

  return response.terms;
}

export async function fetchAccountsPayableVoucherResponsibilityCenterOptions() {
  const response = await accountsPayableVoucherControllerFindResponsibilityCenterOptionsV1() as unknown as ApiApvResponsibilityCenterOptionsResponse;

  return response.responsibilityCenters;
}

export async function fetchAccountsPayableVoucherExpenseTypeOptions() {
  const response = await ApiClient.get<AccountsPayableVoucherAccountOptionsResponse>(
    `${AccountsPayableVoucherLookupApiPath}/expense-types`,
  );

  return response.data.accounts;
}

export async function fetchAccountsPayableVoucherPostingAccountOptions() {
  const response = await ApiClient.get<AccountsPayableVoucherAccountOptionsResponse>(
    `${AccountsPayableVoucherLookupApiPath}/posting-accounts`,
  );

  return response.data.accounts;
}

export async function fetchAccountsPayableVoucherPayableAccountOptions() {
  const response = await accountsPayableVoucherControllerFindPayableAccountOptionsV1() as unknown as ApiApvPayableAccountOptionsResponse;

  return response;
}

async function fetchAccountsPayableVoucherSharedPartyOptions() {
  const partiesById = new Map<string, AccountsPayableVoucherLookupParty>();
  const lookupResults = await Promise.allSettled([
    ApiClient.get<AccountsPayableVoucherPartyLookupResponse>("/maintenance/party-maintenance/options/VENDOR"),
    ApiClient.get<AccountsPayableVoucherPartyLookupResponse>("/maintenance/party-maintenance/options/EMPLOYEE"),
  ]);

  lookupResults.forEach((result) => {
    if (result.status !== "fulfilled") {
      return;
    }

    result.value.data.parties.forEach((party) => {
      partiesById.set(party.id, normalizeLookupParty(party));
    });
  });

  if (partiesById.size === 0) {
    const fullParties = await fetchAccountsPayableVoucherFullPartyFallback();

    fullParties.forEach((party) => {
      partiesById.set(party.id, party);
    });
  }

  return [...partiesById.values()];
}

async function fetchAccountsPayableVoucherFullPartyFallback() {
  try {
    const response = await ApiClient.get<{
      parties: Array<
        Partial<AccountsPayableVoucherLookupParty> & {
          partyName?: string | null;
          tradeName?: string | null;
          firstName?: string | null;
          middleName?: string | null;
          lastName?: string | null;
          suffixName?: string | null;
        }
      >;
    }>("/maintenance/party-maintenance", {
      params: {
        page: 1,
        pageSize: 500,
        sortBy: "name",
        sortDirection: "asc",
      },
    });

    return response.data.parties
      .filter(
        (party) =>
          normalizeStatus(party.status) === "ACTIVE" &&
          (party.partyTypes ?? []).some((partyType) => ["VENDOR", "EMPLOYEE"].includes(String(partyType).toUpperCase())),
      )
      .map((party) => normalizeLookupParty(party));
  } catch {
    return [];
  }
}

function normalizeLookupParty(
  party: Partial<AccountsPayableVoucherLookupParty> & {
    partyName?: string | null;
    tradeName?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffixName?: string | null;
  },
): AccountsPayableVoucherLookupParty {
  return {
    id: party.id ?? party.partyCodeNo ?? "",
    partyCodeNo: party.partyCodeNo ?? "",
    classification: party.classification ?? "INDIVIDUAL",
    partyTypes: party.partyTypes ?? [],
    status: "ACTIVE",
    name:
      party.name?.trim() ||
      party.tradeName?.trim() ||
      party.partyName?.trim() ||
      [party.firstName, party.middleName, party.lastName, party.suffixName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ") ||
      party.partyCodeNo ||
      "",
    address: party.address ?? createEmptyLookupAddress(),
    addresses: party.addresses ?? [],
    defaultPayableAccount: party.defaultPayableAccount ?? "",
    termId: party.termId ?? "",
    termName: party.termName ?? "",
    defaultPurchaseInputVatTaxSourceKey: party.defaultPurchaseInputVatTaxSourceKey ?? "",
    defaultPurchaseEwtTaxSourceKey: party.defaultPurchaseEwtTaxSourceKey ?? "",
    defaultPurchaseFwtTaxSourceKey: party.defaultPurchaseFwtTaxSourceKey ?? "",
    defaultPurchaseWvatTaxSourceKey: party.defaultPurchaseWvatTaxSourceKey ?? "",
    contactPerson: party.contactPerson ?? "",
    email: party.email ?? "",
    contactNo: party.contactNo ?? "",
  };
}

function normalizeStatus(status: unknown) {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function createEmptyLookupAddress() {
  return {
    id: "",
    addressName: "",
    addressLine1: "",
    addressLine2: "",
    barangay: "",
    barangayCode: "",
    cityMunicipality: "",
    cityMunicipalityCode: "",
    isBilling: false,
    isBuilding: false,
    isDefault: true,
    isDelivery: false,
    isForeign: false,
    isHome: false,
    province: "",
    provinceCode: "",
    region: "",
    regionCode: "",
  };
}

export async function createAccountsPayableVoucher(
  values: AccountsPayableVoucherFormValues,
  branchUnitId?: number | null,
): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerCreateV1(toApiAccountsPayableVoucherPayload(values, branchUnitId)) as unknown as ApiApvSingleResponse;

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function updateAccountsPayableVoucher(
  record: AccountsPayableVoucherRecord,
  branchUnitId?: number | null,
): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerUpdateV1(record.id, toApiAccountsPayableVoucherPayload(record, branchUnitId)) as unknown as ApiApvSingleResponse;

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function updateAccountsPayableVoucherStatus(input: {
  recordId: string;
  status: AccountsPayableVoucherStatus;
}): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerUpdateStatusV1(input.recordId, {
    status: mapStatusToApi(input.status) as import("@/app/src/generated/api/gR8BooksNeoAPI.schemas").UpdateAccountsPayableVoucherStatusDtoStatus,
  }) as unknown as ApiApvSingleResponse;

  return mapApiAccountsPayableVoucher(response.voucher);
}

function mapApiAccountsPayableVoucher(voucher: ApiAccountsPayableVoucher): AccountsPayableVoucherRecord {
  const remarks = voucher.remarks ?? "";

  return {
    accountingEntries: voucher.journalEntries.map((entry) => mapApiJournalEntry(entry, remarks)),
    address: voucher.address ?? "",
    amount: toNumber(voucher.amount),
    branchUnitId: voucher.branchUnitId ?? undefined,
    contactNo: voucher.contactNo ?? "",
    contactPerson: voucher.contactPerson ?? "",
    createdAt: voucher.createdAt,
    creditAccountCode: voucher.creditAccountCode,
    creditAccountId: voucher.creditAccountId ?? undefined,
    creditAccountTitle: voucher.creditAccountTitle,
    currency: voucher.currency,
    documentDate: voucher.documentDate,
    dueDate: voucher.dueDate,
    exchangeRate: toExchangeRate(voucher.exchangeRate),
    expenseLines: voucher.details.map((detail) => mapApiAccountsPayableVoucherDetails(detail, remarks)),
    id: voucher.id,
    partyCode: voucher.partyCode,
    partyId: voucher.partyId ?? undefined,
    partyName: voucher.partyName,
    payableType: mapPayableTypeFromApi(voucher.payableType),
    projectCode: voucher.projectCode ?? "",
    projectName: voucher.projectName ?? "",
    referenceNo: voucher.referenceNo ?? "",
    remarks,
    status: mapStatusFromApi(voucher.status),
    termId: voucher.termId ?? "",
    terms: voucher.terms ?? "",
    transactionNo: voucher.transactionNo,
    updatedAt: voucher.updatedAt,
  };
}

function mapApiAccountsPayableVoucherDetails(detail: ApiAccountsPayableVoucherDetails, remarks = "") {
  return {
    amount: toNumber(detail.amount),
    branchUnitId: detail.branchUnitId ?? undefined,
    companyId: detail.companyId ?? undefined,
    currencyCode: detail.currencyCode ?? undefined,
    ewt: detail.ewt ?? "",
    ewtAmount: toNumber(detail.ewtAmount),
    ewtPercent: toNumber(detail.ewtPercent),
    exchangeRate: toExchangeRate(detail.exchangeRate),
    expenseAccountCode: detail.expenseAccountCode,
    expenseAccountId: detail.expenseAccountId ?? undefined,
    expenseType: detail.expenseType,
    id: detail.id,
    lineNumber: detail.lineNumber,
    netAmount: toNumber(detail.netAmount),
    particulars: getParticularsWithRemarksFallback(detail.particulars, remarks),
    partyCode: detail.partyCode ?? "",
    partyId: detail.partyId ?? undefined,
    partyName: detail.partyName ?? "",
    referenceNo: detail.referenceNo ?? "",
    responsibilityCenter: detail.responsibilityCenter ?? "",
    responsibilityCenterId: detail.responsibilityCenterId ?? undefined,
    totalAmountDue: toNumber(detail.totalAmountDue),
    vat: detail.vat ?? "",
    vatAmount: toNumber(detail.vatAmount),
    vatPercent: toNumber(detail.vatPercent),
  };
}

function mapApiJournalEntry(entry: ApiJournalEntry, remarks = "") {
  return {
    accountCode: entry.accountCode,
    accountId: entry.accountId ?? undefined,
    accountTitle: entry.accountTitle,
    atcCode: entry.atcCode ?? "",
    credit: toNumber(entry.credit),
    currencyCode: entry.currencyCode ?? undefined,
    debit: toNumber(entry.debit),
    exchangeRate: toExchangeRate(entry.exchangeRate),
    id: entry.id,
    lineNumber: entry.lineNumber,
    particulars: getParticularsWithRemarksFallback(entry.particulars, remarks),
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    referenceId: entry.referenceId ?? undefined,
    referenceType: entry.referenceType ?? "APV",
    refNo: entry.refNo ?? "",
    responsibilityCenter: entry.responsibilityCenter ?? "",
    responsibilityCenterId: entry.responsibilityCenterId ?? undefined,
    vatType: entry.vatType ?? "",
  };
}

function toApiAccountsPayableVoucherPayload(
  values: AccountsPayableVoucherFormValues | AccountsPayableVoucherRecord,
  branchUnitId?: number | null,
): CreateAccountsPayableVoucherDto {
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const remarks = cleanOptional(values.remarks);

  return {
    amount: toNumber(values.amount),
    branchUnitId: (branchUnitId ?? values.branchUnitId) ?? undefined,
    contactNo: cleanOptional(values.contactNo),
    contactPerson: cleanOptional(values.contactPerson),
    creditAccountCode: values.creditAccountCode.trim(),
    creditAccountId: cleanOptional(values.creditAccountId),
    creditAccountTitle: values.creditAccountTitle.trim(),
    currency: currencyCode,
    details: values.expenseLines.map((line) => ({
      amount: toNumber(line.amount),
      currencyCode: cleanOptional(line.currencyCode) ?? currencyCode,
      ewt: cleanOptional(line.ewt),
      ewtAmount: toNumber(line.ewtAmount),
      ewtPercent: toNumber(line.ewtPercent),
      exchangeRate: toExchangeRate(line.exchangeRate ?? exchangeRate),
      expenseAccountCode: line.expenseAccountCode.trim(),
      expenseAccountId: cleanOptional(line.expenseAccountId),
      expenseType: line.expenseType.trim(),
      lineNumber: line.lineNumber,
      netAmount: toNumber(line.netAmount),
      particulars: cleanOptionalWithFallback(line.particulars, remarks),
      partyCode: cleanOptional(line.partyCode),
      partyId: cleanOptional(line.partyId),
      partyName: cleanOptional(line.partyName),
      referenceNo: cleanOptional(line.referenceNo),
      responsibilityCenter: cleanOptional(line.responsibilityCenter),
      responsibilityCenterId: cleanOptional(line.responsibilityCenterId),
      totalAmountDue: toNumber(line.totalAmountDue),
      vat: cleanOptional(line.vat),
      vatAmount: toNumber(line.vatAmount),
      vatPercent: toNumber(line.vatPercent),
    })),
    documentDate: values.documentDate,
    dueDate: values.dueDate,
    exchangeRate,
    journalEntries: values.accountingEntries.map((entry) => ({
      accountCode: entry.accountCode.trim(),
      accountId: cleanOptional(entry.accountId),
      accountTitle: entry.accountTitle.trim(),
      atcCode: cleanOptional(entry.atcCode),
      credit: toNumber(entry.credit),
      currencyCode: cleanOptional(entry.currencyCode) ?? currencyCode,
      debit: toNumber(entry.debit),
      exchangeRate: toExchangeRate(entry.exchangeRate ?? exchangeRate),
      lineNumber: entry.lineNumber,
      particulars: cleanOptionalWithFallback(entry.particulars, remarks),
      partyCode: cleanOptional(entry.partyCode),
      partyName: cleanOptional(entry.partyName),
      referenceType: cleanOptional(entry.referenceType) ?? "APV",
      refNo: cleanOptional(entry.refNo),
      responsibilityCenter: cleanOptional(entry.responsibilityCenter),
      responsibilityCenterId: cleanOptional(entry.responsibilityCenterId),
      vatType: cleanOptional(entry.vatType),
    })),
    partyCode: values.partyCode.trim(),
    partyId: cleanOptional(values.partyId),
    partyName: values.partyName.trim(),
    payableType: mapPayableTypeToApi(values.payableType),
    projectCode: cleanOptional(values.projectCode),
    projectName: cleanOptional(values.projectName),
    referenceNo: cleanOptional(values.referenceNo),
    remarks,
    termId: values.termId.trim(),
    terms: cleanOptional(values.terms),
    transactionNo: cleanOptional(values.transactionNo),
  } as unknown as CreateAccountsPayableVoucherDto;
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

function cleanOptionalWithFallback(value: string | null | undefined, fallback: string | null) {
  return cleanOptional(value) ?? fallback;
}

function getParticularsWithRemarksFallback(particulars: string | null | undefined, remarks: string) {
  const normalizedParticulars = particulars?.trim() ?? "";

  return normalizedParticulars || remarks.trim();
}

function mapPayableTypeFromApi(value: ApiAccountsPayableVoucherPayableType): AccountsPayableVoucherPayableType {
  return PayableTypeFromApi[value] ?? (value as AccountsPayableVoucherPayableType);
}

function mapPayableTypeToApi(value: AccountsPayableVoucherPayableType): ApiAccountsPayableVoucherPayableType {
  return PayableTypeToApi[value] ?? value;
}

function mapStatusFromApi(value: ApiAccountsPayableVoucherStatus): AccountsPayableVoucherStatus {
  return StatusFromApi[value] ?? (value as AccountsPayableVoucherStatus);
}

function mapStatusToApi(value: AccountsPayableVoucherStatus): ApiAccountsPayableVoucherStatus {
  return StatusToApi[value] ?? value;
}

function mapApiAccountsPayableVoucherStatistics(
  statistics?: Partial<
    AccountsPayableVoucherStatistics & {
      approvedVouchers: number;
      closedVouchers: number;
    }
  >,
): AccountsPayableVoucherStatistics {
  return {
    cancelledVouchers: statistics?.cancelledVouchers ?? 0,
    disapprovedVouchers: statistics?.disapprovedVouchers ?? 0,
    draftVouchers: statistics?.draftVouchers ?? 0,
    forApprovalVouchers: statistics?.forApprovalVouchers ?? statistics?.approvedVouchers ?? 0,
    postedVouchers: statistics?.postedVouchers ?? statistics?.closedVouchers ?? 0,
    totalVouchers: statistics?.totalVouchers ?? 0,
  };
}

function toExchangeRate(value: number | string | null | undefined) {
  const numberValue = toNumber(value, 1);

  return numberValue > 0 ? numberValue : 1;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}
