"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { AiAssistantPurchaseRequestPrefillStorageKey } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
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
import type { AiAssistantPurchaseRequestPrefill } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";
import { validatePurchaseRequestForm } from "@/app/src/validations/modules/purchasing/purchase-request/PurchaseRequestValidation";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { recordPurchaseRequestAuditLog } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestAuditLog";

export function usePurchaseRequestFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { addRequest, requests, updateRequest } = usePurchaseRequestStore();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const activeBranchName = useAppStore((state) => state.activeBranchName);
	const mode = getPurchaseRequestFormMode(pathname);
	const isReadonly = mode === "view";
	const existingRequest = requests.find((request) => request.id === params.recordId);
	const assistantPrefill =
		mode === "add" && searchParams.get("assistant") === "1"
			? loadAssistantPurchaseRequestPrefill()
			: null;
	const [values, setValues] = useState<PurchaseRequestFormValues>(() => {
		const initialValues = createPurchaseRequestFormValues(existingRequest);

		if (!assistantPrefill) {
			return initialValues;
		}

		return applyAssistantPurchaseRequestPrefill(initialValues, assistantPrefill);
	});
	const [errors, setErrors] = useState<PurchaseRequestFormErrors>({});
	const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");

	useEffect(() => {
		if (!assistantPrefill) {
			return;
		}

		clearAssistantPurchaseRequestPrefill();
	}, [assistantPrefill]);

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

		setValues((current) => {
			return { ...current, [field]: nextValue };
		});
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

	function updateItems(items: PurchaseRequestItem[]) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, items }));
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
				recordPurchaseRequestAuditLog("UPDATE", nextRequest, {
					branchId: activeBranchId,
					branchName: activeBranchName,
				});
				toast.success("Purchase request updated.");
			} else {
				addRequest(nextRequest);
				recordPurchaseRequestAuditLog("CREATE", nextRequest, {
					branchId: activeBranchId,
					branchName: activeBranchName,
				});
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
		updateItems,
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

function loadAssistantPurchaseRequestPrefill() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const stored = window.localStorage.getItem(
			AiAssistantPurchaseRequestPrefillStorageKey,
		);

		if (!stored) {
			return null;
		}

		return JSON.parse(stored) as AiAssistantPurchaseRequestPrefill;
	} catch {
		return null;
	}
}

function clearAssistantPurchaseRequestPrefill() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(AiAssistantPurchaseRequestPrefillStorageKey);
}

function applyAssistantPurchaseRequestPrefill(
	values: PurchaseRequestFormValues,
	prefill: AiAssistantPurchaseRequestPrefill,
): PurchaseRequestFormValues {
	const items =
		prefill.items && prefill.items.length > 0
			? prefill.items.map((item) => ({
					...emptyPurchaseRequestItem,
					id: createPurchaseRequestId("item"),
					description: item.description ?? "",
					quantity: Number(item.quantity) || 1,
					uom: item.uom || "PC",
					cost: Number(item.cost) || 0,
				}))
			: values.items;

	return {
		...values,
		purchaseType: prefill.purchaseType || values.purchaseType,
		vceName: prefill.supplierName || values.vceName,
		forDepartment: prefill.department || values.forDepartment,
		remarks: prefill.remarks || values.remarks,
		items,
	};
}
