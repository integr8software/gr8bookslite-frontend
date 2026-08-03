"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TransactionTypeHref } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import {
	TransactionTypeAvailableModuleOptions,
	TransactionTypeInitialFormValues,
	createTransactionTypeFormValues,
	createTransactionTypeFromForm,
	updateTransactionTypeFromForm,
} from "@/app/src/data/modules/item-management/inventory-transaction-type/TransactionTypeData";
import {
	findModuleChartAccount,
	getModuleChartAccounts,
} from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
	TransactionTypeActionMode,
	TransactionType,
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import { validateTransactionTypeForm } from "@/app/src/validations/modules/item-management/inventory-transaction-type/TransactionTypeValidation";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionType";

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
	const {
		addTransactionType,
		isMutating,
		transactionTypes,
		updateTransactionType,
	} = useTransactionTypeStore();
	const mode = options.mode ?? getActionMode(pathname);
	const existingTransactionType = options.existingTransactionType ?? transactionTypes.find(
		(transactionType) => transactionType.id === params.recordId,
	);
	const moduleOptions = useMemo(
		() => TransactionTypeAvailableModuleOptions,
		[],
	);
	const accountOptions = useMemo(
		() =>
			getModuleChartAccounts({
				moduleKey: "maintenance-transaction-type",
			}),
		[],
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TransactionTypeFormValues>(() =>
		existingTransactionType
			? createTransactionTypeFormValues(existingTransactionType)
			: TransactionTypeInitialFormValues,
	);
	const [errors, setErrors] = useState<TransactionTypeFormErrors>({});
	const selectedAccount = findModuleChartAccount(
		values.accountId,
		accountOptions,
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

		updateField(
			"moduleIds",
			Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : [],
		);
	}

	function validateBeforeSubmit() {
		const nextErrors = validateTransactionTypeForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error(
				"Please correct the highlighted inventory transaction type fields.",
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
		accountOptions,
		errors,
		existingTransactionType,
		handleAccountChange,
		handleInputChange,
		handleModuleChange,
		handleStatusChange: (status: TransactionTypeFormValues["status"]) =>
			updateField("status", status),
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		moduleOptions,
		needsRecord: mode === "edit" || mode === "view",
		selectedAccount,
		validateBeforeSubmit,
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
