import { billingInvoiceControllerCreateV1, billingInvoiceControllerFindAllV1, billingInvoiceControllerFindOneV1, billingInvoiceControllerUpdateV1 } from "@/app/src/generated/api/billing-invoice/billing-invoice";
import type { BillingInvoiceDetailResponseDto, BillingInvoiceJournalEntryResponseDto, CreateBillingInvoiceDto, SalesBillingInvoiceResponseDto, UpdateBillingInvoiceDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { BillingInvoiceAccountEntry, BillingInvoiceFormValues, BillingInvoiceLineEntry, BillingInvoiceRecord, BillingInvoiceStatus } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { createBlankBillingInvoiceAccountEntry, createBlankBillingInvoiceLineEntry } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { createServiceInvoiceAccountingEntries } from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceLineEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";

const apiOptions = {
	baseURL: "/api/backend",
	url: "/sales/billing-invoice",
};

function optional(value: string) {
	return value.trim() || null;
}

function boolean(value: string) {
	return value.toLowerCase() === "true";
}

function mapStatus(status: SalesBillingInvoiceResponseDto["status"]): BillingInvoiceStatus {
	const statusMap: Record<SalesBillingInvoiceResponseDto["status"], BillingInvoiceStatus> = {
		DRAFT: "Draft",
		FOR_APPROVAL: "Pending",
		DISAPPROVED: "Disapproved",
		POSTED: "Approved",
		CANCELLED: "Cancelled",
	};
	return statusMap[status];
}

function mapLineEntry(detail: BillingInvoiceDetailResponseDto): BillingInvoiceLineEntry {
	return createBlankBillingInvoiceLineEntry({
		id: detail.id,
		description: detail.description,
		particulars: detail.particulars ?? "",
		quantity: String(detail.quantity),
		amount: detail.amount.toFixed(2),
		netAmount: detail.netAmount.toFixed(2),
		vatAmount: detail.vatAmount.toFixed(2),
		wvatAmount: detail.wvatAmount.toFixed(2),
		ewtAmount: detail.ewtAmount.toFixed(2),
		discountPercent: String(detail.discountPercent),
		discountAmount: detail.discountAmount.toFixed(2),
		grossAmount: detail.grossAmount.toFixed(2),
		vatType: detail.vatType ?? "VAT (12%)",
		vatable: detail.vatable ? "True" : "False",
		vatInclusive: detail.vatInclusive ? "True" : "False",
		withWvat: detail.withWvat ? "True" : "False",
		wvatType: detail.wvatType ?? "0.00",
		withEwt: detail.withEwt ? "True" : "False",
		ewtType: detail.ewtType ?? "0.00",
		responsibilityCenter: detail.responsibilityCenter ?? "",
	});
}

function mapAccountEntry(entry: BillingInvoiceJournalEntryResponseDto): BillingInvoiceAccountEntry {
	return createBlankBillingInvoiceAccountEntry({
		id: entry.id,
		accountCode: entry.accountCode,
		accountTitle: entry.accountTitle,
		particulars: entry.particulars ?? "",
		debit: entry.debit.toFixed(2),
		credit: entry.credit.toFixed(2),
		vatType: entry.vatType ?? "",
		atcCode: entry.atcCode ?? "",
		partyCode: entry.partyCode ?? "",
		partyName: entry.partyName ?? "",
		responsibilityCenter: entry.responsibilityCenter ?? "",
		refNo: entry.refNo ?? "",
	});
}

function mapBillingInvoice(invoice: SalesBillingInvoiceResponseDto): BillingInvoiceRecord {
	return {
		id: invoice.id,
		amount: invoice.grossAmount,
		customerCode: invoice.customerCode,
		customerName: invoice.customerName,
		documentDate: invoice.documentDate,
		invoiceNo: invoice.invoiceNo ?? invoice.transactionNo,
		referenceNo: invoice.referenceNo ?? "",
		status: mapStatus(invoice.status),
		transactionNo: invoice.transactionNo,
	};
}

function mapBillingInvoiceWithDetails(invoice: SalesBillingInvoiceResponseDto): BillingInvoiceRecord {
	const lineEntries = invoice.details?.length
		? invoice.details.map(mapLineEntry)
		: [createBlankBillingInvoiceLineEntry()];

	const accountEntries = invoice.journalEntries?.length
		? invoice.journalEntries.map(mapAccountEntry)
		: [createBlankBillingInvoiceAccountEntry(), createBlankBillingInvoiceAccountEntry()];

	const formValues: BillingInvoiceFormValues = {
		transactionNo: invoice.transactionNo,
		documentDate: invoice.documentDate,
		dueDate: invoice.dueDate,
		invoiceNo: invoice.invoiceNo ?? "",
		referenceNo: invoice.referenceNo ?? "",
		code: invoice.customerCode,
		name: invoice.customerName,
		billToName: invoice.billToName ?? "",
		address: invoice.address ?? "",
		contactPerson: invoice.contactPerson ?? "",
		contactNo: invoice.contactNo ?? "",
		businessStyle: invoice.businessStyle ?? "",
		projectName: invoice.projectName ?? "",
		projectRef: invoice.projectRef ?? "",
		salesAssociate: invoice.salesAssociate ?? "",
		teamAssigned: invoice.teamAssigned ?? "",
		currency: invoice.currency,
		exchangeRate: invoice.exchangeRate.toFixed(4),
		netAmount: invoice.netAmount.toFixed(2),
		vatAmount: invoice.vatAmount.toFixed(2),
		wvatAmount: invoice.wvatAmount.toFixed(2),
		ewtAmount: invoice.ewtAmount.toFixed(2),
		discountAmount: invoice.discountAmount.toFixed(2),
		grossAmount: invoice.grossAmount.toFixed(2),
		terms: invoice.terms ?? "",
		remarks: invoice.remarks ?? "",
		status: mapStatus(invoice.status),
		defaultAccount: invoice.receivableAccountTitle ?? "",
		lineEntries,
		accountEntries,
		// Fields not returned by the API — keep defaults
		billToCode: "",
		drNo: "",
		resCenter: "",
		description: "",
		startDate: invoice.documentDate,
		expirationDate: invoice.dueDate,
		chargeWeight: "",
		actualWeight: "",
		cargoDescription: "",
		noPackages: "",
		noContainers: "",
		destinationPort: "",
		clearancePort: "",
		recoupment: "0.00",
		donation: "0.00",
		partnersClientCode: "",
		partnersClientName: "",
		sjNo: "",
		soNo: "",
		poNo: "",
		ourReference: "",
		clientReference: "",
		entryDate: "",
		shipperConsignee: "",
		entryNumber: "",
		mawbNo: "",
		blHawbNo: "",
		carrierFlight: "",
		etsEtd: "",
		eta: "",
		originPort: "",
		residentCustomerCode: "",
		residentCustomerName: "",
	};

	return {
		...mapBillingInvoice(invoice),
		formValues,
	};
}

export async function fetchBillingInvoices(): Promise<BillingInvoiceRecord[]> {
	const response = await billingInvoiceControllerFindAllV1(undefined, apiOptions);
	return response.data.invoices.map(mapBillingInvoice);
}

export async function fetchBillingInvoice(id: string): Promise<BillingInvoiceRecord> {
	const response = await billingInvoiceControllerFindOneV1(id, undefined, apiOptions);
	return mapBillingInvoiceWithDetails(response.data.invoice);
}

function toBillingInvoicePayload(values: BillingInvoiceFormValues): CreateBillingInvoiceDto & UpdateBillingInvoiceDto {
	const exchangeRate = parseMoneyNumberInput(values.exchangeRate) || 1;
	const accountEntriesWithValues = values.accountEntries.filter(
		(entry) => parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0,
	);
	const calculatedAccountEntries = createServiceInvoiceAccountingEntries({
		defaultAccount: "",
		lineEntries: values.lineEntries as unknown as ServiceInvoiceLineEntry[],
	}).map((entry) => ({
		...entry,
		debit: String(entry.debit),
		credit: String(entry.credit),
	}));
	const submittedAccountEntries = (accountEntriesWithValues.length > 0
		? accountEntriesWithValues
		: calculatedAccountEntries
	).filter((entry) => parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0);

	return {
		transactionNo: optional(values.transactionNo),
		documentDate: values.documentDate,
		dueDate: values.dueDate,
		invoiceNo: optional(values.invoiceNo),
		referenceNo: optional(values.referenceNo),
		customerCode: values.code.trim(),
		customerName: values.name.trim(),
		billToName: optional(values.billToName),
		address: optional(values.address),
		contactPerson: optional(values.contactPerson),
		contactNo: optional(values.contactNo),
		projectName: optional(values.projectName),
		salesAssociate: optional(values.salesAssociate),
		teamAssigned: optional(values.teamAssigned),
		currency: values.currency.trim(),
		exchangeRate,
		netAmount: parseMoneyNumberInput(values.netAmount),
		vatAmount: parseMoneyNumberInput(values.vatAmount),
		wvatAmount: parseMoneyNumberInput(values.wvatAmount),
		ewtAmount: parseMoneyNumberInput(values.ewtAmount),
		discountAmount: parseMoneyNumberInput(values.discountAmount),
		grossAmount: parseMoneyNumberInput(values.grossAmount),
		terms: optional(values.terms),
		receivableAccountCode: submittedAccountEntries[0]?.accountCode || "AR-TRADE",
		receivableAccountTitle: submittedAccountEntries[0]?.accountTitle || "Accounts Receivable - Trade",
		remarks: optional(values.remarks),
		details: values.lineEntries.map((line, index) => ({
			lineNumber: index + 1,
			description: line.description.trim(),
			particulars: optional(line.particulars),
			quantity: parseMoneyNumberInput(line.quantity),
			amount: parseMoneyNumberInput(line.amount),
			netAmount: parseMoneyNumberInput(line.netAmount),
			vatAmount: parseMoneyNumberInput(line.vatAmount),
			wvatAmount: parseMoneyNumberInput(line.wvatAmount),
			ewtAmount: parseMoneyNumberInput(line.ewtAmount),
			discountPercent: parseMoneyNumberInput(line.discountPercent),
			discountAmount: parseMoneyNumberInput(line.discountAmount),
			grossAmount: parseMoneyNumberInput(line.grossAmount),
			vatType: optional(line.vatType),
			vatable: boolean(line.vatable),
			vatInclusive: boolean(line.vatInclusive),
			withWvat: boolean(line.withWvat),
			wvatType: optional(line.wvatType),
			withEwt: boolean(line.withEwt),
			ewtType: optional(line.ewtType),
			responsibilityCenter: optional(line.responsibilityCenter),
		})),
		journalEntries: submittedAccountEntries.map((entry, index) => ({
			lineNumber: index + 1,
			accountCode: entry.accountCode.trim(),
			accountTitle: entry.accountTitle.trim(),
			currencyCode: values.currency.trim(),
			exchangeRate,
			particulars: optional(entry.particulars),
			debit: parseMoneyNumberInput(entry.debit),
			credit: parseMoneyNumberInput(entry.credit),
			partyCode: optional(entry.partyCode),
			partyName: optional(entry.partyName),
			vatType: optional(entry.vatType),
			atcCode: optional(entry.atcCode),
			responsibilityCenter: optional(entry.responsibilityCenter),
			refNo: optional(entry.refNo),
			referenceType: "BI",
		})),
	};
}

export async function createBillingInvoice(values: BillingInvoiceFormValues): Promise<BillingInvoiceRecord> {
	const payload = toBillingInvoicePayload(values);
	const response = await billingInvoiceControllerCreateV1(payload, apiOptions);
	return mapBillingInvoiceWithDetails(response.data.invoice);
}

export async function updateBillingInvoice(id: string, values: BillingInvoiceFormValues): Promise<BillingInvoiceRecord> {
	const payload = toBillingInvoicePayload(values);
	const response = await billingInvoiceControllerUpdateV1(id, payload, apiOptions);
	return mapBillingInvoiceWithDetails(response.data.invoice);
}
