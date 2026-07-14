import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ResponsibilityCenterTypeDefinitions } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import {
	ResponsibilityCenterInitialFormValues,
	createResponsibilityCenterFormValues,
	createResponsibilityCenterFromForm,
	updateResponsibilityCenterFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterActionMode,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { validateResponsibilityCenterForm } from "@/app/src/validations/modules/maintenance/responsibility-center/ResponsibilityCenterValidation";

type ResponsibilityCenterFormPageOptions = {
	center?: ResponsibilityCenter;
	mode: ResponsibilityCenterActionMode;
	onSaved?: () => void;
};

export function useResponsibilityCenterFormPage({
	center,
	mode,
	onSaved,
}: ResponsibilityCenterFormPageOptions) {
	const store = useResponsibilityCenterStore();
	const isReadonly = mode === "view";
	const [errors, setErrors] = useState<ResponsibilityCenterFormErrors>({});
	const [values, setValues] = useState(() =>
		center
			? createResponsibilityCenterFormValues(center)
			: ResponsibilityCenterInitialFormValues,
	);
	const parentOptions = useMemo(
		() => store.centers.filter(({ id }) => id !== center?.id),
		[store.centers, center?.id],
	);

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const field = event.target.name as keyof ResponsibilityCenterFormValues;
		const value =
			event.target instanceof HTMLInputElement &&
			event.target.type === "checkbox"
				? event.target.checked
				: field === "code"
					? event.target.value.toUpperCase()
					: event.target.value;

		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "category" ? createTypeDefaults(String(value)) : {}),
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleFieldChange<TKey extends keyof ResponsibilityCenterFormValues>(
		field: TKey,
		value: ResponsibilityCenterFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "category" ? createTypeDefaults(String(value)) : {}),
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateResponsibilityCenterForm(
			values,
			store.centers,
			center?.id,
		);

		if (Object.keys(nextErrors).length) {
			setErrors(nextErrors);
			return;
		}

		try {
			if (mode === "edit" && center) {
				await store.updateCenter(updateResponsibilityCenterFromForm(center, values));
			} else {
				await store.addCenter(createResponsibilityCenterFromForm(values));
			}

			onSaved?.();
		} catch {
			// Mutation handlers surface the error toast.
		}
	}

	return {
		errors,
		isReadonly,
		isSubmitting: store.isMutating,
		parentOptions,
		values,
		handleFieldChange,
		handleInputChange,
		handleSubmit,
	};
}

function createTypeDefaults(category: string) {
	const definition = ResponsibilityCenterTypeDefinitions.find(
		(typeDefinition) => typeDefinition.type === category,
	);

	if (!definition) {
		return {};
	}

	return {
		financialType: definition.financialType,
	};
}
