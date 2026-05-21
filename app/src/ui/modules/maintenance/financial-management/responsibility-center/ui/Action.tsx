"use client";

import {
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import {
	ResponsibilityCenterInitialFormValues,
	createResponsibilityCenterFormValues,
	createResponsibilityCenterFromForm,
	updateResponsibilityCenterFromForm,
	validateResponsibilityCenterForm,
} from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenter";
import { AppConfirmDialog } from "@/app/src/ui/shared/AppConfirmDialog";
import type {
	ResponsibilityCenterActionMode,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterActionHeader } from "./ResponsibilityCenterActionHeader";
import { ResponsibilityCenterDetailsFields } from "./ResponsibilityCenterDetailsFields";
import { ResponsibilityCenterNotFound } from "./ResponsibilityCenterNotFound";

export function ResponsibilityCenterAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const addCenter = useResponsibilityCenterStore((state) => state.addCenter);
	const updateCenter = useResponsibilityCenterStore(
		(state) => state.updateCenter,
	);
	const deleteCenter = useResponsibilityCenterStore(
		(state) => state.deleteCenter,
	);
	const isMutating = useResponsibilityCenterStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingCenter = centers.find(
		(center) => center.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState(() =>
		existingCenter
			? createResponsibilityCenterFormValues(existingCenter)
			: ResponsibilityCenterInitialFormValues,
	);
	const [errors, setErrors] = useState<ResponsibilityCenterFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const parentOptions = useMemo(
		() => centers.filter((center) => center.id !== existingCenter?.id),
		[centers, existingCenter?.id],
	);

	function updateField(
		field: keyof ResponsibilityCenterFormValues,
		value: ResponsibilityCenterFormValues[keyof ResponsibilityCenterFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: field === "code" ? value.toUpperCase() : value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		updateField(
			event.target.name as keyof ResponsibilityCenterFormValues,
			event.target.value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateResponsibilityCenterForm(
			values,
			centers,
			existingCenter?.id,
		);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingCenter) {
			updateCenter(updateResponsibilityCenterFromForm(existingCenter, values));
		} else {
			addCenter(createResponsibilityCenterFromForm(values));
		}

		router.push(ResponsibilityCenterHref);
	}

	function handleConfirmDelete() {
		if (!existingCenter) {
			return;
		}

		deleteCenter(existingCenter.id);
		setIsDeleteDialogOpen(false);
		router.push(ResponsibilityCenterHref);
	}

	if ((mode === "edit" || mode === "view") && !existingCenter) {
		return <ResponsibilityCenterNotFound />;
	}

	return (
		<>
			<form onSubmit={handleSubmit} className="grid gap-5">
				<ResponsibilityCenterActionHeader
					center={existingCenter}
					isReadonly={isReadonly}
					mode={mode}
					onDeleteCenter={() => setIsDeleteDialogOpen(true)}
				/>
				<ResponsibilityCenterDetailsFields
					errors={errors}
					isReadonly={isReadonly}
					parentOptions={parentOptions}
					values={values}
					onInputChange={handleInputChange}
				/>
			</form>
			<AppConfirmDialog
				isOpen={isDeleteDialogOpen}
				isPending={isMutating}
				title="Delete responsibility center?"
				description={`This will remove ${existingCenter?.name ?? "the selected center"} and clear it from any child center hierarchy.`}
				confirmLabel="Delete Center"
				tone="danger"
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}

function getActionMode(pathname: string): ResponsibilityCenterActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
