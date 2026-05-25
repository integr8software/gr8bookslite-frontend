"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import {
	createPurchaseRequestFormValues,
	createPurchaseRequestId,
	createPurchaseRequestRecord,
	emptyPurchaseRequestItem,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
	PurchaseRequestItem,
	PurchaseRequestFormMode,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { validatePurchaseRequestForm } from "@/app/src/validations/modules/purchasing/purchase-request/PurchaseRequestValidation";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";

export function usePurchaseRequestFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { addRequest, requests, updateRequest } = usePurchaseRequestStore();
	const mode = getPurchaseRequestFormMode(pathname);
	const isReadonly = mode === "view";
	const existingRequest = requests.find((request) => request.id === params.recordId);
	const [values, setValues] = useState<PurchaseRequestFormValues>(() =>
		createPurchaseRequestFormValues(existingRequest),
	);
	const [errors, setErrors] = useState<PurchaseRequestFormErrors>({});
	const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");

	const previewRecord = useMemo(
		() => createPurchaseRequestRecord(values, params.recordId ?? "preview"),
		[params.recordId, values],
	);

	function updateField<TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		const nextValue =
			field === "vatRegTin" && typeof value === "string"
				? FormatTinNumber(value)
				: value;

		setValues((current) => ({ ...current, [field]: nextValue }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateItem(
		itemId: string,
		field: keyof PurchaseRequestItem,
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
				{ ...emptyPurchaseRequestItem, id: createPurchaseRequestId("item") },
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

		const nextErrors = validatePurchaseRequestForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please complete the required purchase request fields.");
			return;
		}

		try {
			const nextRequest = createPurchaseRequestRecord(values, params.recordId);

			if (mode === "edit") {
				updateRequest(nextRequest);
				toast.success("Purchase request updated.");
			} else {
				addRequest(nextRequest);
				toast.success("Purchase request created.");
			}

			router.push(`${PurchaseRequestHref}/view/${nextRequest.id}`);
		} catch {
			toast.error("Could not save the purchase request. Please try again.");
		}
	}

	return {
		addItem,
		errors,
		existingRequest,
		handleSubmit,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		previewRecord,
		removeItem,
		setShowPreview,
		showPreview,
		updateField,
		updateItem,
		values,
	};
}

function getPurchaseRequestFormMode(pathname: string): PurchaseRequestFormMode {
	if (pathname.includes("/edit/")) {
		return "edit";
	}

	if (pathname.includes("/view/")) {
		return "view";
	}

	return "add";
}
