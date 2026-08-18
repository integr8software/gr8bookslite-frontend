import {
	billingControllerCreateV1,
	billingControllerFindAllV1,
	billingControllerFindOneV1,
	billingControllerSuggestTransactionNumberV1,
	billingControllerUpdateStatusV1,
	billingControllerUpdateV1,
} from "@/app/src/generated/api/billing/billing";
import type {
	CreateBillingDto,
	BillingControllerFindAllV1Params,
	BillingResponseDto,
	BillingResponseDtoStatus,
	UpdateBillingStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingAccountingEntry,
	BillingFormValues,
	BillingLineEntry,
	BillingRecord,
	BillingStatus,
} from "@/app/src/types/modules/sales/billing/BillingTypes";

export type BillingListData = Awaited<
	ReturnType<typeof billingControllerFindAllV1>
>;

export type BillingNumberSuggestion = Awaited<
	ReturnType<typeof billingControllerSuggestTransactionNumberV1>
>;

type BillingListQuery = {
	amountFrom?: number | null;
	amountTo?: number | null;
	branchUnitId?: number | null;
	documentDateFrom?: string | null;
	documentDateTo?: string | null;
	limit?: number;
	page?: number;
	search?: string | null;
	sortBy?: BillingControllerFindAllV1Params["sortBy"];
	sortDirection?: BillingControllerFindAllV1Params["sortDirection"];
	status?: BillingStatus | "all" | null;
};

const StatusFromApi: Record<string, BillingStatus> = {
	CANCELLED: "Cancelled",
	DISAPPROVED: "Disapproved",
	DRAFT: "Draft",
	FOR_APPROVAL: "For Approval",
	POSTED: "Posted",
};

const StatusToApi: Record<
	BillingStatus,
	UpdateBillingStatusDto["status"]
> = {
	Cancelled: "CANCELLED",
	Disapproved: "DISAPPROVED",
	Draft: "DRAFT",
	"For Approval": "FOR_APPROVAL",
	Posted: "POSTED",
};

const ZeroMoneyValue = "0.00";

export async function fetchBillings(
	query: BillingListQuery = {},
): Promise<BillingListData> {
	return billingControllerFindAllV1(
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

export async function fetchBilling(
	id: string,
	query: Pick<BillingListQuery, "branchUnitId"> = {},
): Promise<BillingRecord> {
	const response = await billingControllerFindOneV1(
		id,
		cleanQueryParams({ branchUnitId: query.branchUnitId }),
	);

	return mapApiBilling(response.invoice);
}

export async function fetchBillingNumberSuggestion(
	branchUnitId?: number | null,
): Promise<BillingNumberSuggestion> {
	return billingControllerSuggestTransactionNumberV1(
		cleanQueryParams({ branchUnitId }),
	);
}

export async function createBilling(
	values: BillingFormValues,
	branchUnitId?: number | null,
): Promise<BillingRecord> {
	const response = await billingControllerCreateV1(
		toApiBillingPayload(values, branchUnitId),
	);

	return mapApiBilling(response.invoice);
}

export async function updateBilling(
	record: BillingRecord,
	branchUnitId?: number | null,
): Promise<BillingRecord> {
	const response = await billingControllerUpdateV1(
		record.id,
		toApiBillingPayload(
			record.formValues ?? createFormValuesFromRecord(record),
			branchUnitId,
		),
	);

	return mapApiBilling(response.invoice);
}

export async function updateBillingStatus(input: {
	recordId: string;
	status: BillingStatus;
}): Promise<BillingRecord> {
	const response = await billingControllerUpdateStatusV1(input.recordId, {
		status: mapStatusToApi(input.status),
	});

	return mapApiBilling(response.invoice);
}

export function mapApiBilling(
	invoice: BillingResponseDto,
): BillingRecord {
	const formValues = createFormValuesFromApi(invoice);

	return {
		amount: invoice.grossAmount,
		customerCode: invoice.customerCode,
		customerName: invoice.customerName,
		documentDate: invoice.documentDate,
		formValues,
		id: invoice.id,
		invoiceNo: invoice.invoiceNo ?? "",
		referenceNo: invoice.referenceNo ?? "",
		status: mapStatusFromApi(invoice.status),
		transactionNo: invoice.transactionNo,
	};
}

function createFormValuesFromApi(
	invoice: BillingResponseDto,
): BillingFormValues {
	const lineEntries = invoice.details.map(mapApiBillingDetail);

	return {
		accountingEntries: invoice.journalEntries.map(mapApiJournalEntry),
		address: invoice.address ?? "",
		attachments: [],
		billToName: invoice.billToName ?? "",
		businessStyle: invoice.businessStyle ?? "",
		code: invoice.customerCode,
		contactNo: invoice.contactNo ?? "",
		contactPerson: invoice.contactPerson ?? "",
		currency: invoice.currency,
		defaultAccount: invoice.receivableAccountTitle,
		description: lineEntries[0]?.description ?? "",
		discountAmount: invoice.discountAmount.toFixed(2),
		donation: ZeroMoneyValue,
		documentDate: invoice.documentDate,
		dueDate: invoice.dueDate,
		ewtAmount: invoice.ewtAmount.toFixed(2),
		exchangeRate: invoice.exchangeRate.toFixed(4),
		expirationDate: invoice.dueDate,
		grossAmount: invoice.grossAmount.toFixed(2),
		invoiceNo: invoice.invoiceNo ?? "",
		joNo: "",
		lineEntries,
		name: invoice.customerName,
		netAmount: invoice.netAmount.toFixed(2),
		partnersClientCode: "",
		partnersClientName: "",
		poNo: "",
		projectCode: invoice.projectCode ?? "",
		projectName: invoice.projectName ?? "",
		projectRef: invoice.projectRef ?? "",
		recoupment: ZeroMoneyValue,
		referenceNo: invoice.referenceNo ?? "",
		remarks: invoice.remarks ?? "",
		residentCustomerCode: "",
		residentCustomerName: "",
		salesAssociate: invoice.salesAssociate ?? "",
		sjNo: "",
		soNo: "",
		startDate: invoice.documentDate,
		status: mapStatusFromApi(invoice.status),
		teamAssigned: invoice.teamAssigned ?? "",
		terms: invoice.termId ?? invoice.terms ?? "",
		transactionNo: invoice.transactionNo,
		vatAmount: invoice.vatAmount.toFixed(2),
		wvatAmount: invoice.wvatAmount.toFixed(2),
	};
}

function mapApiBillingDetail(
	detail: BillingResponseDto["details"][number],
): BillingLineEntry {
	return {
		amount: detail.amount.toFixed(2),
		description: detail.description,
		discountAmount: detail.discountAmount.toFixed(2),
		discountPercent: detail.discountPercent.toFixed(2),
		ewtAmount: detail.ewtAmount.toFixed(2),
		ewtType: detail.ewtType ?? "",
		grossAmount: detail.grossAmount.toFixed(2),
		id: detail.id,
		netAmount: detail.netAmount.toFixed(2),
		particulars: detail.particulars ?? "",
		quantity: detail.quantity.toFixed(2),
		responsibilityCenter: detail.responsibilityCenter ?? "",
		vatAmount: detail.vatAmount.toFixed(2),
		vatInclusive: detail.vatInclusive ? "True" : "False",
		vatType: detail.vatType ?? "",
		vatable: detail.vatable ? "True" : "False",
		withEwt: detail.withEwt ? "True" : "False",
		withWvat: detail.withWvat ? "True" : "False",
		wvatAmount: detail.wvatAmount.toFixed(2),
		wvatType: detail.wvatType ?? "",
	};
}

function mapApiJournalEntry(
	entry: BillingResponseDto["journalEntries"][number],
): BillingAccountingEntry {
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

function toApiBillingPayload(
	values: BillingFormValues,
	branchUnitId?: number | null,
): CreateBillingDto {
	const currencyCode = values.currency.trim();
	const exchangeRate = toExchangeRate(values.exchangeRate);
	const postableAccountingEntries = values.accountingEntries.filter(
		(entry) => toNumber(entry.debit) > 0 || toNumber(entry.credit) > 0,
	);

	return {
		address: cleanOptional(values.address),
		billToName: cleanOptional(values.billToName),
		branchUnitId: branchUnitId ?? undefined,
		businessStyle: cleanOptional(values.businessStyle),
		contactNo: cleanOptional(values.contactNo),
		contactPerson: cleanOptional(values.contactPerson),
		currency: currencyCode,
		customerCode: values.code.trim(),
		customerName: values.name.trim(),
		details: values.lineEntries.map((line, index) => ({
			amount: toNumber(line.amount),
			description: line.description.trim(),
			discountAmount: toNumber(line.discountAmount),
			discountPercent: toNumber(line.discountPercent),
			ewtAmount: toNumber(line.ewtAmount),
			ewtType: cleanOptional(line.ewtType),
			grossAmount: toNumber(line.grossAmount),
			lineNumber: index + 1,
			netAmount: toNumber(line.netAmount),
			particulars: cleanOptional(line.particulars),
			quantity: toNumber(line.quantity),
			responsibilityCenter: cleanOptional(line.responsibilityCenter),
			vatAmount: toNumber(line.vatAmount),
			vatInclusive: toBoolean(line.vatInclusive),
			vatType: cleanOptional(line.vatType),
			vatable: toBoolean(line.vatable),
			withEwt: toBoolean(line.withEwt),
			withWvat: toBoolean(line.withWvat),
			wvatAmount: toNumber(line.wvatAmount),
			wvatType: cleanOptional(line.wvatType),
		})),
		discountAmount: toNumber(values.discountAmount),
		documentDate: values.documentDate,
		dueDate: values.dueDate,
		ewtAmount: toNumber(values.ewtAmount),
		exchangeRate,
		grossAmount: toNumber(values.grossAmount),
		invoiceNo: cleanOptional(values.invoiceNo),
		journalEntries: postableAccountingEntries.map((entry, index) => ({
			accountCode: entry.accountCode.trim(),
			accountTitle: entry.accountTitle.trim(),
			atcCode: cleanOptional(entry.atcCode),
			credit: toNumber(entry.credit),
			currencyCode,
			debit: toNumber(entry.debit),
			exchangeRate,
			lineNumber: index + 1,
			particulars: cleanOptional(entry.particulars),
			partyCode: cleanOptional(entry.partyCode),
			partyName: cleanOptional(entry.partyName),
			referenceType: "BILL",
			refNo: cleanOptional(entry.refNo),
			responsibilityCenter: cleanOptional(entry.responsibilityCenter),
			vatType: cleanOptional(entry.vatType),
		})),
		netAmount: toNumber(values.netAmount),
		projectCode: cleanOptional(values.projectCode),
		projectName: cleanOptional(values.projectName),
		projectRef: cleanOptional(values.projectRef),
		receivableAccountCode:
			values.accountingEntries[0]?.accountCode.trim() || values.defaultAccount.trim(),
		receivableAccountTitle: values.defaultAccount.trim(),
		referenceNo: cleanOptional(values.referenceNo),
		remarks: cleanOptional(values.remarks),
		salesAssociate: cleanOptional(values.salesAssociate),
		teamAssigned: cleanOptional(values.teamAssigned),
		termId: null,
		terms: cleanOptional(values.terms),
		transactionNo: cleanOptional(values.transactionNo),
		vatAmount: toNumber(values.vatAmount),
		wvatAmount: toNumber(values.wvatAmount),
	};
}

function createFormValuesFromRecord(
	record: BillingRecord,
): BillingFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		accountingEntries: [],
		address: "",
		attachments: [],
		billToName: "",
		businessStyle: "",
		code: record.customerCode,
		contactNo: "",
		contactPerson: "",
		currency: "PHP",
		defaultAccount: "",
		description: "",
		discountAmount: ZeroMoneyValue,
		donation: ZeroMoneyValue,
		documentDate: record.documentDate,
		dueDate: today,
		ewtAmount: ZeroMoneyValue,
		exchangeRate: "1.0000",
		expirationDate: today,
		grossAmount: record.amount.toFixed(2),
		invoiceNo: record.invoiceNo,
		joNo: "",
		lineEntries: [],
		name: record.customerName,
		netAmount: record.amount.toFixed(2),
		partnersClientCode: "",
		partnersClientName: "",
		poNo: "",
		projectCode: "",
		projectName: "",
		projectRef: "",
		recoupment: ZeroMoneyValue,
		referenceNo: record.referenceNo,
		remarks: "",
		residentCustomerCode: "",
		residentCustomerName: "",
		salesAssociate: "",
		sjNo: "",
		soNo: "",
		startDate: record.documentDate,
		status: record.status,
		teamAssigned: "",
		terms: "",
		transactionNo: record.transactionNo,
		vatAmount: ZeroMoneyValue,
		wvatAmount: ZeroMoneyValue,
	};
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
	value: BillingResponseDtoStatus,
): BillingStatus {
	return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(
	value: BillingStatus,
): UpdateBillingStatusDto["status"] {
	return StatusToApi[value] ?? "DRAFT";
}

function toBoolean(value: string) {
	return value.trim().toLowerCase() === "true";
}

function toExchangeRate(value: number | string | null | undefined) {
	const numberValue = toNumber(value, 1);

	return numberValue > 0 ? numberValue : 1;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
	const numberValue =
		typeof value === "string" ? parseMoneyNumberInput(value) : Number(value);

	return Number.isFinite(numberValue) ? numberValue : fallback;
}
