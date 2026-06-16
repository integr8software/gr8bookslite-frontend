"use client";

import { useState, type FormEvent } from "react";
import {
	PaymentTypeInitialFormValues,
	createPaymentTypeFormValues,
	createPaymentTypeFromForm,
	updatePaymentTypeFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/payment-type/usePaymentType";
import type {
	PaymentTypeActionMode,
	PaymentTypeFormErrors,
	PaymentTypeFormValues,
	PaymentTypeRecord,
} from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/maintenance/financial-management/payment-type/PaymentTypeValidation";

export function usePaymentTypeActionPage({
	existingPaymentType,
	mode,
	onSaved,
}: {
	existingPaymentType?: PaymentTypeRecord;
	mode: PaymentTypeActionMode;
	onSaved: () => void;
}) {
	const addPaymentType = usePaymentTypeStore((state) => state.addPaymentType);
	const updatePaymentType = usePaymentTypeStore((state) => state.updatePaymentType);
	const isMutating = usePaymentTypeStore((state) => state.isMutating);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<PaymentTypeFormValues>(() =>
		existingPaymentType
			? createPaymentTypeFormValues(existingPaymentType)
			: PaymentTypeInitialFormValues,
	);
	const [errors, setErrors] = useState<PaymentTypeFormErrors>({});

	function handleInputChange<TKey extends keyof PaymentTypeFormValues>(
		field: TKey,
		value: PaymentTypeFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly) {
			onSaved();
			return;
		}

		const nextErrors = validatePaymentTypeForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingPaymentType) {
			updatePaymentType(updatePaymentTypeFromForm(existingPaymentType, values));
		} else {
			addPaymentType(createPaymentTypeFromForm(values));
		}

		onSaved();
	}

	return {
		errors,
		handleInputChange,
		handleSubmit,
		isMutating,
		isReadonly,
		values,
	};
}
