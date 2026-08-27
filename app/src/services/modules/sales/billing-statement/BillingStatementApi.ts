import {
  billingStatementControllerCreateV1,
  billingStatementControllerFindAllV1,
  billingStatementControllerFindOneV1,
  billingStatementControllerUpdateStatusV1,
  billingStatementControllerUpdateV1,
} from "@/app/src/generated/api/billing-statement/billing-statement";
import type {
  BillingStatementControllerFindAllV1Params,
  BillingStatementResponseDto,
  BillingStatementResponseDtoStatus,
  CreateBillingStatementDto,
  UpdateBillingStatementStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { createBillingStatementAccountingEntries } from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  BillingStatementAccountingEntry,
  BillingStatementFormValues,
  BillingStatementItem,
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

export type BillingStatementListData = Awaited<
  ReturnType<typeof billingStatementControllerFindAllV1>
>;

type BillingStatementListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: BillingStatementControllerFindAllV1Params["sortBy"];
  sortDirection?: BillingStatementControllerFindAllV1Params["sortDirection"];
  status?: BillingStatementStatus | "all" | null;
};

const StatusFromApi: Record<string, BillingStatementStatus> = {
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<
  BillingStatementStatus,
  UpdateBillingStatementStatusDto["status"]
> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

export function fetchBillingStatements(
  query: BillingStatementListQuery = {},
): Promise<BillingStatementListData> {
  return billingStatementControllerFindAllV1(
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
      status:
        query.status && query.status !== "all"
          ? mapStatusToApi(query.status)
          : undefined,
    }),
  );
}

export async function fetchBillingStatement(
  id: string,
  query: Pick<BillingStatementListQuery, "branchUnitId"> = {},
): Promise<BillingStatementRecord> {
  const response = await billingStatementControllerFindOneV1(
    id,
    cleanQueryParams({ branchUnitId: query.branchUnitId }),
  );

  return mapApiBillingStatement(response.invoice);
}

export async function createBillingStatement(
  values: BillingStatementFormValues,
  branchUnitId?: number | null,
): Promise<BillingStatementRecord> {
  const response = await billingStatementControllerCreateV1(
    toApiBillingStatementPayload(values, branchUnitId),
  );

  return mapApiBillingStatement(response.invoice);
}

export async function updateBillingStatement(
  record: BillingStatementRecord,
  branchUnitId?: number | null,
): Promise<BillingStatementRecord> {
  const response = await billingStatementControllerUpdateV1(
    record.id,
    toApiBillingStatementPayload(
      recordToFormValues(record),
      branchUnitId,
    ),
  );

  return mapApiBillingStatement(response.invoice);
}

export async function updateBillingStatementStatus(input: {
  recordId: string;
  status: BillingStatementStatus;
}): Promise<BillingStatementRecord> {
  const response = await billingStatementControllerUpdateStatusV1(input.recordId, {
    status: mapStatusToApi(input.status),
  });

  return mapApiBillingStatement(response.invoice);
}

export function mapApiBillingStatement(
  statement: BillingStatementResponseDto,
): BillingStatementRecord {
  const formValues = createFormValuesFromApi(statement);

  return {
    id: statement.id,
    ...formValues,
  };
}

function createFormValuesFromApi(
  statement: BillingStatementResponseDto,
): BillingStatementFormValues {
  const items = statement.details.map(mapApiBillingStatementDetail);
  const accountingEntries = statement.journalEntries.length
    ? statement.journalEntries.map(mapApiJournalEntry)
    : createBillingStatementAccountingEntries({
        defaultAccount: statement.receivableAccountTitle,
        items,
        partyCode: statement.customerCode,
        partyName: statement.customerName,
        refNo: statement.transactionNo,
      });

  return {
    accountingEntries,
    attachments: [],
    businessStyle: statement.address ?? statement.businessStyle ?? "",
    code: statement.customerCode,
    contactPerson: statement.contactPerson ?? "",
    currency: statement.currency,
    defaultAccount: statement.receivableAccountTitle,
    description: items[0]?.description ?? "",
    discountAmount: statement.discountAmount,
    donation: 0,
    documentDate: statement.documentDate,
    dueDate: statement.dueDate,
    ewtAmount: statement.ewtAmount,
    exchangeRate: statement.exchangeRate,
    expirationDate: statement.dueDate,
    grossAmount: statement.grossAmount,
    invoiceNo: statement.invoiceNo ?? "",
    items,
    joNo: "",
    name: statement.customerName,
    netAmount: statement.netAmount,
    poNo: "",
    projectName: statement.projectName ?? "",
    projectRef: statement.projectRef ?? "",
    recoupment: 0,
    refNo: statement.referenceNo ?? "",
    remarks: statement.remarks ?? "",
    resCustomer: "",
    resCustomerCode: items[0]?.responsibilityCenter ?? "",
    retention: 0,
    salesAssociate: statement.salesAssociate ?? "",
    sjNo: "",
    sqNo: "",
    startDate: statement.documentDate,
    status: mapStatusFromApi(statement.status),
    teamAssigned: statement.teamAssigned ?? "",
    terms: statement.terms ?? statement.termId ?? "",
    transNo: statement.transactionNo,
    vatAmount: statement.vatAmount,
    wvatAmount: statement.wvatAmount,
  };
}

function mapApiBillingStatementDetail(
  detail: BillingStatementResponseDto["details"][number],
): BillingStatementItem {
  const derivedAmounts = getDerivedBillingStatementDetailAmounts(detail);

  return {
    amount: detail.amount,
    description: detail.description,
    discountAmount: detail.discountAmount,
    discountPercent: detail.discountPercent.toString(),
    ewtAmount: detail.ewtAmount,
    ewtType: detail.ewtType ?? "",
    grossAmount: detail.grossAmount,
    grossAfterDiscount: derivedAmounts.grossAfterDiscount,
    id: detail.id,
    netAmount: detail.netAmount,
    netOfVatAmount: derivedAmounts.netOfVatAmount,
    particulars: detail.particulars ?? "",
    quantity: detail.quantity,
    responsibilityCenter: detail.responsibilityCenter ?? "",
    vatAmount: detail.vatAmount,
    vatInclusive: detail.vatInclusive ? "True" : "False",
    vatable: detail.vatable ? "True" : "False",
    vatType: detail.vatType ?? "",
    withEwt: detail.withEwt ? "True" : "False",
    withWvat: detail.withWvat ? "True" : "False",
    wvatAmount: detail.wvatAmount,
    wvatType: detail.wvatType ?? "",
  };
}

function getDerivedBillingStatementDetailAmounts(
  detail: BillingStatementResponseDto["details"][number],
) {
  const grossAmount = detail.amount * Math.max(detail.quantity, 0);
  const discountAmount = grossAmount * (Math.max(detail.discountPercent, 0) / 100);
  const grossAfterDiscount = Math.max(grossAmount - discountAmount, 0);
  const netOfVatAmount =
    detail.vatable && detail.vatInclusive
      ? Math.max(grossAfterDiscount - detail.vatAmount, 0)
      : grossAfterDiscount;

  return { grossAfterDiscount, netOfVatAmount };
}

function mapApiJournalEntry(
  entry: BillingStatementResponseDto["journalEntries"][number],
): BillingStatementAccountingEntry {
  return {
    accountCode: entry.accountCode,
    accountTitle: entry.accountTitle,
    atcCode: entry.atcCode ?? "",
    credit: entry.credit,
    debit: entry.debit,
    id: entry.id,
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    particulars: entry.particulars ?? "",
    refNo: entry.refNo ?? "",
    responsibilityCenter: entry.responsibilityCenter ?? "",
    vatType: entry.vatType ?? "",
  };
}

function toApiBillingStatementPayload(
  values: BillingStatementFormValues,
  branchUnitId?: number | null,
): CreateBillingStatementDto {
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const currency = values.currency.trim() || "PHP";

  return {
    address: cleanOptional(values.businessStyle),
    billToName: cleanOptional(values.name),
    branchUnitId: branchUnitId ?? undefined,
    businessStyle: cleanOptional(values.businessStyle),
    contactPerson: cleanOptional(values.contactPerson),
    currency,
    customerCode: values.code.trim(),
    customerName: values.name.trim(),
    details: values.items.map((item, index) => ({
      amount: toNumber(item.amount),
      description: item.description.trim(),
      discountAmount: toNumber(item.discountAmount),
      discountPercent: toNumber(item.discountPercent),
      ewtAmount: toNumber(item.ewtAmount),
      ewtType: cleanOptional(item.ewtType),
      grossAmount: toNumber(item.grossAmount),
      lineNumber: index + 1,
      netAmount: toNumber(item.netAmount),
      particulars: cleanOptional(item.particulars),
      quantity: toNumber(item.quantity),
      responsibilityCenter: cleanOptional(item.responsibilityCenter),
      vatAmount: toNumber(item.vatAmount),
      vatInclusive: toBoolean(item.vatInclusive),
      vatable: toBoolean(item.vatable),
      vatType: cleanOptional(item.vatType),
      withEwt: toBoolean(item.withEwt),
      withWvat: toBoolean(item.withWvat),
      wvatAmount: toNumber(item.wvatAmount),
      wvatType: cleanOptional(item.wvatType),
    })),
    discountAmount: toNumber(values.discountAmount),
    documentDate: normalizeDateValue(values.documentDate),
    dueDate: normalizeDateValue(values.dueDate),
    ewtAmount: toNumber(values.ewtAmount),
    exchangeRate,
    grossAmount: toNumber(values.grossAmount),
    invoiceNo: cleanOptional(values.invoiceNo),
    journalEntries: values.accountingEntries
      .filter((entry) => toNumber(entry.debit) > 0 || toNumber(entry.credit) > 0)
      .map((entry, index) => ({
        accountCode: entry.accountCode.trim(),
        accountTitle: entry.accountTitle.trim(),
        atcCode: cleanOptional(entry.atcCode),
        credit: toNumber(entry.credit),
        currencyCode: currency,
        debit: toNumber(entry.debit),
        exchangeRate,
        lineNumber: index + 1,
        particulars: cleanOptional(entry.particulars),
        partyCode: cleanOptional(entry.partyCode),
        partyName: cleanOptional(entry.partyName),
        referenceType: "BS",
        refNo: cleanOptional(entry.refNo),
        responsibilityCenter: cleanOptional(entry.responsibilityCenter),
        vatType: cleanOptional(entry.vatType),
      })),
    netAmount: toNumber(values.netAmount),
    projectName: cleanOptional(values.projectName),
    projectRef: cleanOptional(values.projectRef),
    receivableAccountCode:
      values.accountingEntries[0]?.accountCode.trim() || "AR-TRADE",
    receivableAccountTitle:
      values.accountingEntries[0]?.accountTitle.trim() ||
      values.defaultAccount.trim() ||
      "Accounts Receivable - Trade",
    referenceNo: cleanOptional(values.refNo || values.poNo || values.sqNo),
    remarks: cleanOptional(values.remarks),
    salesAssociate: cleanOptional(values.salesAssociate),
    teamAssigned: cleanOptional(values.teamAssigned),
    terms: cleanOptional(values.terms),
    transactionNo: cleanOptional(values.transNo),
    vatAmount: toNumber(values.vatAmount),
    wvatAmount: toNumber(values.wvatAmount),
  };
}

function recordToFormValues(record: BillingStatementRecord): BillingStatementFormValues {
  const { id, ...values } = record;
  void id;
  return values;
}

function cleanQueryParams(
  params: Record<string, number | string | null | undefined>,
) {
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

function mapStatusFromApi(
  value: BillingStatementResponseDtoStatus,
): BillingStatementStatus {
  return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(
  value: BillingStatementStatus,
): UpdateBillingStatementStatusDto["status"] {
  return StatusToApi[value] ?? "DRAFT";
}

function toBoolean(value: string) {
  return value.trim().toLowerCase() === "true";
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = parseMoneyNumberInput(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed * 100) / 100;
}

function toExchangeRate(value: number | string | null | undefined, fallback = 1) {
  const parsed = parseMoneyNumberInput(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed * 1000000) / 1000000;
}

function normalizeDateValue(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
    }
  }
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}