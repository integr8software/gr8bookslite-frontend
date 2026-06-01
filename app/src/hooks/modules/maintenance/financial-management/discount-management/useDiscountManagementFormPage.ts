"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import {
	DiscountManagementInitialFormValues,
	createDiscountFromForm,
	createDiscountManagementFormValues,
	updateDiscountFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	DiscountManagementActionMode,
	Discount,
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import { validateDiscountManagementForm } from "@/app/src/validations/modules/maintenance/financial-management/discount-management/DiscountManagementValidation";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";

type DiscountManagementFormPageOptions = {
	existingDiscount?: Discount;
	mode?: DiscountManagementActionMode;
	onSaved?: () => void;
};

export function useDiscountManagementFormPage(
	options: DiscountManagementFormPageOptions = {},
) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { flatAccounts } = useChartsOfAccounts();
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const addDiscount = useDiscountManagementStore((state) => state.addDiscount);
	const updateDiscount = useDiscountManagementStore(
		(state) => state.updateDiscount,
	);
	const deleteDiscount = useDiscountManagementStore(
		(state) => state.deleteDiscount,
	);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const mode = options.mode ?? getActionMode(pathname);
	const existingDiscount = options.existingDiscount ?? discounts.find(
		(discount) => discount.id === params.recordId,
	);
	const accountOptions = useMemo(
		() => flatAccounts.map(({ account }) => account),
		[flatAccounts],
	);
	const [values, setValues] = useState<DiscountManagementFormValues>(() =>
		existingDiscount
			? createDiscountManagementFormValues(existingDiscount)
			: DiscountManagementInitialFormValues,
	);
	const [accountQuery, setAccountQuery] = useState(
		() => existingDiscount?.accountTitle ?? "",
	);
	const [errors, setErrors] = useState<DiscountManagementFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const isReadonly = mode === "view";

	const selectedAccount = accountOptions.find(
		(account) => account.id === values.accountId,
	);

	const matchedAccounts = useMemo(() => {
		const query = accountQuery.trim().toLowerCase();

		if (!query || selectedAccount?.accountName === accountQuery) {
			return [];
		}

		return accountOptions
			.filter(
				(account) =>
					account.accountName.toLowerCase().includes(query) ||
					account.accountNumber.toLowerCase().includes(query),
			)
			.slice(0, 8);
	}, [accountOptions, accountQuery, selectedAccount]);

	function updateField(
		field: keyof DiscountManagementFormValues,
		value: DiscountManagementFormValues[keyof DiscountManagementFormValues],
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
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		updateField(
			event.target.name as keyof DiscountManagementFormValues,
			event.target.value,
		);
	}

	function handleAccountQueryChange(event: ChangeEvent<HTMLInputElement>) {
		if (isReadonly) {
			return;
		}

		setAccountQuery(event.target.value);
		updateField("accountId", "");
	}

	function handleSelectAccount(account: ChartAccount) {
		if (isReadonly) {
			return;
		}

		setAccountQuery(account.accountName);
		updateField("accountId", account.id);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateDiscountManagementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted discount fields.");
			return;
		}

		if (mode === "edit" && existingDiscount) {
			updateDiscount(updateDiscountFromForm(existingDiscount, values, selectedAccount));
		} else if (mode === "edit") {
			toast.error("Could not find the discount to update.");
			return;
		} else {
			addDiscount(createDiscountFromForm(values, selectedAccount));
		}

		options.onSaved?.();
		if (!options.onSaved) router.push(DiscountManagementHref);
	}

	function handleConfirmDelete() {
		if (!existingDiscount) {
			toast.error("Could not find the discount to delete.");
			return;
		}

		deleteDiscount(existingDiscount.id);
		setIsDeleteDialogOpen(false);
		router.push(DiscountManagementHref);
	}

	return {
		accountQuery,
		errors,
		existingDiscount,
		handleAccountQueryChange,
		handleConfirmDelete,
		handleInputChange,
		handleSelectAccount,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating,
		isReadonly,
		matchedAccounts,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		selectedAccount,
		setIsDeleteDialogOpen,
		values,
	};
}

function getActionMode(pathname: string): DiscountManagementActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
