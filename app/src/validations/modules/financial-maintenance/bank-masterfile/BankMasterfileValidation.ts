import { z } from "zod";
import {
	BankMasterfileAccountTypeOptions,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import type {
	BankImportCellErrors,
	BankImportColumnId,
	BankImportPreviewRow,
	BankMasterfile,
	BankMasterfileFormErrors,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";

const DigitsOnlyPattern = /^\d+$/;
const BankMasterfileAccountTypeSchema = z.enum(BankMasterfileAccountTypeOptions);
const BankMasterfileStatusSchema = z.enum(BankMasterfileStatusOptions);

const BankMasterfileFormSchema = z
	.object({
		bankName: z.string().trim().min(1, "Bank is required."),
		branch: z.string(),
		accountNumber: z.string(),
		accountType: BankMasterfileAccountTypeSchema,
		currencyCode: z.string().trim().min(1, "Currency is required."),
		isDefault: z.boolean(),
		seriesStart: z.string().trim().min(1, "Series start is required."),
		seriesEnd: z.string().trim().min(1, "Series end is required."),
		seriesDigits: z.string().trim().min(1, "Series digits are required."),
		status: BankMasterfileStatusSchema,
	})
	.superRefine((values, ctx) => {
		addBankMasterfileIssues(values, ctx, {
			accountNumberRequiredMessage:
				"Account number is required before activating.",
		});
	});

const BankImportRowSchema = z
	.object({
		bankName: z.string().trim().min(1, "Bank is required."),
		branch: z.string(),
		accountNumber: z.string(),
		accountType: BankMasterfileAccountTypeSchema,
		currencyCode: z.string().trim().min(1, "Currency is required."),
		isDefault: z.boolean(),
		seriesStart: z.string().trim().min(1, "Series start is required."),
		seriesEnd: z.string().trim().min(1, "Series end is required."),
		seriesDigits: z.string().trim().min(1, "Series digits are required."),
		status: BankMasterfileStatusSchema,
	})
	.superRefine((values, ctx) => {
		addBankMasterfileIssues(values, ctx, {
			accountNumberRequiredMessage:
				"Account number is required before activating.",
		});
	});

export function validateBankMasterfileForm(
	values: BankMasterfileFormValues,
): BankMasterfileFormErrors {
	const parsed = BankMasterfileFormSchema.safeParse(values);

	return parsed.success ? {} : mapFormIssues(parsed.error.issues);
}

export function validateBankImportRows(
	rows: BankImportPreviewRow[],
	existingBanks: BankMasterfile[],
) {
	const existingKeys = new Set(existingBanks.map(getBankKey));
	const importCounts = new Map<string, number>();

	rows.forEach((row) => {
		if (isBlankBankImportRow(row)) {
			return;
		}

		const key = getBankKey(row.values);
		importCounts.set(key, (importCounts.get(key) ?? 0) + 1);
	});

	return rows.map((row) => {
		const rowErrors: string[] = [];
		const values = row.values;
		const key = getBankKey(values);
		const isBlank = isBlankBankImportRow(row);
		const parsed = isBlank ? null : BankImportRowSchema.safeParse(values);
		const cellErrors =
			!parsed || parsed.success ? {} : mapImportIssues(parsed.error.issues);

		if (!isBlank && existingKeys.has(key))
			rowErrors.push("This bank account already exists.");
		if (!isBlank && (importCounts.get(key) ?? 0) > 1)
			rowErrors.push("Duplicate bank account in import.");

		return { ...row, cellErrors, rowErrors };
	});
}

export function rowHasBankImportErrors(row: BankImportPreviewRow) {
	return row.rowErrors.length > 0 || Object.keys(row.cellErrors).length > 0;
}

export function isBlankBankImportRow(row: BankImportPreviewRow) {
	const values = row.values;

	return (
		!values.bankName.trim() &&
		!values.branch.trim() &&
		!values.accountNumber.trim() &&
		values.accountType === "Checking" &&
		values.currencyCode === "PHP" &&
		!values.seriesStart.trim() &&
		!values.seriesEnd.trim() &&
		!values.seriesDigits.trim() &&
		!values.isDefault &&
		values.status === "Active"
	);
}

function getBankKey(
	bank: Pick<BankMasterfileFormValues, "bankName" | "branch" | "accountNumber">,
) {
	return [bank.bankName, bank.branch, bank.accountNumber]
		.map((value) => value.trim().toLowerCase())
		.join("|");
}

function addBankMasterfileIssues(
	values: BankMasterfileFormValues,
	ctx: z.RefinementCtx,
	messages: {
		accountNumberRequiredMessage: string;
	},
) {
	if (values.status === "Active" && !values.accountNumber.trim()) {
		addIssue(ctx, "accountNumber", messages.accountNumberRequiredMessage);
	}

	if (values.seriesDigits.trim() && !isPositiveInteger(values.seriesDigits)) {
		addIssue(ctx, "seriesDigits", "Series digits must be a positive whole number.");
	}

	if (values.seriesStart.trim() && !DigitsOnlyPattern.test(values.seriesStart)) {
		addIssue(ctx, "seriesStart", "Series start must contain digits only.");
	}

	if (values.seriesEnd.trim() && !DigitsOnlyPattern.test(values.seriesEnd)) {
		addIssue(ctx, "seriesEnd", "Series end must contain digits only.");
	}

	if (
		DigitsOnlyPattern.test(values.seriesStart) &&
		DigitsOnlyPattern.test(values.seriesEnd) &&
		Number(values.seriesStart) > Number(values.seriesEnd)
	) {
		addIssue(
			ctx,
			"seriesEnd",
			"Series end must be greater than or equal to series start.",
		);
	}
}

function addIssue(
	ctx: z.RefinementCtx,
	path: BankImportColumnId,
	message: string,
) {
	ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message,
		path: [path],
	});
}

function mapFormIssues(issues: z.ZodIssue[]) {
	const errors: BankMasterfileFormErrors = {};

	for (const issue of issues) {
		const field = issue.path[0];

		if (isBankMasterfileField(field) && !errors[field]) {
			errors[field] = getBankMasterfileIssueMessage(field, issue.message);
		}
	}

	return errors;
}

function mapImportIssues(issues: z.ZodIssue[]) {
	const errors: BankImportCellErrors = {};

	for (const issue of issues) {
		const field = issue.path[0];

		if (isBankMasterfileField(field)) {
			errors[field] = [
				...(errors[field] ?? []),
				getBankMasterfileIssueMessage(field, issue.message),
			];
		}
	}

	return errors;
}

function getBankMasterfileIssueMessage(
	field: BankImportColumnId,
	message: string,
) {
	if (
		(field === "accountType" || field === "status") &&
		(message === "Invalid input" || message.toLowerCase().includes("invalid"))
	) {
		return field === "accountType"
			? "Choose a valid account type from the list."
			: "Choose a valid status from the list.";
	}

	if (message !== "Invalid input") {
		return message;
	}

	switch (field) {
		case "bankName":
			return "Bank is required.";
		case "accountType":
			return "Choose a valid account type from the list.";
		case "currencyCode":
			return "Currency is required.";
		case "seriesStart":
			return "Series start is required.";
		case "seriesEnd":
			return "Series end is required.";
		case "seriesDigits":
			return "Series digits are required.";
		case "status":
			return "Choose a valid status from the list.";
		default:
			return message;
	}
}

function isBankMasterfileField(value: unknown): value is BankImportColumnId {
	return (
		typeof value === "string" &&
		[
			"bankName",
			"branch",
			"accountNumber",
			"accountType",
			"currencyCode",
			"isDefault",
			"seriesStart",
			"seriesEnd",
			"seriesDigits",
			"status",
		].includes(value)
	);
}

function isPositiveInteger(value: string) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0;
}

