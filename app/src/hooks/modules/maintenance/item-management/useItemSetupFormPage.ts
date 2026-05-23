"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
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
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { validateItemSetupForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";
import { useItemManagementStore } from "./useItemManagement";

export function useItemSetupFormPage(kind: ItemSetupKind) {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const store = useItemManagementStore();
	const config = ItemSetupConfigByKind[kind];
	const records = store.getSetupRecords(kind);
	const mode = getActionMode(pathname);
	const existingRecord = records.find((record) => record.id === params.recordId);
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
			router.push(`${config.href}/view/${existingRecord.id}`);
			return;
		}

		if (mode === "edit") {
			toast.error("Could not find the setup record to update.");
			return;
		}

		store.addSetupRecord(kind, createItemSetupRecord(values));
		router.push(config.href);
	}

	function handleConfirmDelete() {
		if (!existingRecord) {
			toast.error("Could not find the setup record to delete.");
			return;
		}

		store.deleteSetupRecord(kind, existingRecord.id);
		setIsDeleteDialogOpen(false);
		router.push(config.href);
	}

	return {
		config,
		errors,
		existingRecord,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating: store.isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
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

