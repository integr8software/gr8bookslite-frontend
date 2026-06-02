import { z } from "zod";
import { getSalesJournalTotals } from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type {
	SalesJournalFormErrors,
	SalesJournalFormValues,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

const salesJournalLineSchema = z.object({
	accountCode: z.string().trim().min(1, "Enter an account code."),
	accountTitle: z.string().trim().min(1, "Enter an account title."),
	debit: z.number().min(0, "Debit cannot be negative."),
	credit: z.number().min(0, "Credit cannot be negative."),
});

const salesJournalHeaderSchema = z.object({
	partyCode: z.string().trim().min(1, "Enter a party code."),
	partyName: z.string().trim().min(1, "Enter a party name."),
	documentDate: z.string().trim().min(1, "Select a document date."),
	currency: z.string().trim().min(1, "Select a currency."),
	exchangeRate: z.number().positive("Enter an exchange rate greater than zero."),
	terms: z.string().trim().min(1, "Enter terms."),
	dueDate: z.string().trim().min(1, "Select a due date."),
	documentNo: z.string().trim().min(1, "Enter a document number."),
	status: z.string().trim().min(1, "Select a status."),
});

export function validateSalesJournalForm(
	values: SalesJournalFormValues,
): SalesJournalFormErrors {
	const errors: SalesJournalFormErrors = {};
	const headerResult = salesJournalHeaderSchema.safeParse(values);

	if (!headerResult.success) {
		for (const issue of headerResult.error.issues) {
			const field = issue.path[0] as keyof SalesJournalFormValues | undefined;

			if (field) {
				errors[field] = issue.message;
			}
		}
	}

	if (values.lines.length === 0) {
		errors.lines = "Add at least one journal line.";
	}

	for (const line of values.lines) {
		const lineResult = salesJournalLineSchema.safeParse(line);
		const hasAmount = Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0;

		if (!lineResult.success || !hasAmount) {
			errors.lineErrors = errors.lineErrors ?? {};
			errors.lineErrors[line.id] = errors.lineErrors[line.id] ?? {};

			for (const issue of lineResult.success ? [] : lineResult.error.issues) {
				const field = issue.path[0] as keyof typeof line | undefined;

				if (field) {
					errors.lineErrors[line.id][field] = issue.message;
				}
			}

			if (!hasAmount) {
				errors.lineErrors[line.id].debit =
					"Enter either a debit or credit amount.";
			}
		}

		if (Number(line.debit || 0) > 0 && Number(line.credit || 0) > 0) {
			errors.lineErrors = errors.lineErrors ?? {};
			errors.lineErrors[line.id] = {
				...errors.lineErrors[line.id],
				credit: "Use only one amount side per line.",
			};
		}
	}

	const totals = getSalesJournalTotals(values.lines);

	if (!totals.isBalanced) {
		errors.balance = "Debit and credit totals must balance before saving.";
	}

	return errors;
}
