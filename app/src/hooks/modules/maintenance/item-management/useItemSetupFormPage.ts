"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	ItemSetupAllParentsValue,
	ItemSetupConfigByKind,
	ItemSetupParentKindByKind,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import {
	ItemSetupInitialFormValues,
	createItemSetupFormValues,
	createItemSetupRecord,
	updateItemSetupRecord,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import type {
	ItemActionMode,
	ItemSetupFormErrors,
	ItemSetupFormValues,
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { validateItemSetupForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";

type ItemSetupFormPageOptions = {
	existingRecord?: ItemSetupRecord;
	mode?: ItemActionMode;
	onSaved?: () => void;
};

export function useItemSetupFormPage(
	kind: ItemSetupKind,
	options: ItemSetupFormPageOptions = {},
) {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const store = useItemManagementStore();
	const config = ItemSetupConfigByKind[kind];
	const parentKind = ItemSetupParentKindByKind[kind];
	const listHref = parentKind
		? ItemSetupConfigByKind[parentKind].href
		: config.href;
	const records = store.getSetupRecords(kind);
	const parentRecords = parentKind ? store.getSetupRecords(parentKind) : [];
	const mode = options.mode ?? getActionMode(pathname);
	const existingRecord =
		options.existingRecord ?? records.find((record) => record.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemSetupFormValues>(() =>
		existingRecord
			? createItemSetupFormValues(existingRecord)
			: ItemSetupInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemSetupFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function updateField(
		field: keyof ItemSetupFormValues,
		value: ItemSetupFormValues[keyof ItemSetupFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		updateField(
			event.target.name as keyof ItemSetupFormValues,
			event.target.value,
		);
	}

	function handleParentIdsChange(parentIds: string[]) {
		updateField("parentIds", parentIds);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateItemSetupForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted setup fields.");
			return;
		}

		if (mode === "edit" && existingRecord) {
			store.updateSetupRecord(
				kind,
				updateItemSetupRecord(existingRecord, values),
			);
			options.onSaved?.();
			if (!options.onSaved) {
				router.push(
					parentKind ? listHref : `${config.href}/view/${existingRecord.id}`,
				);
			}
			return;
		}

		if (mode === "edit") {
			toast.error("Could not find the setup record to update.");
			return;
		}

		store.addSetupRecord(kind, createItemSetupRecord(values));
		options.onSaved?.();
		if (!options.onSaved) router.push(listHref);
	}

	function handleConfirmDelete() {
		if (!existingRecord) {
			toast.error("Could not find the setup record to delete.");
			return;
		}

		store.deleteSetupRecord(kind, existingRecord.id);
		setIsDeleteDialogOpen(false);
		router.push(listHref);
	}

	return {
		config,
		errors,
		existingRecord,
		handleConfirmDelete,
		handleInputChange,
		handleParentIdsChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating: store.isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		parentKind,
		parentOptions: parentKind
			? [
					{
						description: `Reusable across all ${ItemSetupConfigByKind[
							parentKind
						].title.toLowerCase()} records.`,
						label: "Default",
						name: "All",
						value: ItemSetupAllParentsValue,
					},
					...parentRecords.map((record) => ({
						description: record.description,
						label: record.code,
						name: record.name,
						value: record.id,
					})),
				]
			: [],
		setIsDeleteDialogOpen,
		values,
	};
}

function getActionMode(pathname: string): ItemActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
