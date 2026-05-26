import type {
	DisbursementVoucherEntryDraft,
	DisbursementVoucherFormErrors,
	DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function validateDisbursementVoucherDetails(
	values: DisbursementVoucherFormValues,
) {
	const errors: DisbursementVoucherFormErrors = {};

	if (!values.transactionId) {
		errors.transactionId = "Choose a transaction before continuing.";
	}

	if (!values.paymentMethod) {
		errors.paymentMethod = "Payment method is required.";
	}

	if (!values.vceCode.trim()) {
		errors.vceCode = "Party code is required.";
	}

	if (!values.vceName.trim()) {
		errors.vceName = "Party name is required.";
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
		return "Account name is required.";
	}

	if (!draft.particulars.trim()) {
		return "Particulars are required.";
	}

	const debit = Number(draft.debit || 0);
	const credit = Number(draft.credit || 0);

	if (debit <= 0 && credit <= 0) {
		return "Enter a debit or credit amount.";
	}

	if (debit > 0 && credit > 0) {
		return "Each line can only carry a debit or a credit amount.";
	}

	return undefined;
}
