"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { fetchDefaultAccountExpenseParentOptions } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountApi";
import { DefaultAccountQueryKeys } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountQueryKeys";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type {
	DefaultAccount,
	DefaultAccountActionMode,
	DefaultAccountFormErrors,
	DefaultAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { validateDefaultAccountForm } from "@/app/src/validations/modules/financial-maintenance/default-account/DefaultAccountValidation";

const EmptyDefaultAccountFormValues: DefaultAccountFormValues = {
	type: "EXPENSE",
	defaultAccountName: "",
	description: "",
	status: "Active",
	expenseParentCoaId: "",
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
	const { addDefaultAccount, isMutating, updateDefaultAccount } =
		useDefaultAccountStore();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const companyId = authProfileQuery.data?.activeCompanyId ?? null;
	const expenseParentOptionsQuery = useQuery({
		queryKey: DefaultAccountQueryKeys.expenseParentOptions(companyId),
		queryFn: fetchDefaultAccountExpenseParentOptions,
		enabled: Boolean(companyId),
		retry: false,
	});
	const [values, setValues] = useState<DefaultAccountFormValues>(
		existingDefaultAccount
			? {
					type: existingDefaultAccount.type,
					defaultAccountName: existingDefaultAccount.defaultAccountName,
					description: existingDefaultAccount.description,
					status: existingDefaultAccount.status,
					expenseParentCoaId: existingDefaultAccount.expenseParentCoaId ?? "",
				}
			: EmptyDefaultAccountFormValues,
	);
	const [errors, setErrors] = useState<DefaultAccountFormErrors>({});
	const isReadonly = mode === "view";

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;
		setValues((current) => ({
			...current,
			[name]: value,
			...(name === "type" && value !== "EXPENSE"
				? { expenseParentCoaId: "" }
				: {}),
		}));
		setErrors((current) => ({ ...current, [name]: undefined }));
	}

	function handleExpenseParentChange(value: string | string[]) {
		setValues((current) => ({
			...current,
			expenseParentCoaId: Array.isArray(value) ? (value[0] ?? "") : value,
		}));
		setErrors((current) => ({ ...current, expenseParentCoaId: undefined }));
	}

	function handleStatusChange(status: DefaultAccountFormValues["status"]) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, status }));
		setErrors((current) => ({ ...current, status: undefined }));
	}

	function validate() {
		const nextErrors = validateDefaultAccountForm(values);

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	function validateBeforeSubmit() {
		return validate();
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
		expenseParentOptions: expenseParentOptionsQuery.data ?? [],
		handleInputChange,
		handleStatusChange,
		handleExpenseParentChange,
		handleSubmit,
		isLoadingExpenseParentOptions: expenseParentOptionsQuery.isLoading,
		isReadonly,
		isSubmitting: isMutating,
		refreshExpenseParentOptions: expenseParentOptionsQuery.refetch,
		validateBeforeSubmit,
		values,
	};
}
