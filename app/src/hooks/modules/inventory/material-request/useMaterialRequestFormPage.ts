"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	createMaterialRequestFormValues,
	createMaterialRequestId,
	createMaterialRequestRecord,
	emptyMaterialRequestItem,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import { useMaterialRequestStore } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequest";
import type {
	MaterialRequestFormErrors,
	MaterialRequestFormMode,
	MaterialRequestFormValues,
	MaterialRequestItem,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { validateMaterialRequestForm } from "@/app/src/validations/modules/inventory/material-request/MaterialRequestValidation";

export function useMaterialRequestFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { addRequest, requests, updateRequest } = useMaterialRequestStore();
	const mode = getMaterialRequestFormMode(pathname);
	const isReadonly = mode === "view";
	const existingRequest = requests.find((request) => request.id === params.recordId);
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

	function addItem() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			items: [
				...current.items,
				{
					...emptyMaterialRequestItem,
					id: createMaterialRequestId("item"),
				},
			],
		}));
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

		const nextRequest = createMaterialRequestRecord(values, params.recordId);

		if (mode === "edit") {
			updateRequest(nextRequest);
			toast.success("Material request updated.");
		} else {
			addRequest(nextRequest);
			toast.success("Material request created.");
		}

		router.push(`${MaterialRequestHref}/view/${nextRequest.id}`);
	}

	return {
		addItem,
		errors,
		existingRequest,
		handleSubmit,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		nextRequest,
		previousRequest,
		previewRecord,
		removeItem,
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
