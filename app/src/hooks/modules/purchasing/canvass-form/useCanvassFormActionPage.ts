"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import {
	createCanvassFormRecord,
	createCanvassFormValues,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import { useCanvassFormStore } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassForm";
import type {
	CanvassFormItem,
	CanvassFormMode,
	CanvassFormErrors,
	CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { validateCanvassForm } from "@/app/src/validations/modules/purchasing/canvass-form/CanvassFormValidation";

export function useCanvassFormActionPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { addForm, forms, updateForm } = useCanvassFormStore();
	const mode = getMode(pathname);
	const isReadonly = mode === "view";
	const existingForm = forms.find((form) => form.id === params.recordId);
	const [values, setValues] = useState<CanvassFormValues>(() =>
		createCanvassFormValues(existingForm),
	);
	const [errors, setErrors] = useState<CanvassFormErrors>({});
	const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");
	const previewRecord = useMemo(
		() => createCanvassFormRecord(values, params.recordId ?? "preview"),
		[params.recordId, values],
	);

	function updateField<TKey extends keyof CanvassFormValues>(
		field: TKey,
		value: CanvassFormValues[TKey],
	) {
		if (isReadonly) return;
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateItems(items: CanvassFormItem[]) {
		if (isReadonly) return;
		setValues((current) => ({ ...current, items }));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function handleSubmit() {
		if (isReadonly) return;
		const nextErrors = validateCanvassForm(values);
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please complete the required canvass form fields.");
			return;
		}
		try {
			const nextForm = createCanvassFormRecord(values, params.recordId);
			if (mode === "edit") {
				updateForm(nextForm);
				toast.success("Canvass form updated.");
			} else {
				addForm(nextForm);
				toast.success("Canvass form created.");
			}
			router.push(`${CanvassFormHref}/view/${nextForm.id}`);
		} catch {
			toast.error("Could not save the canvass form. Please try again.");
		}
	}

	return {
		errors,
		existingForm,
		handleSubmit,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		previewRecord,
		recordId: params.recordId,
		setShowPreview,
		showPreview,
		updateField,
		updateItems,
		values,
	};
}

function getMode(pathname: string): CanvassFormMode {
	if (pathname.includes("/edit/")) return "edit";
	if (pathname.includes("/view/")) return "view";
	return "add";
}
