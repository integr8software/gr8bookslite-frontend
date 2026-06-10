"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
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
	ItemSetupKind,
	ItemSetupRecord,
	ItemStatus,
	ItemSupplierAssignment,
	ItemUomConversion,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { validateItemForm } from "@/app/src/validations/modules/maintenance/item-management/ItemManagementValidation";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";

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
	const { addItem, isMutating, items, updateItem } = store;
	const categoryRecords = store.getSetupRecords("category");
	const subcategoryRecords = store.getSetupRecords("subcategory");
	const typeRecords = store.getSetupRecords("type");
	const subtypeRecords = store.getSetupRecords("subtype");
	const setupRecords = useMemo<Record<ItemSetupKind, ItemSetupRecord[]>>(
		() => ({
			category: categoryRecords,
			subcategory: subcategoryRecords,
			type: typeRecords,
			subtype: subtypeRecords,
		}),
		[categoryRecords, subcategoryRecords, subtypeRecords, typeRecords],
	);
	const typeParentIdsByTypeId = useMemo(
		() => inferTypeParentIdsByTypeId(setupRecords, items),
		[items, setupRecords],
	);
	const mode = getActionMode(pathname);
	const existingItem = items.find((item) => item.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemFormValues>(() =>
		existingItem ? createItemFormValues(existingItem) : ItemInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemFormErrors>({});
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus: ItemStatus =
		existingItem?.status === "Active" ? "Inactive" : "Active";

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
				nextValues.type = "";
				nextValues.subtype = "";
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
			...(field === "category"
				? {
						subcategory: undefined,
						subtype: undefined,
						type: undefined,
					}
				: {}),
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

	function handleConfirmStatusChange() {
		if (!existingItem) {
			toast.error("Could not find the item to update.");
			return;
		}

		updateItem({
			...existingItem,
			status: nextStatus,
		});
		setValues((current) => ({ ...current, status: nextStatus }));
		setIsStatusDialogOpen(false);
	}

	return {
		addTag,
		addBundleComponent,
		addSupplier,
		addUomConversion,
		categoryOptions: createCategorySetupOptions(setupRecords.category),
		errors,
		existingItem,
		handleConfirmStatusChange,
		handleInputChange,
		handleSubmit,
		isMutating,
		isReadonly,
		isStatusDialogOpen,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		nextStatus,
		removeBundleComponent,
		removeTag,
		removeSupplier,
		removeUomConversion,
		setIsStatusDialogOpen,
		statusOptions: createSimpleOptions(["Active", "Inactive"]),
		subcategoryOptions: createChildSetupOptions({
			parentValue: values.category,
			parentRecords: setupRecords.category,
			records: setupRecords.subcategory,
		}),
		supplierOptions: createSimpleOptions([...ItemSupplierOptions]),
		typeOptions: createChildSetupOptions({
			parentIdsByRecordId: typeParentIdsByTypeId,
			parentValue: values.category,
			parentRecords: setupRecords.category,
			records: setupRecords.type,
		}),
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
			parentRecords: setupRecords.type,
			records: setupRecords.subtype,
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

type ItemSetupOption = {
	children?: ItemSetupOption[];
	description?: string;
	label?: string;
	name: string;
	value: string;
};

function createCategorySetupOptions(
	records: ItemSetupRecord[],
): ItemSetupOption[] {
	const activeRecords = records.filter((record) => record.status === "Active");
	const activeRecordIds = new Set(activeRecords.map((record) => record.id));
	const recordsByParentId = new Map<string, ItemSetupRecord[]>();

	activeRecords.forEach((record) => {
		(record.parentIds ?? []).forEach((parentId) => {
			const childRecords = recordsByParentId.get(parentId) ?? [];

			childRecords.push(record);
			recordsByParentId.set(parentId, childRecords);
		});
	});

	return activeRecords
		.filter((record) => {
			const parentIds = record.parentIds ?? [];

			return (
				parentIds.length === 0 ||
				parentIds.every((parentId) => !activeRecordIds.has(parentId))
			);
		})
		.map((record) =>
			createCategorySetupOption(record, recordsByParentId, new Set()),
		);
}

function createCategorySetupOption(
	record: ItemSetupRecord,
	recordsByParentId: Map<string, ItemSetupRecord[]>,
	visitedIds: Set<string>,
): ItemSetupOption {
	const nextVisitedIds = new Set(visitedIds);

	nextVisitedIds.add(record.id);

	const children = (recordsByParentId.get(record.id) ?? [])
		.filter((childRecord) => !nextVisitedIds.has(childRecord.id))
		.map((childRecord) =>
			createCategorySetupOption(childRecord, recordsByParentId, nextVisitedIds),
		);

	return createSetupOption(record, {
		children,
		description:
			children.length > 0
				? `${record.description} Includes child categories.`
				: record.description,
	});
}

function createChildSetupOptions({
	parentIdsByRecordId,
	parentRecords,
	parentValue,
	records,
}: {
	parentIdsByRecordId?: Map<string, string[]>;
	parentRecords: ItemSetupRecord[];
	parentValue: string;
	records: ItemSetupRecord[];
}): ItemSetupOption[] {
	const parentRecord = parentRecords.find((record) => record.name === parentValue);

	return records
		.filter((record) => {
			if (record.status !== "Active") {
				return false;
			}

			if (!parentValue || !parentRecord) {
				return true;
			}

			const parentIds = parentIdsByRecordId?.get(record.id) ?? record.parentIds ?? [];

			return parentIds.length === 0 || parentIds.includes(parentRecord.id);
		})
		.map((record) =>
			createSetupOption(record, {
				description: createSetupOptionDescription(
					record,
					parentRecords,
					parentIdsByRecordId,
				),
			}),
		);
}

function createSetupOption(
	record: ItemSetupRecord,
	options: {
		children?: ItemSetupOption[];
		description?: string;
	} = {},
): ItemSetupOption {
	return {
		children: options.children?.length ? options.children : undefined,
		description: options.description ?? record.description,
		label: record.code,
		name: record.name,
		value: record.name,
	};
}

function createSetupOptionDescription(
	record: ItemSetupRecord,
	parentRecords: ItemSetupRecord[],
	parentIdsByRecordId?: Map<string, string[]>,
) {
	const parentIds = parentIdsByRecordId?.get(record.id) ?? record.parentIds ?? [];

	if (parentIds.length === 0) {
		return `${record.description} Reusable across all parent records.`;
	}

	const parentNames = parentIds
		.map((parentId) => parentRecords.find((record) => record.id === parentId)?.name)
		.filter((name): name is string => Boolean(name));

	if (parentNames.length === 0) {
		return record.description;
	}

	return `${record.description} Parent: ${parentNames.join(", ")}.`;
}

function inferTypeParentIdsByTypeId(
	setupRecords: Record<ItemSetupKind, ItemSetupRecord[]>,
	items: ItemRecord[],
) {
	const categoryIdByName = new Map(
		setupRecords.category.map((record) => [record.name, record.id]),
	);
	const inferred = new Map<string, Set<string>>();

	setupRecords.type.forEach((typeRecord) => {
		inferred.set(typeRecord.id, new Set(typeRecord.parentIds ?? []));
	});

	items.forEach((item) => {
		const typeRecord = setupRecords.type.find(
			(record) => record.name === item.type,
		);
		const categoryId = categoryIdByName.get(item.category);

		if (!typeRecord || !categoryId) {
			return;
		}

		const parentIds = inferred.get(typeRecord.id) ?? new Set<string>();

		parentIds.add(categoryId);
		inferred.set(typeRecord.id, parentIds);
	});

	return new Map(
		Array.from(inferred.entries()).map(([typeId, parentIds]) => [
			typeId,
			Array.from(parentIds),
		]),
	);
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
