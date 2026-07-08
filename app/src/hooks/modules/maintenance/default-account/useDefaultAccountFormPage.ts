"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/maintenance/default-account/useDefaultAccount";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type {
	DefaultAccount,
	DefaultAccountActionMode,
	DefaultAccountFormErrors,
	DefaultAccountFormValues,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import { validateDefaultAccountForm } from "@/app/src/validations/modules/maintenance/default-account/DefaultAccountValidation";

const EmptyDefaultAccountFormValues: DefaultAccountFormValues = {
	type: "EXPENSE",
	defaultAccountName: "",
	description: "",
	status: "Active",
};

export function useDefaultAccountFormPage({
	existingDefaultAccount,
	mode,
	onSaved,
}: {
	existingDefaultAccount?: DefaultAccount;
	mode: DefaultAccountActionMode;
	onSaved: () => void;
}) {
	const addDefaultAccount = useDefaultAccountStore(
		(state) => state.addDefaultAccount,
	);
	const updateDefaultAccount = useDefaultAccountStore(
		(state) => state.updateDefaultAccount,
	);
	const isMutating = useDefaultAccountStore((state) => state.isMutating);
	const [values, setValues] = useState<DefaultAccountFormValues>(
		existingDefaultAccount
			? {
					type: existingDefaultAccount.type,
					defaultAccountName: existingDefaultAccount.defaultAccountName,
					description: existingDefaultAccount.description,
					status: existingDefaultAccount.status,
				}
			: EmptyDefaultAccountFormValues,
	);
	const [errors, setErrors] = useState<DefaultAccountFormErrors>({});
	const isReadonly = mode === "view";

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;
		setValues((current) => ({ ...current, [name]: value }));
		setErrors((current) => ({ ...current, [name]: undefined }));
	}

	function validate() {
		const nextErrors = validateDefaultAccountForm(values);

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly || !validate()) {
			return;
		}

		try {
			if (mode === "edit" && existingDefaultAccount) {
				await updateDefaultAccount({ ...existingDefaultAccount, ...values });
			} else {
				await addDefaultAccount(values);
			}
		} catch (error) {
			if (
				error instanceof ApiClientError &&
				error.message.toLowerCase().includes("default account name")
			) {
				setErrors((current) => ({
					...current,
					defaultAccountName: error.message,
				}));
				return;
			}

			setErrors((current) => ({
				...current,
				defaultAccountName:
					error instanceof Error
						? error.message
						: "Could not save default account.",
			}));
			return;
		}

		onSaved();
	}

	return {
		errors,
		handleInputChange,
		handleSubmit,
		isReadonly,
		isSubmitting: isMutating,
		values,
	};
}
