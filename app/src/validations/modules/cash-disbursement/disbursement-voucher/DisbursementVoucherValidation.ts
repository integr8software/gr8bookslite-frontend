import type {
	DisbursementVoucherEntryDraft,
	DisbursementVoucherFormErrors,
	DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export function validateDisbursementVoucherDetails(
	values: DisbursementVoucherFormValues,
) {
	const errors: DisbursementVoucherFormErrors = {};

	if (!values.paymentMethod) {
		errors.paymentMethod = "Payment method is required.";
	}

	if (!values.partyCode.trim()) {
		errors.partyCode = "Party code is required.";
	}

	if (!values.partyName.trim()) {
		errors.partyName = "Party name is required.";
	}

	return errors;
}

export function validateDisbursementVoucherEntries(
	values: DisbursementVoucherFormValues,
) {
	const errors: DisbursementVoucherFormErrors = {};
	const totalDebit = values.lineEntries.reduce(
		(sum, entry) => sum + entry.debit,
		0,
	);
	const totalCredit = values.lineEntries.reduce(
		(sum, entry) => sum + entry.credit,
		0,
	);

	if (values.lineEntries.length < 2) {
		errors.lineEntries = "Add at least two line entries.";
	} else if (values.lineEntries.some(entryHasMissingRequiredFields)) {
		errors.lineEntries =
			"Each line needs an account title, account code, and either a debit or credit amount.";
	} else if (values.lineEntries.some(entryHasBothDebitAndCredit)) {
		errors.lineEntries = "Each line can only carry a debit or a credit amount.";
	} else if (totalDebit <= 0 || totalCredit <= 0) {
		errors.lineEntries = "Entries must include both debit and credit values.";
	} else if (Math.abs(totalDebit - totalCredit) > 0.001) {
		errors.lineEntries = "Debit and credit totals must balance before review.";
	}

	return errors;
}

export function validateDisbursementEntryDraft(
	draft: DisbursementVoucherEntryDraft,
) {
	if (!draft.accountCode.trim()) {
		return "Account code is required.";
	}

	if (!draft.accountName.trim()) {
		return "Account title is required.";
	}

	const debit = parseMoneyNumberInput(draft.debit);
	const credit = parseMoneyNumberInput(draft.credit);

	if (debit <= 0 && credit <= 0) {
		return "Enter a debit or credit amount.";
	}

	if (debit > 0 && credit > 0) {
		return "Each line can only carry a debit or a credit amount.";
	}

	return undefined;
}

function entryHasMissingRequiredFields(
	entry: DisbursementVoucherFormValues["lineEntries"][number],
) {
	const debit = parseMoneyNumberInput(entry.debit);
	const credit = parseMoneyNumberInput(entry.credit);

	return (
		!entry.accountName.trim() ||
		!entry.accountCode.trim() ||
		(debit <= 0 && credit <= 0)
	);
}

function entryHasBothDebitAndCredit(
	entry: DisbursementVoucherFormValues["lineEntries"][number],
) {
	return (
		parseMoneyNumberInput(entry.debit) > 0 &&
		parseMoneyNumberInput(entry.credit) > 0
	);
}
