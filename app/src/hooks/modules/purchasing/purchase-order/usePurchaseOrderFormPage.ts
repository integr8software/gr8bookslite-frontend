"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { PurchaseOrderHref } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
	createPurchaseOrderFormValues,
	createPurchaseOrderRecord,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { usePurchaseOrderStore } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrder";
import {
	createModuleDraftKey,
	useModuleDraft,
} from "@/app/src/hooks/shared/module/useModuleDraft";
import type {
	PurchaseOrderFormErrors,
	PurchaseOrderFormMode,
	PurchaseOrderFormValues,
	PurchaseOrderItem,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { validatePurchaseOrderForm } from "@/app/src/validations/modules/purchasing/purchase-order/PurchaseOrderValidation";

export function usePurchaseOrderFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { addOrder, orders, updateOrder } = usePurchaseOrderStore();
	const mode = getPurchaseOrderFormMode(pathname);
	const isReadonly = mode === "view";
	const existingOrder = orders.find((order) => order.id === params.recordId);
	const [values, setValues] = useState<PurchaseOrderFormValues>(() =>
		createPurchaseOrderFormValues(existingOrder),
	);
	const [errors, setErrors] = useState<PurchaseOrderFormErrors>({});
	const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "1");
	const previewRecord = useMemo(
		() => createPurchaseOrderRecord(values, params.recordId ?? "preview"),
		[params.recordId, values],
	);
	const draft = useModuleDraft({
		enabled: !isReadonly,
		key: createModuleDraftKey({
			mode,
			moduleId: "purchasing:purchase-order",
			recordId: params.recordId,
		}),
		setValues,
		values,
	});

	function updateField<TKey extends keyof PurchaseOrderFormValues>(
		field: TKey,
		value: PurchaseOrderFormValues[TKey],
	) {
		if (isReadonly) return;

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateItems(items: PurchaseOrderItem[]) {
		if (isReadonly) return;

		setValues((current) => ({ ...current, items }));
		setErrors((current) => ({ ...current, items: undefined }));
	}

	function handleSubmit() {
		if (isReadonly) return;

		const nextErrors = validatePurchaseOrderForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please complete the required purchase order fields.");
			return;
		}

		try {
			const nextOrder = createPurchaseOrderRecord(values, params.recordId);

			if (mode === "edit") {
				updateOrder(nextOrder);
				toast.success("Purchase order updated.");
			} else {
				addOrder(nextOrder);
				toast.success("Purchase order created.");
			}

			draft.clearDraft();
			router.push(`${PurchaseOrderHref}/view/${nextOrder.id}`);
		} catch {
			toast.error("Could not save the purchase order. Please try again.");
		}
	}

	return {
		errors,
		existingOrder,
		handleSubmit,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		previewRecord,
		recordId: params.recordId,
		setShowPreview,
		showPreview,
		updateField,
		updateItems,
		values,
	};
}

function getPurchaseOrderFormMode(pathname: string): PurchaseOrderFormMode {
	if (pathname.includes("/edit/")) return "edit";
	if (pathname.includes("/view/")) return "view";

	return "add";
}
