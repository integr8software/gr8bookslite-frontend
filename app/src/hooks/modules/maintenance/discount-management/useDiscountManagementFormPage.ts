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
	getDiscountAccountCode,
	getDiscountAccountGroupPath,
	getDiscountAccountTitle,
	updateDiscountFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import type {
	DiscountManagementActionMode,
	Discount,
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import { validateDiscountManagementForm } from "@/app/src/validations/modules/maintenance/discount-management/DiscountManagementValidation";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagement";

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
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const addDiscount = useDiscountManagementStore((state) => state.addDiscount);
	const updateDiscount = useDiscountManagementStore(
		(state) => state.updateDiscount,
	);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const mode = options.mode ?? getActionMode(pathname);
	const existingDiscount = options.existingDiscount ?? discounts.find(
		(discount) => discount.id === params.recordId,
	);
	const [values, setValues] = useState<DiscountManagementFormValues>(() =>
		existingDiscount
			? createDiscountManagementFormValues(existingDiscount)
			: DiscountManagementInitialFormValues,
	);
	const [errors, setErrors] = useState<DiscountManagementFormErrors>({});
	const isReadonly = mode === "view";
	const generatedAccount = useMemo(
		() => ({
			accountCode: getDiscountAccountCode(values.type, values.name),
			accountGroupPath: getDiscountAccountGroupPath(values.type),
			accountTitle: getDiscountAccountTitle(values.type, values.name),
		}),
		[values.name, values.type],
	);

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
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		updateField(
			event.target.name as keyof DiscountManagementFormValues,
			event.target.value,
		);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateDiscountManagementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted discount fields.");
			return;
		}

		if (mode === "edit" && existingDiscount) {
			await updateDiscount(
				updateDiscountFromForm(existingDiscount, values),
			);
		} else if (mode === "edit") {
			toast.error("Could not find the discount to update.");
			return;
		} else {
			await addDiscount(createDiscountFromForm(values));
		}

		options.onSaved?.();
		if (!options.onSaved) router.push(DiscountManagementHref);
	}

	return {
		errors,
		existingDiscount,
		generatedAccount,
		handleInputChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
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
