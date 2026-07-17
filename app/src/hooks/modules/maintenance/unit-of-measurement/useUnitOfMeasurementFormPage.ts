"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { createUnitOfMeasurementFormValues } from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import type {
	UnitOfMeasurementDrawerMode,
	UnitOfMeasurementFormErrors,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementRecord,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { validateUnitOfMeasurementForm } from "@/app/src/validations/modules/maintenance/unit-of-measurement/UnitOfMeasurementValidation";

type UnitOfMeasurementFormPageOptions = {
	existingRecord?: UnitOfMeasurementRecord;
	initialValues?: UnitOfMeasurementFormValues;
	mode: UnitOfMeasurementDrawerMode;
	onSave: (values: UnitOfMeasurementFormValues) => Promise<void>;
	onSaved?: () => void;
};

export function useUnitOfMeasurementFormPage({
	existingRecord,
	initialValues,
	mode,
	onSave,
	onSaved,
}: UnitOfMeasurementFormPageOptions) {
	const isReadonly = mode === "view";
	const [values, setValues] = useState<UnitOfMeasurementFormValues>(() =>
		initialValues ?? createUnitOfMeasurementFormValues(existingRecord),
	);
	const [errors, setErrors] = useState<UnitOfMeasurementFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		if (isReadonly) {
			return;
		}

		const field = event.target.name as keyof UnitOfMeasurementFormValues;
		const value =
			field === "symbol" ? event.target.value.toUpperCase() : event.target.value;

		setValues((current) => ({
			...current,
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function validateBeforeSubmit() {
		const nextErrors = validateUnitOfMeasurementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error(
				"Please review the highlighted fields and enter valid information.",
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

		void saveRecord();
	}

	async function saveRecord() {
		setIsSubmitting(true);

		try {
			await onSave({
				...values,
				name: values.name.trim(),
				symbol: values.symbol.trim().toUpperCase(),
			});
			onSaved?.();
		} finally {
			setIsSubmitting(false);
		}
	}

	return {
		errors,
		handleInputChange,
		handleSubmit,
		isReadonly,
		isSubmitting,
		validateBeforeSubmit,
		values,
	};
}
