"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import {
	TermManagementInitialFormValues,
	createTermManagementFormValues,
	createTermManagementFromForm,
	updateTermManagementFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementData";
import type {
	TermManagementActionMode,
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { validateTermManagementForm } from "@/app/src/validations/modules/maintenance/financial-management/term-management/TermManagementValidation";
import { useTermManagementStore } from "./useTermManagement";

export function useTermManagementFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const terms = useTermManagementStore((state) => state.terms);
	const addTerm = useTermManagementStore((state) => state.addTerm);
	const updateTerm = useTermManagementStore((state) => state.updateTerm);
	const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingTerm = terms.find((term) => term.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TermManagementFormValues>(() =>
		existingTerm
			? createTermManagementFormValues(existingTerm)
			: TermManagementInitialFormValues,
	);
	const [errors, setErrors] = useState<TermManagementFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
		updateField(
			event.target.name as keyof TermManagementFormValues,
			event.target.value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateTermManagementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted term fields.");
			return;
		}

		if (mode === "edit" && existingTerm) {
			updateTerm(updateTermManagementFromForm(existingTerm, values));
		} else if (mode === "edit") {
			toast.error("Could not find the term definition to update.");
			return;
		} else {
			addTerm(createTermManagementFromForm(values));
		}

		router.push(TermManagementHref);
	}

	function handleConfirmDelete() {
		if (!existingTerm) {
			toast.error("Could not find the term definition to delete.");
			return;
		}

		deleteTerm(existingTerm.id);
		setIsDeleteDialogOpen(false);
		router.push(TermManagementHref);
	}

	return {
		errors,
		existingTerm,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		setIsDeleteDialogOpen,
		values,
	};
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
