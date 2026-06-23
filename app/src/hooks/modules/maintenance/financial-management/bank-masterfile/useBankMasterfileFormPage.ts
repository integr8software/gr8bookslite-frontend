"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
	BankMasterfileInitialFormValues,
	createBankMasterfileFormValues,
	updateBankMasterfileFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/bank-masterfile/BankMasterfileData";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/maintenance/financial-management/bank-masterfile/useBankMasterfile";
import type {
	BankMasterfile,
	BankMasterfileActionMode,
	BankMasterfileFormErrors,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTypes";
import { validateBankMasterfileForm } from "@/app/src/validations/modules/maintenance/financial-management/bank-masterfile/BankMasterfileValidation";

type BankMasterfileFormPageOptions = {
	existingBank?: BankMasterfile;
	mode?: BankMasterfileActionMode;
	onSaved?: () => void;
};

export function useBankMasterfileFormPage(
	options: BankMasterfileFormPageOptions = {},
) {
	const addBank = useBankMasterfileStore((state) => state.addBank);
	const updateBank = useBankMasterfileStore((state) => state.updateBank);
	const nextAccountCode = useBankMasterfileStore(
		(state) => state.nextAccountCode,
	);
	const isNextAccountCodeLoading = useBankMasterfileStore(
		(state) => state.isNextAccountCodeLoading,
	);
	const refreshNextAccountCode = useBankMasterfileStore(
		(state) => state.refreshNextAccountCode,
	);
	const mode = options.mode ?? "add";
	const existingBank = options.existingBank;
	const isReadonly = mode === "view";
	const [values, setValues] = useState<BankMasterfileFormValues>(() =>
		existingBank
			? createBankMasterfileFormValues(existingBank)
			: BankMasterfileInitialFormValues,
	);
	const [errors, setErrors] = useState<BankMasterfileFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	function updateField(
		field: keyof BankMasterfileFormValues,
		value: BankMasterfileFormValues[keyof BankMasterfileFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const field = event.target.name as keyof BankMasterfileFormValues;
		const value =
			event.target.type === "checkbox" &&
			event.target instanceof HTMLInputElement
				? event.target.checked
				: event.target.value;

		updateField(field, value);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateBankMasterfileForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error(
				"Please review the highlighted fields and enter valid information.",
			);
			return;
		}

		void saveBank();
	}

	async function saveBank() {
		setIsSubmitting(true);

		try {
			if (mode === "edit" && existingBank) {
				await updateBank(updateBankMasterfileFromForm(existingBank, values));
			} else if (mode === "edit") {
				toast.error("Could not find the bank account to update.");
				return;
			} else {
				await addBank(values);
				setValues(BankMasterfileInitialFormValues);
				setErrors({});
				refreshNextAccountCode();
			}

			options.onSaved?.();
		} catch {
			return;
		} finally {
			setIsSubmitting(false);
		}
	}

	return {
		errors,
		existingBank,
		handleInputChange,
		handleSubmit,
		isNextAccountCodeLoading,
		isReadonly,
		isSubmitting,
		mode,
		nextAccountCode,
		values,
	};
}