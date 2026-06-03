"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	SalesJournalInitialFormValues,
	createSalesJournalFormValues,
	createSalesJournalFromForm,
	createSalesJournalLine,
	getSalesJournalTotals,
	renumberSalesJournalLines,
	updateSalesJournalFromForm,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { useSalesJournalStore } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournal";
import type {
	SalesJournalActionMode,
	SalesJournalFormErrors,
	SalesJournalFormValues,
	SalesJournalLineField,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { validateSalesJournalForm } from "@/app/src/validations/modules/sales/sales-journal/SalesJournalValidation";

export function useSalesJournalFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const records = useSalesJournalStore((state) => state.records);
	const addRecord = useSalesJournalStore((state) => state.addRecord);
	const updateRecord = useSalesJournalStore((state) => state.updateRecord);
	const deleteRecord = useSalesJournalStore((state) => state.deleteRecord);
	const isMutating = useSalesJournalStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingRecord = records.find((record) => record.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<SalesJournalFormValues>(() =>
		existingRecord
			? createSalesJournalFormValues(existingRecord)
			: SalesJournalInitialFormValues,
	);
	const [errors, setErrors] = useState<SalesJournalFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const totals = useMemo(() => getSalesJournalTotals(values.lines), [values.lines]);

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) {
		const field = event.target.name as keyof SalesJournalFormValues;
		const value =
			field === "exchangeRate"
				? Number(event.target.value || 0)
				: event.target.value;

		setValues((current) => ({
			...current,
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateLine(
		lineId: string,
		field: SalesJournalLineField,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		const normalizedValue =
			field === "debit" || field === "credit" ? Number(value || 0) : value;

		setValues((current) => ({
			...current,
			lines: current.lines.map((line) =>
				line.id === lineId ? { ...line, [field]: normalizedValue } : line,
			),
		}));
		setErrors((current) => ({
			...current,
			balance: undefined,
			lineErrors: {
				...current.lineErrors,
				[lineId]: {
					...current.lineErrors?.[lineId],
					[field]: undefined,
				},
			},
		}));
	}

	function addLine() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: [
				...current.lines,
				createSalesJournalLine(current.lines.length + 1),
			],
		}));
		setErrors((current) => ({ ...current, lines: undefined }));
	}

	function deleteLine(lineId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: renumberSalesJournalLines(
				current.lines.filter((line) => line.id !== lineId),
			),
		}));
		setErrors((current) => ({ ...current, balance: undefined }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateSalesJournalForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please balance the sales journal before saving.");
			return;
		}

		if (mode === "edit" && existingRecord) {
			updateRecord(updateSalesJournalFromForm(existingRecord, values));
		} else if (mode === "edit") {
			toast.error("Could not find the sales journal to update.");
			return;
		} else {
			addRecord(createSalesJournalFromForm(values));
		}

		router.push(SalesJournalHref);
	}

	function handleConfirmDelete() {
		if (!existingRecord) {
			toast.error("Could not find the sales journal to delete.");
			return;
		}

		deleteRecord(existingRecord.id);
		setIsDeleteDialogOpen(false);
		router.push(SalesJournalHref);
	}

	return {
		addLine,
		deleteLine,
		errors,
		existingRecord,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		setIsDeleteDialogOpen,
		totals,
		updateLine,
		values,
	};
}

function getActionMode(pathname: string): SalesJournalActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
