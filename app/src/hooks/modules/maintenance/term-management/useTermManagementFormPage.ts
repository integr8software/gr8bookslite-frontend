"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/term-management/TermManagementConstants";
import {
	TermManagementInitialFormValues,
	createTermManagementFormValues,
	updateTermManagementFromForm,
} from "@/app/src/data/modules/maintenance/term-management/TermManagementData";
import type {
	TermManagementActionMode,
	TermManagement,
	TermManagementFormErrors,
	TermManagementFormValues,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { validateTermManagementForm } from "@/app/src/validations/modules/maintenance/term-management/TermManagementValidation";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagement";

type TermManagementFormPageOptions = {
	existingTerm?: TermManagement;
	initialValues?: TermManagementFormValues;
	mode?: TermManagementActionMode;
	onSaved?: () => void;
};

export function useTermManagementFormPage(
	options: TermManagementFormPageOptions = {},
) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { addTerm, isMutating, terms, updateTerm } = useTermManagementStore();
	const mode = options.mode ?? getActionMode(pathname);
	const existingTerm =
		options.existingTerm ?? terms.find((term) => term.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TermManagementFormValues>(() =>
		options.initialValues
			? options.initialValues
			: existingTerm
				? createTermManagementFormValues(existingTerm)
				: TermManagementInitialFormValues,
	);
	const [errors, setErrors] = useState<TermManagementFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus: TermManagementStatus =
		existingTerm?.status === "Active" ? "Inactive" : "Active";

	function updateField(
		field: keyof TermManagementFormValues,
		value: TermManagementFormValues[keyof TermManagementFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const field = event.target.name as keyof TermManagementFormValues;
		const value =
			field === "period"
				? normalizeWholeNumberText(event.target.value)
				: event.target.value;

		updateField(
			field,
			value,
		);
	}

	function validateBeforeSubmit() {
		const nextErrors = validateTermManagementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error(
				"Please review the highlighted fields and enter valid information.",
			);
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validateBeforeSubmit()) {
			return;
		}

		void saveTerm();
	}

	async function saveTerm() {
		setIsSubmitting(true);

		try {
			if (mode === "edit" && existingTerm) {
				await updateTerm(updateTermManagementFromForm(existingTerm, values));
			} else if (mode === "edit") {
				toast.error("Could not find the term definition to update.");
				return;
			} else {
				await addTerm(values);
				setValues(TermManagementInitialFormValues);
				setErrors({});
			}

			options.onSaved?.();
			if (!options.onSaved) router.push(TermManagementHref);
		} catch {
			return;
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleConfirmStatusChange() {
		if (!existingTerm) {
			toast.error("Could not find the term definition to update.");
			return;
		}

		updateTerm({
			...existingTerm,
			status: nextStatus,
		});
		setIsStatusDialogOpen(false);
	}

	return {
		errors,
		existingTerm,
		handleConfirmStatusChange,
		handleInputChange,
		handleSubmit,
		isStatusDialogOpen,
		isSubmitting,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		nextStatus,
		setIsStatusDialogOpen,
		validateBeforeSubmit,
		values,
	};
}

function normalizeWholeNumberText(value: string) {
	return value.replace(/\D/g, "");
}

function getActionMode(pathname: string): TermManagementActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}


