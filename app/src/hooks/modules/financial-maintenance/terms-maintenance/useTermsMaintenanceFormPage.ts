"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TermsMaintenanceHref } from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import {
	TermsMaintenanceInitialFormValues,
	createTermsMaintenanceFormValues,
	updateTermsMaintenanceFromForm,
} from "@/app/src/data/modules/financial-maintenance/terms-maintenance/TermsMaintenanceData";
import type {
	TermsMaintenanceActionMode,
	TermsMaintenance,
	TermsMaintenanceFormErrors,
	TermsMaintenanceFormValues,
	TermsMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { validateTermsMaintenanceForm } from "@/app/src/validations/modules/financial-maintenance/terms-maintenance/TermsMaintenanceValidation";
import { useTermsMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenance";

type TermsMaintenanceFormPageOptions = {
	existingTerm?: TermsMaintenance;
	initialValues?: TermsMaintenanceFormValues;
	mode?: TermsMaintenanceActionMode;
	onSaved?: () => void;
};

export function useTermsMaintenanceFormPage(
	options: TermsMaintenanceFormPageOptions = {},
) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { addTerm, isMutating, terms, updateTerm } = useTermsMaintenanceStore();
	const mode = options.mode ?? getActionMode(pathname);
	const existingTerm =
		options.existingTerm ?? terms.find((term) => term.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TermsMaintenanceFormValues>(() =>
		options.initialValues
			? options.initialValues
			: existingTerm
				? createTermsMaintenanceFormValues(existingTerm)
				: TermsMaintenanceInitialFormValues,
	);
	const [errors, setErrors] = useState<TermsMaintenanceFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus: TermsMaintenanceStatus =
		existingTerm?.status === "Active" ? "Inactive" : "Active";

	function updateField(
		field: keyof TermsMaintenanceFormValues,
		value: TermsMaintenanceFormValues[keyof TermsMaintenanceFormValues],
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
		const field = event.target.name as keyof TermsMaintenanceFormValues;
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
		const nextErrors = validateTermsMaintenanceForm(values);

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
				await updateTerm(updateTermsMaintenanceFromForm(existingTerm, values));
			} else if (mode === "edit") {
				toast.error("Could not find the term definition to update.");
				return;
			} else {
				await addTerm(values);
				setValues(TermsMaintenanceInitialFormValues);
				setErrors({});
			}

			options.onSaved?.();
			if (!options.onSaved) router.push(TermsMaintenanceHref);
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
		handleStatusChange: (status: TermsMaintenanceFormValues["status"]) =>
			updateField("status", status),
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

function getActionMode(pathname: string): TermsMaintenanceActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}


