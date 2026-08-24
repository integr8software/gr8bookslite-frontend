import {
	serviceInvoiceControllerCreateV1,
	serviceInvoiceControllerFindAllV1,
	serviceInvoiceControllerFindOneV1,
	serviceInvoiceControllerSuggestTransactionNumberV1,
	serviceInvoiceControllerUpdateStatusV1,
	serviceInvoiceControllerUpdateV1,
} from "@/app/src/generated/api/service-invoice/service-invoice";
import type {
	CreateServiceInvoiceDto,
	ServiceInvoiceControllerFindAllV1Params,
	ServiceInvoiceResponseDto,
	ServiceInvoiceResponseDtoStatus,
	UpdateServiceInvoiceStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	ServiceInvoiceAccountingEntry,
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
	ServiceInvoiceRecord,
	ServiceInvoiceStatus,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";

export type ServiceInvoiceListData = Awaited<
	ReturnType<typeof serviceInvoiceControllerFindAllV1>
>;

export type ServiceInvoiceNumberSuggestion = Awaited<
	ReturnType<typeof serviceInvoiceControllerSuggestTransactionNumberV1>
>;

type ServiceInvoiceListQuery = {
	amountFrom?: number | null;
	amountTo?: number | null;
	branchUnitId?: number | null;
	documentDateFrom?: string | null;
	documentDateTo?: string | null;
	limit?: number;
	page?: number;
	search?: string | null;
	sortBy?: ServiceInvoiceControllerFindAllV1Params["sortBy"];
	sortDirection?: ServiceInvoiceControllerFindAllV1Params["sortDirection"];
	status?: ServiceInvoiceStatus | "all" | null;
};

const StatusFromApi: Record<string, ServiceInvoiceStatus> = {
	CANCELLED: "Cancelled",
	DISAPPROVED: "Disapproved",
	DRAFT: "Draft",
	FOR_APPROVAL: "For Approval",
	POSTED: "Posted",
};

const StatusToApi: Record<
	ServiceInvoiceStatus,
	UpdateServiceInvoiceStatusDto["status"]
> = {
	Cancelled: "CANCELLED",
	Disapproved: "DISAPPROVED",
	Draft: "DRAFT",
	"For Approval": "FOR_APPROVAL",
	Posted: "POSTED",
};

export async function fetchServiceInvoices(
	query: ServiceInvoiceListQuery = {},
): Promise<ServiceInvoiceListData> {
	return serviceInvoiceControllerFindAllV1(
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

export async function fetchServiceInvoice(
	id: string,
	query: Pick<ServiceInvoiceListQuery, "branchUnitId"> = {},
): Promise<ServiceInvoiceRecord> {
	const response = await serviceInvoiceControllerFindOneV1(
		id,
		cleanQueryParams({ branchUnitId: query.branchUnitId }),
	);

	return mapApiServiceInvoice(response.invoice);
}

export async function fetchServiceInvoiceNumberSuggestion(
	branchUnitId?: number | null,
): Promise<ServiceInvoiceNumberSuggestion> {
	return serviceInvoiceControllerSuggestTransactionNumberV1(
		cleanQueryParams({ branchUnitId }),
	);
}

export async function createServiceInvoice(
	values: ServiceInvoiceFormValues,
	branchUnitId?: number | null,
): Promise<ServiceInvoiceRecord> {
	const response = await serviceInvoiceControllerCreateV1(
		toApiServiceInvoicePayload(values, branchUnitId),
	);

	return mapApiServiceInvoice(response.invoice);
}

export async function updateServiceInvoice(
	record: ServiceInvoiceRecord,
	branchUnitId?: number | null,
): Promise<ServiceInvoiceRecord> {
	const response = await serviceInvoiceControllerUpdateV1(
		record.id,
		toApiServiceInvoicePayload(
			record.formValues ?? createFormValuesFromRecord(record),
			branchUnitId,
		),
	);

	return mapApiServiceInvoice(response.invoice);
}

export async function updateServiceInvoiceStatus(input: {
	recordId: string;
	status: ServiceInvoiceStatus;
}): Promise<ServiceInvoiceRecord> {
	const response = await serviceInvoiceControllerUpdateStatusV1(input.recordId, {
		status: mapStatusToApi(input.status),
	});

	return mapApiServiceInvoice(response.invoice);
}

export function mapApiServiceInvoice(
	invoice: ServiceInvoiceResponseDto,
): ServiceInvoiceRecord {
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
	invoice: ServiceInvoiceResponseDto,
): ServiceInvoiceFormValues {
	const lineEntries = invoice.details.map(mapApiServiceInvoiceDetail);

	return {
		accountingEntries: invoice.journalEntries.map(mapApiJournalEntry),
		address: invoice.address ?? "",
		billToName: invoice.billToName ?? "",
		businessStyle: invoice.businessStyle ?? "",
		code: invoice.customerCode,
		contactNo: invoice.contactNo ?? "",
		contactPerson: invoice.contactPerson ?? "",
		currency: invoice.currency,
		defaultAccount: invoice.receivableAccountTitle,
		description: lineEntries[0]?.description ?? "",
		discountAmount: invoice.discountAmount.toFixed(2),
		donation: "0.00",
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
		recoupment: "0.00",
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

function mapApiServiceInvoiceDetail(
	detail: ServiceInvoiceResponseDto["details"][number],
): ServiceInvoiceLineEntry {
	const derivedAmounts = getDerivedServiceInvoiceDetailAmounts(detail);

	return {
		amount: detail.amount.toFixed(2),
		description: detail.description,
		discountAmount: detail.discountAmount.toFixed(2),
		discountPercent: detail.discountPercent.toFixed(2),
		ewtAmount: detail.ewtAmount.toFixed(2),
		ewtType: detail.ewtType ?? "",
		grossAmount: detail.grossAmount.toFixed(2),
		grossAfterDiscount: derivedAmounts.grossAfterDiscount.toFixed(2),
		id: detail.id,
		netAmount: detail.netAmount.toFixed(2),
		netOfVatAmount: derivedAmounts.netOfVatAmount.toFixed(2),
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

function getDerivedServiceInvoiceDetailAmounts(
	detail: ServiceInvoiceResponseDto["details"][number],
) {
	const grossAmount = detail.amount * Math.max(detail.quantity, 0);
	const discountAmount =
		grossAmount * (Math.max(detail.discountPercent, 0) / 100);
	const grossAfterDiscount = Math.max(grossAmount - discountAmount, 0);
	const netOfVatAmount =
		detail.vatable && detail.vatInclusive
			? Math.max(grossAfterDiscount - detail.vatAmount, 0)
			: grossAfterDiscount;

	return { grossAfterDiscount, netOfVatAmount };
}

function mapApiJournalEntry(
	entry: ServiceInvoiceResponseDto["journalEntries"][number],
): ServiceInvoiceAccountingEntry {
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

function toApiServiceInvoicePayload(
	values: ServiceInvoiceFormValues,
	branchUnitId?: number | null,
): CreateServiceInvoiceDto {
	const currencyCode = values.currency.trim();
	const exchangeRate = toExchangeRate(values.exchangeRate);

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
		journalEntries: values.accountingEntries.map((entry, index) => ({
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
			referenceType: "SI",
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
	record: ServiceInvoiceRecord,
): ServiceInvoiceFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		accountingEntries: [],
		address: "",
		billToName: "",
		businessStyle: "",
		code: record.customerCode,
		contactNo: "",
		contactPerson: "",
		currency: "PHP",
		defaultAccount: "",
		description: "",
		discountAmount: "0.00",
		donation: "0.00",
		documentDate: record.documentDate,
		dueDate: today,
		ewtAmount: "0.00",
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
		recoupment: "0.00",
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
		vatAmount: "0.00",
		wvatAmount: "0.00",
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
	value: ServiceInvoiceResponseDtoStatus,
): ServiceInvoiceStatus {
	return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(
	value: ServiceInvoiceStatus,
): UpdateServiceInvoiceStatusDto["status"] {
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
