import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
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
  AccountsPayableVoucherLookupAccountOptions,
  AccountsPayableVoucherLookupDefaultAccounts,
  AccountsPayableVoucherLookupParty,
  AccountsPayableVoucherLookupResponsibilityCenter,
  AccountsPayableVoucherLookupTerm,
  AccountsPayableVoucherListResponse,
  AccountsPayableVoucherNumberSuggestion,
  AccountsPayableVoucherPayableType,
  AccountsPayableVoucherRecord,
  AccountsPayableVoucherStatus,
  ApiAccountsPayableVoucher,
  ApiAccountsPayableVoucherPayableType,
  ApiAccountsPayableVoucherStatus,
  ApiAccountsPayableVoucherDetails,
  ApiJournalEntry,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

type AccountsPayableVoucherListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?:
    | "transactionNo"
    | "documentDate"
    | "partyName"
    | "payableType"
    | "amount"
    | "currency"
    | "status"
    | "createdAt"
    | "updatedAt";
  sortDirection?: "asc" | "desc";
  status?: AccountsPayableVoucherStatus | "all" | null;
};

export type AccountsPayableVoucherPayload = {
  amount: number;
  branchUnitId?: number | null;
  contactNo?: string | null;
  contactPerson?: string | null;
  creditAccountCode: string;
  creditAccountId?: string | null;
  creditAccountTitle: string;
  currency: string;
  details: AccountsPayableVoucherDetailsPayload[];
  documentDate: string;
  dueDate: string;
  exchangeRate: number;
  journalEntries: JournalEntryPayload[];
  partyCode: string;
  partyId?: string | null;
  partyName: string;
  payableType: ApiAccountsPayableVoucherPayableType;
  projectCode?: string | null;
  projectName?: string | null;
  referenceNo?: string | null;
  remarks?: string | null;
  termId: string;
  terms?: string | null;
  transactionNo?: string | null;
};

type AccountsPayableVoucherDetailsPayload = {
  amount: number;
  currencyCode: string;
  ewt?: string | null;
  ewtAmount: number;
  ewtPercent: number;
  exchangeRate: number;
  expenseAccountCode: string;
  expenseAccountId?: string | null;
  expenseType: string;
  lineNumber: number;
  netAmount: number;
  particulars?: string | null;
  partyCode?: string | null;
  partyId?: string | null;
  partyName?: string | null;
  referenceNo?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterId?: string | null;
  totalAmountDue: number;
  vat?: string | null;
  vatAmount: number;
  vatPercent: number;
};

type JournalEntryPayload = {
  accountCode: string;
  accountId?: string | null;
  accountTitle: string;
  atcCode?: string | null;
  credit: number;
  currencyCode: string;
  debit: number;
  exchangeRate: number;
  lineNumber: number;
  particulars?: string | null;
  partyCode?: string | null;
  partyName?: string | null;
  referenceType: string;
  refNo?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterId?: string | null;
  vatType?: string | null;
};

export type AccountsPayableVoucherPartyLookupResponse = {
  parties: AccountsPayableVoucherLookupParty[];
};

type AccountsPayableVoucherFullPartyLookupResponse = {
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
};

export type AccountsPayableVoucherTermLookupResponse = {
  terms: AccountsPayableVoucherLookupTerm[];
};

export type AccountsPayableVoucherResponsibilityCenterLookupResponse = {
  responsibilityCenters: AccountsPayableVoucherLookupResponsibilityCenter[];
};

export type AccountsPayableVoucherPayableAccountLookupResponse = {
  defaultAccounts: AccountsPayableVoucherLookupDefaultAccounts;
  accountOptions: AccountsPayableVoucherLookupAccountOptions;
};

export type UpdateAccountsPayableVoucherStatusDto = {
  status: ApiAccountsPayableVoucherStatus;
};

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

const PayableTypeToApi: Record<
  AccountsPayableVoucherPayableType,
  ApiAccountsPayableVoucherPayableType
> = {
  "Accrued Payable": "ACCRUED_PAYABLE",
  "Employee Payable": "EMPLOYEE_PAYABLE",
  "Non-Trade Payable": "NON_TRADE_PAYABLE",
  "Tax Payable": "TAX_PAYABLE",
  "Trade Payable": "TRADE_PAYABLE",
};

export async function fetchAccountsPayableVouchers(
  query: AccountsPayableVoucherListQuery = {},
): Promise<AccountsPayableVoucherListResponse> {
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
  );

  return {
    pagination: response.pagination,
    permissions: response.permissions,
    records: response.vouchers.map(mapApiAccountsPayableVoucher),
    statistics: response.statistics,
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
  );

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function fetchAccountsPayableVoucherNumberSuggestion(
  branchUnitId?: number | null,
): Promise<AccountsPayableVoucherNumberSuggestion> {
  const response = await accountsPayableVoucherControllerSuggestTransactionNumberV1(
    cleanQueryParams({ branchUnitId }),
  );

  return response;
}

export async function fetchAccountsPayableVoucherPartyOptions() {
  try {
    const response = await accountsPayableVoucherControllerFindPartyOptionsV1();

    if (response.parties.length > 0) {
      return response.parties;
    }
  } catch {
    // Fall back to shared company-scoped party options so APV creation is not blocked by maintenance permissions.
  }

  return fetchAccountsPayableVoucherSharedPartyOptions();
}

export async function fetchAccountsPayableVoucherTermOptions() {
  const response = await accountsPayableVoucherControllerFindTermOptionsV1();

  return response.terms;
}

export async function fetchAccountsPayableVoucherResponsibilityCenterOptions() {
  const response =
    await accountsPayableVoucherControllerFindResponsibilityCenterOptionsV1();

  return response.responsibilityCenters;
}

export async function fetchAccountsPayableVoucherPayableAccountOptions() {
  const response = await accountsPayableVoucherControllerFindPayableAccountOptionsV1();

  return response;
}

async function fetchAccountsPayableVoucherSharedPartyOptions() {
  const partiesById = new Map<string, AccountsPayableVoucherLookupParty>();
  const lookupResults = await Promise.allSettled([
    ApiClient.get<AccountsPayableVoucherPartyLookupResponse>(
      "/maintenance/party-maintenance/options/VENDOR",
    ),
    ApiClient.get<AccountsPayableVoucherPartyLookupResponse>(
      "/maintenance/party-maintenance/options/EMPLOYEE",
    ),
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
    const response = await ApiClient.get<AccountsPayableVoucherFullPartyLookupResponse>(
      "/maintenance/party-maintenance",
      {
        params: {
          page: 1,
          pageSize: 500,
          sortBy: "name",
          sortDirection: "asc",
        },
      },
    );

    return response.data.parties
      .filter(
        (party) =>
          normalizeStatus(party.status) === "ACTIVE" &&
          (party.partyTypes ?? []).some((partyType) =>
            ["VENDOR", "EMPLOYEE"].includes(String(partyType).toUpperCase()),
          ),
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
  const response = await accountsPayableVoucherControllerCreateV1(
    toApiAccountsPayableVoucherPayload(values, branchUnitId),
  );

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function updateAccountsPayableVoucher(
  record: AccountsPayableVoucherRecord,
  branchUnitId?: number | null,
): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerUpdateV1(
    record.id,
    toApiAccountsPayableVoucherPayload(record, branchUnitId),
  );

  return mapApiAccountsPayableVoucher(response.voucher);
}

export async function updateAccountsPayableVoucherStatus(input: {
  recordId: string;
  status: AccountsPayableVoucherStatus;
}): Promise<AccountsPayableVoucherRecord> {
  const response = await accountsPayableVoucherControllerUpdateStatusV1(
    input.recordId,
    {
      status: mapStatusToApi(input.status),
    },
  );

  return mapApiAccountsPayableVoucher(response.voucher);
}

function mapApiAccountsPayableVoucher(
  voucher: ApiAccountsPayableVoucher,
): AccountsPayableVoucherRecord {
  return {
    accountingEntries: voucher.journalEntries.map(mapApiJournalEntry),
    address: voucher.address ?? "",
    amount: toNumber(voucher.amount),
    branchUnitId: voucher.branchUnitId,
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
    expenseLines: voucher.details.map(mapApiAccountsPayableVoucherDetails),
    id: voucher.id,
    partyCode: voucher.partyCode,
    partyId: voucher.partyId ?? undefined,
    partyName: voucher.partyName,
    payableType: mapPayableTypeFromApi(voucher.payableType),
    projectCode: voucher.projectCode ?? "",
    projectName: voucher.projectName ?? "",
    referenceNo: voucher.referenceNo ?? "",
    remarks: voucher.remarks ?? "",
    status: mapStatusFromApi(voucher.status),
    termId: voucher.termId ?? "",
    terms: voucher.terms ?? "",
    transactionNo: voucher.transactionNo,
    updatedAt: voucher.updatedAt,
  };
}

function mapApiAccountsPayableVoucherDetails(detail: ApiAccountsPayableVoucherDetails) {
  return {
    amount: toNumber(detail.amount),
    branchUnitId: detail.branchUnitId,
    companyId: detail.companyId,
    currencyCode: detail.currencyCode,
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
    particulars: detail.particulars ?? "",
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

function mapApiJournalEntry(entry: ApiJournalEntry) {
  return {
    accountCode: entry.accountCode,
    accountId: entry.accountId ?? undefined,
    accountTitle: entry.accountTitle,
    atcCode: entry.atcCode ?? "",
    credit: toNumber(entry.credit),
    currencyCode: entry.currencyCode,
    debit: toNumber(entry.debit),
    exchangeRate: toExchangeRate(entry.exchangeRate),
    id: entry.id,
    lineNumber: entry.lineNumber,
    particulars: entry.particulars ?? "",
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
): AccountsPayableVoucherPayload {
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);

  return {
    amount: toNumber(values.amount),
    branchUnitId: branchUnitId ?? values.branchUnitId ?? null,
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
      particulars: cleanOptional(line.particulars),
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
      particulars: cleanOptional(entry.particulars),
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
    remarks: cleanOptional(values.remarks),
    termId: values.termId.trim(),
    terms: cleanOptional(values.terms),
    transactionNo: cleanOptional(values.transactionNo),
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

function mapPayableTypeFromApi(
  value: ApiAccountsPayableVoucherPayableType,
): AccountsPayableVoucherPayableType {
  return PayableTypeFromApi[value] ?? (value as AccountsPayableVoucherPayableType);
}

function mapPayableTypeToApi(
  value: AccountsPayableVoucherPayableType,
): ApiAccountsPayableVoucherPayableType {
  return PayableTypeToApi[value] ?? value;
}

function mapStatusFromApi(value: ApiAccountsPayableVoucherStatus): AccountsPayableVoucherStatus {
  return StatusFromApi[value] ?? (value as AccountsPayableVoucherStatus);
}

function mapStatusToApi(value: AccountsPayableVoucherStatus): ApiAccountsPayableVoucherStatus {
  return StatusToApi[value] ?? value;
}

function toExchangeRate(value: number | string | null | undefined) {
  const numberValue = toNumber(value, 1);

  return numberValue > 0 ? numberValue : 1;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}
