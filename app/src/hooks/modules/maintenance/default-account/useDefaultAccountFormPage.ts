"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/maintenance/default-account/useDefaultAccount";
import type {
	DefaultAccount,
	DefaultAccountActionMode,
	DefaultAccountFormErrors,
	DefaultAccountFormValues,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";

const EmptyDefaultAccountFormValues: DefaultAccountFormValues = {
	type: "EXPENSE",
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
					description: existingDefaultAccount.description,
					status: existingDefaultAccount.status,
				}
			: EmptyDefaultAccountFormValues,
	);
	const [errors, setErrors] = useState<DefaultAccountFormErrors>({});
	const isReadonly = mode === "view";

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const { name, value } = event.target;
		setValues((current) => ({ ...current, [name]: value }));
	}

	function validate() {
		const nextErrors: DefaultAccountFormErrors = {};

		if (!values.description.trim()) {
			nextErrors.description = "Description is required.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly || !validate()) {
			return;
		}

		if (mode === "edit" && existingDefaultAccount) {
			await updateDefaultAccount({ ...existingDefaultAccount, ...values });
		} else {
			await addDefaultAccount(values);
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
