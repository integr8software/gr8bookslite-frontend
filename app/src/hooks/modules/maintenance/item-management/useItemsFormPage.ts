"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import {
	ItemInitialFormValues,
	createItemFormValues,
	createItemRecord,
	updateItemRecord,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import type {
	ItemActionMode,
	ItemBundleComponent,
	ItemFormErrors,
	ItemFormValues,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { validateItemForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";
import { useItemManagementStore } from "./useItemManagement";

export function useItemsFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const {
		addItem,
		deleteItem,
		isMutating,
		items,
		updateItem,
	} = useItemManagementStore();
	const mode = getActionMode(pathname);
	const existingItem = items.find((item) => item.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemFormValues>(() =>
		existingItem ? createItemFormValues(existingItem) : ItemInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function updateField<TKey extends keyof ItemFormValues>(
		field: TKey,
		value: ItemFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
			bundleComponents:
				field === "supportsBundle" && value === false
					? []
					: current.bundleComponents,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, type, value } = event.target;

		if (type === "checkbox" && "checked" in event.target) {
			updateField(name as keyof ItemFormValues, event.target.checked as never);
			return;
		}

		updateField(name as keyof ItemFormValues, value as never);
	}

	function addBundleComponent() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			bundleComponents: [
				...current.bundleComponents,
				{
					id: `bundle-component-${Date.now()}`,
					itemCode: "",
					itemName: "",
					quantity: 1,
					uom: current.uom || "PC",
				},
			],
		}));
		setErrors((current) => ({ ...current, bundleComponents: undefined }));
	}

	function updateBundleComponent(
		componentId: string,
		field: keyof ItemBundleComponent,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			bundleComponents: current.bundleComponents.map((component) =>
				component.id === componentId
					? {
							...component,
							[field]: field === "quantity" ? Number(value) || 0 : value,
						}
					: component,
			),
		}));
	}

	function removeBundleComponent(componentId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			bundleComponents: current.bundleComponents.filter(
				(component) => component.id !== componentId,
			),
		}));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateItemForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted item fields.");
			return;
		}

		if (mode === "edit" && existingItem) {
			updateItem(updateItemRecord(existingItem, values));
			router.push(`${ItemsHref}/view/${existingItem.id}`);
			return;
		}

		if (mode === "edit") {
			toast.error("Could not find the item to update.");
			return;
		}

		addItem(createItemRecord(values));
		router.push(ItemsHref);
	}

	function handleConfirmDelete() {
		if (!existingItem) {
			toast.error("Could not find the item to delete.");
			return;
		}

		deleteItem(existingItem.id);
		setIsDeleteDialogOpen(false);
		router.push(ItemsHref);
	}

	return {
		addBundleComponent,
		errors,
		existingItem,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		removeBundleComponent,
		setIsDeleteDialogOpen,
		updateBundleComponent,
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

