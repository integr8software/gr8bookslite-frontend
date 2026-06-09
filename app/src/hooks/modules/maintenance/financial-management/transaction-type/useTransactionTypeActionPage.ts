"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import {
	TransactionTypeInitialFormValues,
	createTransactionTypeFormValues,
	createTransactionTypeFromForm,
	updateTransactionTypeFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/transaction-type/TransactionTypeData";
import { getFallbackFormSignatoryModuleOptions } from "@/app/src/data/modules/maintenance/form-signatory/FormSignatoryData";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import type {
	TransactionTypeActionMode,
	TransactionType,
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import { validateTransactionTypeForm } from "@/app/src/validations/modules/maintenance/financial-management/transaction-type/TransactionTypeValidation";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionType";

type TransactionTypeActionPageOptions = {
	existingTransactionType?: TransactionType;
	mode?: TransactionTypeActionMode;
	onSaved?: () => void;
};

export function useTransactionTypeActionPage(
	options: TransactionTypeActionPageOptions = {},
) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { accounts, flatAccounts } = useChartsOfAccounts();
	const transactionTypes = useTransactionTypeStore((state) => state.transactionTypes);
	const addTransactionType = useTransactionTypeStore(
		(state) => state.addTransactionType,
	);
	const updateTransactionType = useTransactionTypeStore(
		(state) => state.updateTransactionType,
	);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
	const mode = options.mode ?? getActionMode(pathname);
	const existingTransactionType = options.existingTransactionType ?? transactionTypes.find(
		(transactionType) => transactionType.id === params.recordId,
	);
	const accountOptions = useMemo(
		() => flatAccounts.map(({ account }) => account),
		[flatAccounts],
	);
	const moduleOptions = useMemo(
		() => getFallbackFormSignatoryModuleOptions(),
		[],
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TransactionTypeFormValues>(() =>
		existingTransactionType
			? createTransactionTypeFormValues(existingTransactionType)
			: TransactionTypeInitialFormValues,
	);
	const [errors, setErrors] = useState<TransactionTypeFormErrors>({});
	const selectedAccount = accountOptions.find(
		(account) =>
			account.id === values.accountId ||
			account.accountNumber === values.accountId,
	);

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

	function handleAccountChange(accountId: string) {
		if (isReadonly) {
			return;
		}

		updateField("accountId", accountId);
	}

	function handleModuleChange(nextValue: string | string[]) {
		if (isReadonly) {
			return;
		}

		updateField("moduleId", Array.isArray(nextValue) ? nextValue[0] ?? "" : nextValue);
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
				updateTransactionTypeFromForm(
					existingTransactionType,
					values,
					selectedAccount,
					moduleOptions,
				),
			);
		} else {
			addTransactionType(
				createTransactionTypeFromForm(values, selectedAccount, moduleOptions),
			);
		}

		options.onSaved?.();
		if (!options.onSaved) router.push(TransactionTypeHref);
	}

	return {
		accountOptions: accounts,
		errors,
		existingTransactionType,
		handleAccountChange,
		handleInputChange,
		handleModuleChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		moduleOptions,
		needsRecord: mode === "edit" || mode === "view",
		selectedAccount,
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
