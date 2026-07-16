import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
	ResponsibilityCenterInitialFormValues,
	createResponsibilityCenterFormValues,
	createResponsibilityCenterFromForm,
	updateResponsibilityCenterFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import { fetchResponsibilityCenterCodeSuggestion } from "@/app/src/services/modules/maintenance/responsibility-center/ResponsibilityCenterApi";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterActionMode,
	ResponsibilityCenterClassification,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
	ResponsibilityCenterTypeOption,
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
	const [hasManualCode, setHasManualCode] = useState(Boolean(center?.code));
	const parentOptions = useMemo(
		() =>
			store.centers.filter(
				({ id, status }) => id !== center?.id && status === "Active",
			),
		[store.centers, center?.id],
	);
	const typeOptions = useMemo(
		() =>
			store.types.filter(
				(type) => type.classificationId === values.classificationId,
			),
		[store.types, values.classificationId],
	);
	const nameLabel = values.classificationId && values.financialType
		? `${values.financialType} Name`
		: "Name";
	const codePlaceholder = useMemo(() => {
		const selectedType = store.types.find(({ id }) => id === values.typeId);

		if (!selectedType) {
			return "Select classification and type first";
		}

		return `${selectedType.classificationCode}-${selectedType.codePrefix}-001`;
	}, [store.types, values.typeId]);

	useEffect(() => {
		if (!values.typeId || hasManualCode || mode !== "add") {
			return;
		}

		let isMounted = true;

		fetchResponsibilityCenterCodeSuggestion(values.typeId)
			.then((code) => {
				if (!isMounted) return;
				setValues((current) =>
					current.typeId === values.typeId && !current.code
						? { ...current, code }
						: current,
				);
			})
			.catch(() => {
				// Code remains manually editable if suggestion fails.
			});

		return () => {
			isMounted = false;
		};
	}, [hasManualCode, mode, values.typeId]);

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

		if (field === "classificationId" || field === "typeId") {
			setHasManualCode(false);
		}

		if (field === "code") {
			setHasManualCode(String(value).trim().length > 0);
		}

		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "classificationId"
				? createClassificationDefaults(String(value), store.classifications)
				: {}),
			...(field === "typeId" ? createTypeDefaults(String(value), store.types) : {}),
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

		if (field === "classificationId" || field === "typeId") {
			setHasManualCode(false);
		}

		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "classificationId"
				? createClassificationDefaults(String(value), store.classifications)
				: {}),
			...(field === "typeId" ? createTypeDefaults(String(value), store.types) : {}),
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
		classifications: store.classifications,
		isReadonly,
		isSubmitting: store.isMutating,
		nameLabel,
		codePlaceholder,
		parentOptions,
		typeOptions,
		values,
		handleFieldChange,
		handleInputChange,
		handleSubmit,
	};
}

function createClassificationDefaults(
	classificationId: string,
	classifications: ResponsibilityCenterClassification[],
) {
	const classification = classifications.find(({ id }) => id === classificationId);

	return {
		typeId: "",
		category: "Department" as const,
		financialType: classification?.name ?? ("Cost Center" as const),
		parentId: "",
		code: "",
	};
}

function createTypeDefaults(
	typeId: string,
	types: ResponsibilityCenterTypeOption[],
) {
	const type = types.find((typeOption) => typeOption.id === typeId);

	if (!type) {
		return {};
	}

	return {
		financialType: type.classificationName,
		code: "",
	};
}
