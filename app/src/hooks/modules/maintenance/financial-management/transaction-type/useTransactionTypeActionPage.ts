"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import {
	TransactionTypeInitialFormValues,
	createTransactionTypeFormValues,
	createTransactionTypeFromForm,
	updateTransactionTypeFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/transaction-type/TransactionTypeData";
import type {
	TransactionTypeActionMode,
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import { validateTransactionTypeForm } from "@/app/src/validations/modules/maintenance/financial-management/transaction-type/TransactionTypeValidation";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionType";

export function useTransactionTypeActionPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const transactionTypes = useTransactionTypeStore((state) => state.transactionTypes);
	const addTransactionType = useTransactionTypeStore(
		(state) => state.addTransactionType,
	);
	const updateTransactionType = useTransactionTypeStore(
		(state) => state.updateTransactionType,
	);
	const deleteTransactionType = useTransactionTypeStore(
		(state) => state.deleteTransactionType,
	);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingTransactionType = transactionTypes.find(
		(transactionType) => transactionType.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TransactionTypeFormValues>(() =>
		existingTransactionType
			? createTransactionTypeFormValues(existingTransactionType)
			: TransactionTypeInitialFormValues,
	);
	const [errors, setErrors] = useState<TransactionTypeFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function updateField(
		field: keyof TransactionTypeFormValues,
		value: TransactionTypeFormValues[keyof TransactionTypeFormValues],
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
			event.target.name as keyof TransactionTypeFormValues,
			event.target.value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateTransactionTypeForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please correct the highlighted transaction type fields.");
			return;
		}

		if (mode === "edit" && existingTransactionType) {
			updateTransactionType(
				updateTransactionTypeFromForm(existingTransactionType, values),
			);
		} else {
			addTransactionType(createTransactionTypeFromForm(values));
		}

		router.push(TransactionTypeHref);
	}

	function handleConfirmDelete() {
		if (!existingTransactionType) {
			return;
		}

		deleteTransactionType(existingTransactionType.id);
		setIsDeleteDialogOpen(false);
		router.push(TransactionTypeHref);
	}

	return {
		errors,
		existingTransactionType,
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

function getActionMode(pathname: string): TransactionTypeActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
