import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import {
	ResponsibilityCenterInitialFormValues,
	createResponsibilityCenterFormValues,
	createResponsibilityCenterFromForm,
	updateResponsibilityCenterFromForm,
} from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import type {
	ResponsibilityCenterActionMode,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { validateResponsibilityCenterForm } from "@/app/src/validations/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterValidation";
import { useResponsibilityCenterStore } from "./useResponsibilityCenter";

export function useResponsibilityCenterAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const store = useResponsibilityCenterStore();
	const mode = getActionMode(pathname);
	const center = store.centers.find(({ id }) => id === params.recordId);
	const isReadonly = mode === "view";
	const nextStatus: ResponsibilityCenterStatus =
		center?.status === "Active" ? "Inactive" : "Active";
	const [errors, setErrors] = useState<ResponsibilityCenterFormErrors>({});
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [values, setValues] = useState(() =>
		center
			? createResponsibilityCenterFormValues(center)
			: ResponsibilityCenterInitialFormValues,
	);
	const parentOptions = useMemo(
		() => store.centers.filter(({ id }) => id !== center?.id),
		[store.centers, center?.id],
	);

	function onInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const field = event.target.name as keyof ResponsibilityCenterFormValues;
		const value =
			field === "code" ? event.target.value.toUpperCase() : event.target.value;

		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function onSubmit(event: FormEvent<HTMLFormElement>) {
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

		if (mode === "edit" && center) {
			store.updateCenter(updateResponsibilityCenterFromForm(center, values));
		} else {
			store.addCenter(createResponsibilityCenterFromForm(values));
		}

		router.push(ResponsibilityCenterHref);
	}

	function onConfirmStatusChange() {
		if (!center) {
			return;
		}

		const nextCenter = {
			...center,
			status: nextStatus,
			updatedAt: new Date().toISOString(),
		};

		store.updateCenter(nextCenter);
		setValues((current) => ({ ...current, status: nextStatus }));
		setIsStatusDialogOpen(false);
	}

	return {
		center,
		errors,
		isMutating: store.isMutating,
		isReadonly,
		isStatusDialogOpen,
		mode,
		nextStatus,
		parentOptions,
		values,
		onConfirmStatusChange,
		onInputChange,
		onSubmit,
		setIsStatusDialogOpen,
	};
}

function getActionMode(pathname: string): ResponsibilityCenterActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	return pathname.includes("/edit/") ? "edit" : "add";
}
