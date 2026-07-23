"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { AiAssistantSalesQuotationPrefillStorageKey } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
	createSalesQuotationFormValues,
	createSalesQuotationId,
	createSalesQuotationRecord,
	emptySalesQuotationItem,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
	SalesQuotationFormErrors,
	SalesQuotationFormValues,
	SalesQuotationItem,
	SalesQuotationFormMode,
} from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import type { AiAssistantSalesQuotationPrefill } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";
import { validateSalesQuotationForm } from "@/app/src/validations/modules/sales/sales-quotation/SalesQuotationValidation";
import { useSalesQuotationStore } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotation";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	createModuleDraftKey,
	useModuleDraft,
} from "@/app/src/hooks/shared/module/useModuleDraft";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { recordSalesQuotationAuditLog } from "@/app/src/services/modules/sales/sales-quotation/SalesQuotationAuditLog";

export function useSalesQuotationFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { addRequest, requests, updateRequest } = useSalesQuotationStore();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const activeBranchName = useAppStore((state) => state.activeBranchName);
	const mode = getSalesQuotationFormMode(pathname);
	const isReadonly = mode === "view";
	const existingRequest = requests.find((request) => request.id === params.recordId);
	const assistantPrefill =
		mode === "add" && searchParams.get("assistant") === "1"
			? loadAssistantSalesQuotationPrefill()
			: null;
	const [values, setValues] = useState<SalesQuotationFormValues>(() => {
		const initialValues = createSalesQuotationFormValues(existingRequest);

		if (!assistantPrefill) {
			return initialValues;
		}

		return applyAssistantSalesQuotationPrefill(initialValues, assistantPrefill);
	});
	const [errors, setErrors] = useState<SalesQuotationFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);
	const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");

	useEffect(() => {
		if (!assistantPrefill) {
			return;
		}

		clearAssistantSalesQuotationPrefill();
	}, [assistantPrefill]);

	const previewRecord = useMemo(
		() => createSalesQuotationRecord(values, params.recordId ?? "preview"),
		[params.recordId, values],
	);
	const draft = useModuleDraft({
		enabled: !isReadonly,
		key: createModuleDraftKey({
			mode,
			moduleId: "sales:sales-quotation",
			recordId: params.recordId,
		}),
		setValues,
		values,
	});

	function updateField<TKey extends keyof SalesQuotationFormValues>(
		field: TKey,
		value: SalesQuotationFormValues[TKey],
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
		field: keyof SalesQuotationItem,
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

	function updateItems(items: SalesQuotationItem[]) {
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
				{ ...emptySalesQuotationItem, id: createSalesQuotationId("item") },
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
		if (isReadonly || isSubmittingRef.current) {
			return;
		}

		const releaseSubmitLock = acquireModuleActionLock(
			`sales:sales-quotation:submit:${mode}:${params.recordId ?? values.transNo}`,
		);

		if (!releaseSubmitLock) {
			return;
		}

		isSubmittingRef.current = true;
		setIsSubmitting(true);
		const nextErrors = validateSalesQuotationForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please complete the required sales quotation fields.");
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			releaseSubmitLock();
			return;
		}

		try {
			const nextRequest = createSalesQuotationRecord(values, params.recordId);

			if (mode === "edit") {
				updateRequest(nextRequest);
				recordSalesQuotationAuditLog("UPDATE", nextRequest, {
					branchId: activeBranchId,
					branchName: activeBranchName,
				});
				toast.success("Sales quotation updated.");
			} else {
				addRequest(nextRequest);
				recordSalesQuotationAuditLog("CREATE", nextRequest, {
					branchId: activeBranchId,
					branchName: activeBranchName,
				});
				toast.success("Sales quotation created.");
			}

			draft.clearDraft();
			router.push(`${SalesQuotationHref}/view/${nextRequest.id}`);
		} catch {
			toast.error("Could not save the sales quotation. Please try again.");
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			releaseSubmitLock();
		}
	}

	return {
		addItem,
		errors,
		existingRequest,
		handleSubmit,
		isSubmitting,
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

function getSalesQuotationFormMode(pathname: string): SalesQuotationFormMode {
	if (pathname.includes("/edit/")) {
		return "edit";
	}

	if (pathname.includes("/view/")) {
		return "view";
	}

	return "add";
}

function loadAssistantSalesQuotationPrefill() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const stored = window.localStorage.getItem(
			AiAssistantSalesQuotationPrefillStorageKey,
		);

		if (!stored) {
			return null;
		}

		return JSON.parse(stored) as AiAssistantSalesQuotationPrefill;
	} catch {
		return null;
	}
}

function clearAssistantSalesQuotationPrefill() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(AiAssistantSalesQuotationPrefillStorageKey);
}

function applyAssistantSalesQuotationPrefill(
	values: SalesQuotationFormValues,
	prefill: AiAssistantSalesQuotationPrefill,
): SalesQuotationFormValues {
	const items =
		prefill.items && prefill.items.length > 0
			? prefill.items.map((item) => ({
					...emptySalesQuotationItem,
					id: createSalesQuotationId("item"),
					itemName: item.description ?? "",
					quantity: Number(item.quantity) || 1,
					uom: item.uom || "PC",
					itemPrice: Number(item.itemPrice) || 0,
				}))
			: values.items;

	return {
		...values,
		partyName: prefill.partyName || values.partyName,
		forDepartment: prefill.department || values.forDepartment,
		remarks: prefill.remarks || values.remarks,
		items,
	};
}
