"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import { createWarehouseItemsHref } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import {
	ItemInitialFormValues,
	createItemFormValues,
	createItemRecord,
	updateItemRecord,
} from "@/app/src/data/modules/maintenance/items/ItemManagementData";
import type {
	ItemActionMode,
	ItemFormErrors,
	ItemFormValues,
	ItemSetupKind,
	ItemSetupRecord,
	ItemStatus,
	ItemAttributeAssignment,
	ItemPriceListAssignment,
	ItemSupplierAssignment,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { validateItemForm } from "@/app/src/validations/modules/maintenance/items/ItemManagementValidation";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/items/useItemManagement";
import { fetchUnitsOfMeasurement } from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementApi";
import { UnitOfMeasurementQueryKeys } from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementQueryKeys";

const NumberItemFormFields = new Set<keyof ItemFormValues>([
	"costPrice",
	"maximumStock",
	"minimumStock",
	"reorderLevel",
	"sellingPrice",
]);

export function useItemsFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const store = useItemManagementStore();
	const responsibilityCenters = useResponsibilityCenterStore(
		(state) => state.centers,
	);
	const { warehouses } = useWarehousesStore();
	const { addItem, isMutating, items, updateItem } = store;
	const categoryRecords = store.getSetupRecords("category");
	const setupRecords = useMemo<Record<ItemSetupKind, ItemSetupRecord[]>>(
		() => ({
			category: categoryRecords,
			subcategory: [],
			type: [],
			subtype: [],
		}),
		[categoryRecords],
	);
	const mode = getActionMode(pathname);
	const existingItem = items.find((item) => item.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ItemFormValues>(() =>
		existingItem ? createInitialItemFormValues(existingItem) : ItemInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemFormErrors>({});
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const unitsOfMeasurementQuery = useQuery({
		queryKey: UnitOfMeasurementQueryKeys.list(),
		queryFn: fetchUnitsOfMeasurement,
	});
	const nextStatus: ItemStatus =
		existingItem?.status === "Active" ? "Inactive" : "Active";
	const uomOptions = useMemo(
		() =>
			(unitsOfMeasurementQuery.data?.records ?? [])
				.filter(
					(unit) =>
						unit.status === "Active" ||
						(values.uom.trim().length > 0 && unit.symbol === values.uom),
				)
				.map((unit) => ({
					description: `${unit.symbol} | ${unit.quantityMode}`,
					name: unit.name,
					value: unit.symbol,
				})),
		[unitsOfMeasurementQuery.data?.records, values.uom],
	);

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

			return nextValues;
		});
		setErrors((current) => ({
			...current,
			[field]: undefined,
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
					supplierItemCode: "",
					leadTime: "",
					lastCost: 0,
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
			suppliers: moveDefaultSupplierFirst(
				current.suppliers.map((supplier) => {
					if (supplier.id !== supplierId) {
						return field === "isDefault" && value === true
							? { ...supplier, isDefault: false }
							: supplier;
					}

					if (field === "isDefault") {
						return { ...supplier, isDefault: Boolean(value) };
					}

					return {
						...supplier,
						[field]:
							field === "lastCost" ? Number(value) || 0 : String(value),
					};
				}),
			),
		}));
		setErrors((current) => ({ ...current, suppliers: undefined }));
	}

	function removeSupplier(supplierId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			suppliers: moveDefaultSupplierFirst(
				ensureDefaultSupplier(
					current.suppliers.filter((supplier) => supplier.id !== supplierId),
				),
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
			suppliers: reorderSuppliers(
				current.suppliers,
				supplierId,
				overSupplierId,
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

	function addAttributeAssignment() {
		if (isReadonly) {
			return;
		}

		if (values.attributeAssignments.length >= 5) {
			toast.error("You can add up to 5 item attributes.");
			return;
		}

		if (
			values.attributeAssignments.some(
				(assignment) => !assignment.attributeId,
			)
		) {
			toast.error("Select an attribute before adding another row.");
			return;
		}

		setValues((current) => ({
			...current,
			attributeAssignments: [
				...current.attributeAssignments,
				createEmptyAttributeAssignment(),
			],
		}));
	}

	function updateAttributeAssignment(
		assignmentId: string,
		field: keyof ItemAttributeAssignment,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			attributeAssignments: current.attributeAssignments.map((assignment) => {
				if (assignment.id !== assignmentId) {
					return assignment;
				}

				if (field === "attributeId") {
					if (
						value &&
						current.attributeAssignments.some(
							(currentAssignment) =>
								currentAssignment.id !== assignmentId &&
								currentAssignment.attributeId === value,
						)
					) {
						return assignment;
					}

					const attribute = store.itemAttributes.find(
						(currentAttribute) => currentAttribute.id === value,
					);

					return {
						...assignment,
						attributeId: value,
						value: attribute?.values[0] ?? "",
					};
				}

				return { ...assignment, [field]: value };
			}),
		}));
	}

	function removeAttributeAssignment(assignmentId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			attributeAssignments: current.attributeAssignments.filter(
				(assignment) => assignment.id !== assignmentId,
			),
		}));
	}

	function reorderAttributeAssignment(
		assignmentId: string,
		overAssignmentId: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			attributeAssignments: reorderItemAttributeAssignments(
				current.attributeAssignments,
				assignmentId,
				overAssignmentId,
			),
		}));
	}

	function updatePriceListPrice(priceListId: string, price: number) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const existingPrice = current.priceListPrices.find(
				(priceListPrice) => priceListPrice.priceListId === priceListId,
			);
			const nextPrice: ItemPriceListAssignment = {
				id: existingPrice?.id ?? `item-price-list-${Date.now()}-${priceListId}`,
				priceListId,
				price,
			};

			return {
				...current,
				priceListPrices: existingPrice
					? current.priceListPrices.map((priceListPrice) =>
							priceListPrice.priceListId === priceListId
								? nextPrice
								: priceListPrice,
						)
					: [...current.priceListPrices, nextPrice],
			};
		});
	}

	function validateBeforeSubmit() {
		const nextErrors = validateItemForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted item fields.");
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validateBeforeSubmit()) {
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
		addAttributeAssignment,
		addTag,
		addSupplier,
		attributeRecords: store.itemAttributes,
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
		priceLists: store.priceLists,
		removeAttributeAssignment,
		removeTag,
		removeSupplier,
		reorderAttributeAssignment,
		responsibilityCenterOptions:
			createResponsibilityCenterOptions(responsibilityCenters),
		setIsStatusDialogOpen,
		statusOptions: createSimpleOptions(["Active", "Inactive"]),
		supplierOptions: createSimpleOptions(
			store.itemSuppliers
				.filter((supplier) => supplier.status === "Active")
				.map((supplier) => supplier.name),
		),
		uomOptions,
		updateField,
		updateAttributeAssignment,
		updatePriceListPrice,
		updateSupplier,
		validateBeforeSubmit,
		values,
		warehouseItemsHref: createSelectedWarehouseItemsHref(
			warehouses,
			values.defaultWarehouse,
		),
		warehouseOptions: createWarehouseOptions(warehouses),
		reorderSupplier,
	};
}

function createEmptyAttributeAssignment(): ItemAttributeAssignment {
	return {
		id: `item-attribute-${Date.now()}`,
		attributeId: "",
		value: "",
	};
}

function reorderItemAttributeAssignments(
	assignments: ItemAttributeAssignment[],
	recordId: string,
	overRecordId: string,
) {
	const currentIndex = assignments.findIndex((record) => record.id === recordId);
	const nextIndex = assignments.findIndex((record) => record.id === overRecordId);

	if (
		currentIndex === -1 ||
		nextIndex === -1 ||
		currentIndex === nextIndex ||
		nextIndex < 0 ||
		nextIndex >= assignments.length
	) {
		return assignments;
	}

	const nextRecords = [...assignments];
	const [record] = nextRecords.splice(currentIndex, 1);

	nextRecords.splice(nextIndex, 0, record);

	return nextRecords;
}

function reorderSuppliers(
	suppliers: ItemSupplierAssignment[],
	recordId: string,
	overRecordId: string,
) {
	const currentIndex = suppliers.findIndex((record) => record.id === recordId);
	const nextIndex = suppliers.findIndex((record) => record.id === overRecordId);
	const movedSupplier = suppliers[currentIndex];

	if (
		currentIndex === -1 ||
		nextIndex === -1 ||
		currentIndex === nextIndex ||
		nextIndex < 0 ||
		nextIndex >= suppliers.length ||
		movedSupplier?.isDefault
	) {
		return suppliers;
	}

	const nextRecords = [...suppliers];
	const [record] = nextRecords.splice(currentIndex, 1);
	const defaultIndex = nextRecords.findIndex((supplier) => supplier.isDefault);
	const protectedTopIndex = defaultIndex === -1 ? 0 : defaultIndex + 1;
	const insertionIndex = Math.max(nextIndex, protectedTopIndex);

	nextRecords.splice(insertionIndex, 0, record);

	return moveDefaultSupplierFirst(nextRecords);
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

function createInitialItemFormValues(item: Parameters<typeof createItemFormValues>[0]) {
	const values = createItemFormValues(item);

	return {
		...values,
		suppliers: moveDefaultSupplierFirst(values.suppliers),
	};
}

function moveDefaultSupplierFirst(suppliers: ItemSupplierAssignment[]) {
	const defaultSupplier = suppliers.find((supplier) => supplier.isDefault);

	if (!defaultSupplier) {
		return suppliers;
	}

	return [
		defaultSupplier,
		...suppliers.filter((supplier) => supplier.id !== defaultSupplier.id),
	];
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
		name: record.name,
		value: record.name,
	};
}

function createSimpleOptions(options: string[]) {
	return options.map((option) => ({
		name: option,
		value: option,
	}));
}

function createResponsibilityCenterOptions(
	centers: ResponsibilityCenter[],
): ItemSetupOption[] {
	return centers
		.filter(
			(center) =>
				center.status === "Active" && center.financialType === "Cost Center",
		)
		.map((center) => ({
			description: `${center.code} | ${center.category}`,
			name: center.name,
			value: center.name,
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
