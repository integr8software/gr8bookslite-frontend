"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	ItemSupplierOptions,
	ItemUomDictionary,
	ItemsHref,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { createWarehouseItemsHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import {
	ItemInitialFormValues,
	createItemFormValues,
	createItemRecord,
	updateItemRecord,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import type {
	ItemActionMode,
	ItemBundleComponent,
	ItemBundleComponentItemOption,
	ItemFormErrors,
	ItemFormValues,
	ItemRecord,
	ItemSetupRecord,
	ItemSupplierAssignment,
	ItemUomConversion,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { validateItemForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";
import { useWarehouseManagementStore } from "../warehouse-management/useWarehouseManagement";
import { useItemManagementStore } from "./useItemManagement";

const NumberItemFormFields = new Set<keyof ItemFormValues>([
	"costPrice",
	"sellingPrice",
]);

export function useItemsFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const store = useItemManagementStore();
	const { warehouses } = useWarehouseManagementStore();
	const { addItem, deleteItem, isMutating, items, updateItem } = store;
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

		setValues((current) => {
			const nextValues: ItemFormValues = {
				...current,
				[field]: value,
			};

			if (field === "category") {
				nextValues.subcategory = "";
			}

			if (field === "type") {
				nextValues.subtype = "";
			}

			if (field === "supportsBundle" && value === true) {
				nextValues.uomConversions = [];
			}

			if (field === "supportsBundle" && value === false) {
				nextValues.bundleComponents = [];
			}

			return nextValues;
		});
		setErrors((current) => ({
			...current,
			[field]: undefined,
			...(field === "category" ? { subcategory: undefined } : {}),
			...(field === "type" ? { subtype: undefined } : {}),
		}));
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

		if (NumberItemFormFields.has(name as keyof ItemFormValues)) {
			updateField(name as keyof ItemFormValues, Number(value) as never);
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
					itemId: "",
					itemCode: "",
					itemName: "",
					quantity: 1,
					uom: "",
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
					? updateBundleComponentValue(component, field, value, items)
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

	function reorderBundleComponent(componentId: string, overComponentId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			bundleComponents: reorderRecordById(
				current.bundleComponents,
				componentId,
				overComponentId,
			),
		}));
	}

	function addSupplier() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			suppliers: [
				...current.suppliers,
				{
					id: `item-supplier-${Date.now()}`,
					supplier: "",
					isDefault: current.suppliers.length === 0,
				},
			],
		}));
		setErrors((current) => ({ ...current, suppliers: undefined }));
	}

	function updateSupplier(
		supplierId: string,
		field: keyof ItemSupplierAssignment,
		value: string | boolean,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			suppliers: current.suppliers.map((supplier) => {
				if (supplier.id !== supplierId) {
					return field === "isDefault" && value === true
						? { ...supplier, isDefault: false }
						: supplier;
				}

				if (field === "isDefault") {
					return { ...supplier, isDefault: Boolean(value) };
				}

				return { ...supplier, [field]: String(value) };
			}),
		}));
		setErrors((current) => ({ ...current, suppliers: undefined }));
	}

	function removeSupplier(supplierId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			suppliers: ensureDefaultSupplier(
				current.suppliers.filter((supplier) => supplier.id !== supplierId),
			),
		}));
		setErrors((current) => ({ ...current, suppliers: undefined }));
	}

	function reorderSupplier(supplierId: string, overSupplierId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			suppliers: reorderRecordById(
				current.suppliers,
				supplierId,
				overSupplierId,
			),
		}));
	}

	function addUomConversion() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			uomConversions: [
				...current.uomConversions,
				{
					id: `uom-conversion-${Date.now()}`,
					fromUom: "BOX",
					quantity: 1,
					toUom: current.uom || "PCS",
				},
			],
		}));
	}

	function updateUomConversion(
		conversionId: string,
		field: keyof ItemUomConversion,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			uomConversions: current.uomConversions.map((conversion) =>
				conversion.id === conversionId
					? {
							...conversion,
							[field]: field === "quantity" ? Number(value) || 0 : value,
						}
					: conversion,
			),
		}));
	}

	function removeUomConversion(conversionId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			uomConversions: current.uomConversions.filter(
				(conversion) => conversion.id !== conversionId,
			),
		}));
	}

	function addTag(tag: string) {
		const nextTag = tag.trim();

		if (!nextTag || isReadonly) {
			return;
		}

		setValues((current) => {
			if (
				current.tags.some(
					(currentTag) => currentTag.toLowerCase() === nextTag.toLowerCase(),
				)
			) {
				return current;
			}

			return { ...current, tags: [...current.tags, nextTag] };
		});
	}

	function removeTag(tag: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			tags: current.tags.filter((currentTag) => currentTag !== tag),
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
		addTag,
		addBundleComponent,
		addSupplier,
		addUomConversion,
		categoryOptions: createSetupOptions(store.getSetupRecords("category")),
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
		removeTag,
		removeSupplier,
		removeUomConversion,
		setIsDeleteDialogOpen,
		statusOptions: createSimpleOptions(["Active", "Inactive"]),
		subcategoryOptions: createChildSetupOptions({
			parentValue: values.category,
			parentRecords: store.getSetupRecords("category"),
			records: store.getSetupRecords("subcategory"),
		}),
		supplierOptions: createSimpleOptions([...ItemSupplierOptions]),
		typeOptions: createSetupOptions(store.getSetupRecords("type")),
		uomOptions: ItemUomDictionary.map((uom) => ({
			description: `${uom.description} | ${uom.quantityKind}`,
			label: uom.code,
			name: `${uom.description} (${uom.code})`,
			value: uom.code,
		})),
		updateBundleComponent,
		updateField,
		updateSupplier,
		updateUomConversion,
		values,
		warehouseItemsHref: createSelectedWarehouseItemsHref(
			warehouses,
			values.defaultWarehouse,
		),
		warehouseOptions: createWarehouseOptions(warehouses),
		bundleComponentItemOptions: createBundleComponentItemOptions(
			items,
			existingItem?.id,
		),
		reorderBundleComponent,
		reorderSupplier,
		subtypeOptions: createChildSetupOptions({
			parentValue: values.type,
			parentRecords: store.getSetupRecords("type"),
			records: store.getSetupRecords("subtype"),
		}),
	};
}

function updateBundleComponentValue(
	component: ItemBundleComponent,
	field: keyof ItemBundleComponent,
	value: string,
	items: ItemRecord[],
): ItemBundleComponent {
	if (field === "quantity") {
		return {
			...component,
			quantity: Number(value) || 0,
		};
	}

	if (field !== "itemId") {
		return {
			...component,
			[field]: value,
		};
	}

	const selectedItem = items.find((item) => item.id === value);

	if (!selectedItem) {
		return {
			...component,
			itemId: "",
			itemCode: "",
			itemName: "",
			uom: "",
		};
	}

	return {
		...component,
		itemId: selectedItem.id,
		itemCode: selectedItem.code,
		itemName: selectedItem.name,
		uom: selectedItem.uom,
	};
}

function createBundleComponentItemOptions(
	items: ItemRecord[],
	currentItemId?: string,
): ItemBundleComponentItemOption[] {
	return items
		.filter((item) => item.status === "Active" && item.id !== currentItemId)
		.map((item) => ({
			id: item.id,
			itemCode: item.code,
			itemName: item.name,
			itemUom: item.uom,
			uomOptions: createItemUomOptions(item),
		}));
}

function createItemUomOptions(item: ItemRecord) {
	const uomOptions = new Set([item.uom]);

	item.uomConversions.forEach((conversion) => {
		uomOptions.add(conversion.fromUom);
		uomOptions.add(conversion.toUom);
	});

	return Array.from(uomOptions).filter(Boolean);
}

function reorderRecordById<TRecord extends { id: string }>(
	records: TRecord[],
	recordId: string,
	overRecordId: string,
) {
	const currentIndex = records.findIndex((record) => record.id === recordId);
	const nextIndex = records.findIndex((record) => record.id === overRecordId);

	if (
		currentIndex === -1 ||
		nextIndex === -1 ||
		currentIndex === nextIndex ||
		nextIndex < 0 ||
		nextIndex >= records.length
	) {
		return records;
	}

	const nextRecords = [...records];
	const [record] = nextRecords.splice(currentIndex, 1);

	nextRecords.splice(nextIndex, 0, record);

	return nextRecords;
}

function ensureDefaultSupplier(suppliers: ItemSupplierAssignment[]) {
	if (
		suppliers.length === 0 ||
		suppliers.some((supplier) => supplier.isDefault)
	) {
		return suppliers;
	}

	return suppliers.map((supplier, index) => ({
		...supplier,
		isDefault: index === 0,
	}));
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

function createSetupOptions(records: ItemSetupRecord[]) {
	return records
		.filter((record) => record.status === "Active")
		.map((record) => ({
			description: record.description,
			label: record.code,
			name: record.name,
			value: record.name,
		}));
}

function createChildSetupOptions({
	parentRecords,
	parentValue,
	records,
}: {
	parentRecords: ItemSetupRecord[];
	parentValue: string;
	records: ItemSetupRecord[];
}) {
	const parentRecord = parentRecords.find((record) => record.name === parentValue);

	return records
		.filter((record) => {
			if (record.status !== "Active") {
				return false;
			}

			const parentIds = record.parentIds ?? [];

			return parentIds.length === 0 || parentIds.includes(parentRecord?.id ?? "");
		})
		.map((record) => ({
			description:
				record.parentIds?.length === 0
					? `${record.description} Reusable across all parent records.`
					: record.description,
			label: record.code,
			name: record.name,
			value: record.name,
		}));
}

function createSimpleOptions(options: string[]) {
	return options.map((option) => ({
		name: option,
		value: option,
	}));
}

function createWarehouseOptions(warehouses: WarehouseRecord[]) {
	return warehouses
		.filter((warehouse) => warehouse.status === "Active")
		.map((warehouse) => ({
			description: createWarehouseDescription(warehouse),
			name: warehouse.name,
			value: warehouse.name,
		}));
}

function createSelectedWarehouseItemsHref(
	warehouses: WarehouseRecord[],
	warehouseName: string,
) {
	const warehouse = warehouses.find(
		(currentWarehouse) => currentWarehouse.name === warehouseName,
	);

	return warehouse ? createWarehouseItemsHref(warehouse.id) : undefined;
}

function createWarehouseDescription(warehouse: WarehouseRecord) {
	if (warehouse.availability === "All Branches") {
		return "Available to all branches";
	}

	if (warehouse.availability === "Selected Branches") {
		return warehouse.availableBranches.length > 0
			? `Available to ${warehouse.availableBranches.join(", ")}`
			: "No branch access selected";
	}

	return `Available to ${warehouse.branchName}`;
}
