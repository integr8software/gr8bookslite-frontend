"use client";

import { useState, type FormEvent } from "react";
import {
	PaymentTypeInitialFormValues,
	createPaymentTypeFormValues,
	createPaymentTypeFromForm,
	updatePaymentTypeFromForm,
} from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import type {
	PaymentTypeActionMode,
	PaymentTypeFormErrors,
	PaymentTypeFormValues,
	PaymentTypeRecord,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/financial-maintenance/payment-type/PaymentTypeValidation";

export function usePaymentTypeActionPage({
	existingPaymentType,
	mode,
	onSaved,
}: {
	existingPaymentType?: PaymentTypeRecord;
	mode: PaymentTypeActionMode;
	onSaved: () => void;
}) {
	const { addPaymentType, isMutating, paymentTypes, updatePaymentType } =
		usePaymentTypeStore();
	const isReadonly = mode === "view";
	const [values, setValues] = useState<PaymentTypeFormValues>(() =>
		existingPaymentType
			? createPaymentTypeFormValues(existingPaymentType)
			: {
					...PaymentTypeInitialFormValues,
					sortOrder: String(getNextPaymentTypeSortOrder(paymentTypes)),
				},
	);
	const [errors, setErrors] = useState<PaymentTypeFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleInputChange<TKey extends keyof PaymentTypeFormValues>(
		field: TKey,
		value: PaymentTypeFormValues[TKey],
	) {
		if (isReadonly || isSubmitting) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function validateBeforeSubmit() {
		const nextErrors = validatePaymentTypeForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return false;
		}

		return true;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly) {
			onSaved();
			return;
		}

		if (!validateBeforeSubmit()) {
			return;
		}

		setIsSubmitting(true);

		try {
			if (mode === "edit" && existingPaymentType) {
				await updatePaymentType(
					updatePaymentTypeFromForm(existingPaymentType, values),
				);
			} else {
				await addPaymentType(createPaymentTypeFromForm(values));
			}

			onSaved();
		} catch {
			return;
		} finally {
			setIsSubmitting(false);
		}
	}

	return {
		errors,
		handleInputChange,
		handleSubmit,
		isMutating: isSubmitting || isMutating,
		isReadonly,
		isSubmitting: isSubmitting || isMutating,
		validateBeforeSubmit,
		values,
	};
}

function getNextPaymentTypeSortOrder(paymentTypes: PaymentTypeRecord[]) {
	return (
		Math.max(0, ...paymentTypes.map((paymentType) => paymentType.sortOrder)) + 10
	);
}

