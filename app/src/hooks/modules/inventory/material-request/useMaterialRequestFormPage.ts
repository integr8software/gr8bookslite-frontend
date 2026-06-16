"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
	MaterialRequestHref,
	canApproveMaterialRequestStatus,
	canCancelMaterialRequestStatus,
	canDisapproveMaterialRequestStatus,
	canEditMaterialRequestStatus,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	createMaterialRequestFormValues,
	createMaterialRequestId,
	createMaterialRequestRecord,
	createMaterialRequestStatusHistoryEntry,
	emptyMaterialRequestItem,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import { useMaterialRequestStore } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequest";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormMode,
	MaterialRequestFormValues,
	MaterialRequestItem,
	MaterialRequestItemClearMode,
	MaterialRequestStatus,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { validateMaterialRequestForm } from "@/app/src/validations/modules/inventory/material-request/MaterialRequestValidation";
import {
	appendModuleDataEntryRows,
	clearModuleDataEntryRows,
	duplicateModuleDataEntryRow,
	insertModuleDataEntryRow,
	moveModuleDataEntryRow,
	pasteModuleDataEntryRows,
	removeModuleDataEntryRow,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRowUtils";

export function useMaterialRequestFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const params = useParams<{ recordId?: string }>();
	const { addRequest, requests, updateRequest } = useMaterialRequestStore();
	const mode = getMaterialRequestFormMode(pathname);
	const existingRequest = requests.find((request) => request.id === params.recordId);
	const isReadonly =
		mode === "view" ||
		(mode === "edit"
			? existingRequest
				? !canEditMaterialRequestStatus(existingRequest.status)
				: false
			: false);
	const backHref =
		mode === "edit" && searchParams.get("from") === "view" && params.recordId
			? `${MaterialRequestHref}/view/${params.recordId}`
			: MaterialRequestHref;
	const sortedRequests = useMemo(
		() =>
			[...requests].sort((first, second) =>
				second.documentDate.localeCompare(first.documentDate),
			),
		[requests],
	);
	const currentRequestIndex = existingRequest
		? sortedRequests.findIndex((request) => request.id === existingRequest.id)
		: -1;
	const previousRequest =
		currentRequestIndex > 0 ? sortedRequests[currentRequestIndex - 1] : null;
	const nextRequest =
		currentRequestIndex >= 0 && currentRequestIndex < sortedRequests.length - 1
			? sortedRequests[currentRequestIndex + 1]
			: null;
	const [values, setValues] = useState<MaterialRequestFormValues>(() =>
		createMaterialRequestFormValues(existingRequest),
	);
	const [errors, setErrors] = useState<MaterialRequestFormErrors>({});

	const previewRecord = useMemo(
		() => createMaterialRequestRecord(values, params.recordId ?? "preview"),
		[params.recordId, values],
	);

	function updateField<TKey extends keyof MaterialRequestFormValues>(
		field: TKey,
		value: MaterialRequestFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) =>
			createMaterialRequestErrorsAfterFieldUpdate({
				currentErrors: current,
				currentValues: values,
				field,
				value,
			}),
		);
	}

	function updateItem(
		itemId: string,
		field: keyof MaterialRequestItem,
		value: string | number,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			items: current.items.map((item) =>
				item.id === itemId ? { ...item, [field]: value } : item,
			),
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function createEmptyItem() {
		return {
			...emptyMaterialRequestItem,
			id: createMaterialRequestId("item"),
		};
	}

	function addItems(count = 1) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			items: appendModuleDataEntryRows(current.items, createEmptyItem, count),
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function insertItem(itemId: string, position: "above" | "below") {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			return {
				...current,
				items: insertModuleDataEntryRow(
					current.items,
					itemId,
					position,
					createEmptyItem,
				),
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function duplicateItem(itemId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			return {
				...current,
				items: duplicateModuleDataEntryRow(current.items, itemId, () =>
					createMaterialRequestId("item"),
				),
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function moveItem(fromItemId: string, toItemId: string) {
		if (isReadonly || fromItemId === toItemId) {
			return;
		}

		setValues((current) => {
			return {
				...current,
				items: moveModuleDataEntryRow(current.items, fromItemId, toItemId),
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function removeItem(itemId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			items: removeModuleDataEntryRow(current.items, itemId, {
				keepAtLeastOne: true,
			}),
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function clearItem(itemId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			items: current.items.map((item) =>
				item.id === itemId
					? {
							...emptyMaterialRequestItem,
							id: item.id,
						}
					: item,
			),
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function clearItems(mode: MaterialRequestItemClearMode) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			return {
				...current,
				items: clearModuleDataEntryRows(
					current.items,
					mode,
					shouldClearItem,
					createEmptyItem,
				),
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function pasteItemCells(
		startItemId: string,
		updates: Partial<MaterialRequestItem>[],
	) {
		if (isReadonly || updates.length === 0) {
			return;
		}

		setValues((current) => {
			return {
				...current,
				items: pasteModuleDataEntryRows(
					current.items,
					startItemId,
					updates,
					createEmptyItem,
				),
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function importItems(importedItems: MaterialRequestItem[]) {
		if (isReadonly || importedItems.length === 0) {
			return;
		}

		setValues((current) => {
			const populatedItems = current.items.filter(materialRequestItemHasData);
			const nextImportedItems = importedItems.map((item) => ({
				...item,
				id: createMaterialRequestId("item"),
			}));

			return {
				...current,
				items:
					populatedItems.length > 0
						? [...populatedItems, ...nextImportedItems]
						: nextImportedItems,
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
		toast.success(`${importedItems.length} material request items imported.`);
	}

	function handleSubmit() {
		if (isReadonly) {
			return;
		}

		const nextErrors = validateMaterialRequestForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please complete the required material request fields.");
			return;
		}

		const nextRequest = createMaterialRequestRecord(
			values,
			params.recordId,
			existingRequest?.history,
		);

		if (mode === "edit") {
			updateRequest(nextRequest);
			toast.success("Material request updated.");
		} else {
			addRequest(nextRequest);
			toast.success("Material request created.");
		}

		router.push(`${MaterialRequestHref}/view/${nextRequest.id}`);
	}

	function updateRequestStatus(status: MaterialRequestStatus) {
		if (!existingRequest) {
			return;
		}

		if (status === values.status) {
			return;
		}

		if (!canUpdateMaterialRequestStatus(values.status, status)) {
			return;
		}

		const nextRequest = createMaterialRequestRecord(
			{
				...values,
				status,
			},
			existingRequest.id,
			[
				...existingRequest.history,
				createMaterialRequestStatusHistoryEntry(
					status,
					existingRequest.requestNo,
				),
			],
		);

		updateRequest(nextRequest);
		setValues(createMaterialRequestFormValues(nextRequest));
		toast.success(`Material request ${status.toLowerCase()}.`);
	}

	return {
		addItems,
		backHref,
		clearItem,
		clearItems,
		duplicateItem,
		errors,
		existingRequest,
		handleSubmit,
		importItems,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		nextRequest,
		previousRequest,
		previewRecord,
		insertItem,
		moveItem,
		pasteItemCells,
		removeItem,
		updateRequestStatus,
		updateField,
		updateItem,
		values,
	};
}

function getMaterialRequestFormMode(pathname: string): MaterialRequestFormMode {
	if (pathname.includes("/edit/")) {
		return "edit";
	}

	if (pathname.includes("/view/")) {
		return "view";
	}

	return "add";
}

function canUpdateMaterialRequestStatus(
	currentStatus: MaterialRequestStatus,
	nextStatus: MaterialRequestStatus,
) {
	if (nextStatus === "Approved") {
		return canApproveMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Disapproved") {
		return canDisapproveMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Cancelled") {
		return canCancelMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Pending") {
		return (
			currentStatus === "Approved" ||
			currentStatus === "Disapproved" ||
			currentStatus === "Cancelled"
		);
	}

	if (
		(nextStatus === "Active" || nextStatus === "Draft") &&
		(currentStatus === "Approved" || currentStatus === "Disapproved")
	) {
		return true;
	}

	if (nextStatus === "Draft" || nextStatus === "Active") {
		return currentStatus === "Cancelled";
	}

	return false;
}

function createMaterialRequestErrorsAfterFieldUpdate<TKey extends keyof MaterialRequestFormValues>({
	currentErrors,
	currentValues,
	field,
	value,
}: {
	currentErrors: MaterialRequestFormErrors;
	currentValues: MaterialRequestFormValues;
	field: TKey;
	value: MaterialRequestFormValues[TKey];
}) {
	const nextErrors = {
		...currentErrors,
		[field]: undefined,
	};

	if (field !== "fromWarehouse" && field !== "toWarehouse") {
		return nextErrors;
	}

	const nextFromWarehouse =
		field === "fromWarehouse" ? String(value) : currentValues.fromWarehouse;
	const nextToWarehouse =
		field === "toWarehouse" ? String(value) : currentValues.toWarehouse;

	nextErrors.toWarehouse =
		nextFromWarehouse &&
		nextToWarehouse &&
		nextFromWarehouse === nextToWarehouse
			? "Select a different To Warehouse."
			: undefined;

	return nextErrors;
}

function shouldClearItem(
	item: MaterialRequestItem,
	mode: Exclude<MaterialRequestItemClearMode, "all">,
) {
	if (mode === "with-data") {
		return materialRequestItemHasData(item);
	}

	if (mode === "incomplete") {
		return (
			materialRequestItemHasData(item) && !materialRequestItemIsComplete(item)
		);
	}

	return !materialRequestItemHasData(item);
}

function materialRequestItemHasData(item: MaterialRequestItem) {
	return (
		item.barcode.trim() !== "" ||
		item.category.trim() !== "" ||
		item.itemCode.trim() !== "" ||
		item.itemName.trim() !== "" ||
		item.lotNo.trim() !== "" ||
		item.remarks.trim() !== "" ||
		item.requestQuantity !== emptyMaterialRequestItem.requestQuantity ||
		item.stockQuantity !== emptyMaterialRequestItem.stockQuantity ||
		item.uom !== emptyMaterialRequestItem.uom
	);
}

function materialRequestItemIsComplete(item: MaterialRequestItem) {
	return (
		item.category.trim() !== "" &&
		item.itemCode.trim() !== "" &&
		item.itemName.trim() !== "" &&
		item.uom.trim() !== "" &&
		hasMaterialRequestNumberValue(item.requestQuantity) &&
		Number(item.requestQuantity) > 0 &&
		hasMaterialRequestNumberValue(item.stockQuantity) &&
		Number(item.stockQuantity) >= 0
	);
}

function hasMaterialRequestNumberValue(value: MaterialRequestItem["requestQuantity"]) {
	return value !== "";
}
