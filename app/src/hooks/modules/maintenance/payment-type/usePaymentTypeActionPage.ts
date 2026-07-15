"use client";

import { useState, type FormEvent } from "react";
import {
	PaymentTypeInitialFormValues,
	createPaymentTypeFormValues,
	createPaymentTypeFromForm,
	updatePaymentTypeFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentType";
import type {
	PaymentTypeActionMode,
	PaymentTypeFormErrors,
	PaymentTypeFormValues,
	PaymentTypeRecord,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/maintenance/payment-type/PaymentTypeValidation";

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
	const paymentTypes = usePaymentTypeStore((state) => state.paymentTypes);
	const updatePaymentType = usePaymentTypeStore((state) => state.updatePaymentType);
	const isMutating = usePaymentTypeStore((state) => state.isMutating);
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

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
		values,
	};
}

function getNextPaymentTypeSortOrder(paymentTypes: PaymentTypeRecord[]) {
	return (
		Math.max(0, ...paymentTypes.map((paymentType) => paymentType.sortOrder)) + 10
	);
}
