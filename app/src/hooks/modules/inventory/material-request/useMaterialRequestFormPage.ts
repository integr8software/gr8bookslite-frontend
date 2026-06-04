"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
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

export function useMaterialRequestFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const params = useParams<{ recordId?: string }>();
	const { addRequest, requests, updateRequest } = useMaterialRequestStore();
	const mode = getMaterialRequestFormMode(pathname);
	const isReadonly = mode === "view";
	const existingRequest = requests.find((request) => request.id === params.recordId);
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
		setErrors((current) => ({ ...current, [field]: undefined }));
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
			items: [
				...current.items,
				...Array.from({ length: count }, createEmptyItem),
			],
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function insertItem(itemId: string, position: "above" | "below") {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const rowIndex = current.items.findIndex((item) => item.id === itemId);
			const insertIndex =
				rowIndex === -1
					? current.items.length
					: rowIndex + (position === "below" ? 1 : 0);
			const nextItems = [...current.items];

			nextItems.splice(insertIndex, 0, createEmptyItem());

			return {
				...current,
				items: nextItems,
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function duplicateItem(itemId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const rowIndex = current.items.findIndex((item) => item.id === itemId);
			const sourceItem = current.items[rowIndex];

			if (!sourceItem) {
				return current;
			}

			const nextItems = [...current.items];

			nextItems.splice(rowIndex + 1, 0, {
				...sourceItem,
				id: createMaterialRequestId("item"),
			});

			return {
				...current,
				items: nextItems,
			};
		});
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function moveItem(fromItemId: string, toItemId: string) {
		if (isReadonly || fromItemId === toItemId) {
			return;
		}

		setValues((current) => {
			const fromIndex = current.items.findIndex((item) => item.id === fromItemId);
			const toIndex = current.items.findIndex((item) => item.id === toItemId);

			if (fromIndex === -1 || toIndex === -1) {
				return current;
			}

			const nextItems = [...current.items];
			const [movedItem] = nextItems.splice(fromIndex, 1);

			nextItems.splice(toIndex, 0, movedItem);

			return {
				...current,
				items: nextItems,
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
			items:
				current.items.length > 1
					? current.items.filter((item) => item.id !== itemId)
					: current.items,
		}));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function clearItems(mode: MaterialRequestItemClearMode) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextItems =
				mode === "all"
					? []
					: current.items.filter((item) => !shouldClearItem(item, mode));

			return {
				...current,
				items: nextItems.length > 0 ? nextItems : [createEmptyItem()],
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

	function handleCopyFrom() {
		if (isReadonly) {
			return;
		}

		const sourceRequest = sortedRequests.find(
			(request) => request.id !== existingRequest?.id,
		);

		if (!sourceRequest) {
			toast.error("No material request is available to copy from.");
			return;
		}

		setValues((current) => ({
			...current,
			fromWarehouse: sourceRequest.fromWarehouse,
			toWarehouse: sourceRequest.toWarehouse,
			department: sourceRequest.department,
			vceCode: sourceRequest.vceCode,
			vceName: sourceRequest.vceName,
			projectRef: sourceRequest.projectRef,
			projectName: sourceRequest.projectName,
			referenceModule: sourceRequest.referenceModule,
			referenceNo: sourceRequest.referenceNo,
			purpose: sourceRequest.purpose,
			requiresApproval: sourceRequest.requiresApproval,
			remarks: sourceRequest.remarks,
			items: sourceRequest.items.map((item) => ({
				...item,
				id: createMaterialRequestId("item"),
			})),
		}));
		setErrors({});
		toast.success(`Copied from ${sourceRequest.requestNo}.`);
	}

	function updateRequestStatus(status: MaterialRequestStatus) {
		if (!existingRequest) {
			return;
		}

		if (status === values.status) {
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
		clearItems,
		duplicateItem,
		errors,
		existingRequest,
		handleCopyFrom,
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
		Number(item.requestQuantity) > 0 &&
		Number(item.stockQuantity) >= 0
	);
}
