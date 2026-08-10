"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { InventoryCountHref } from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import {
	createInitialInventoryCountValues,
	createInventoryCountLine,
	recalculateInventoryCountLine,
} from "@/app/src/data/modules/inventory/inventory-count/InventoryCountData";
import { loadMaterialRequests } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import { PickListSalesOrderCopyRecords } from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type {
	InventoryCountMode,
	InventoryCountValues,
} from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
import { validateInventoryCount } from "@/app/src/validations/modules/inventory/inventory-count/InventoryCountValidation";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export function useInventoryCountFormPage() {
	const pathname = usePathname();
	const router = useRouter();
	const mode = getInventoryCountMode(pathname);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<InventoryCountValues>(
		createInitialInventoryCountValues,
	);
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const [isUploadHistoryDialogOpen, setIsUploadHistoryDialogOpen] =
		useState(false);
	const jobOrderRequests = useMemo(
		() =>
			loadMaterialRequests().filter(
				(request) => request.referenceModule === "Job Order",
			),
		[],
	);
	const copyFromRecords = useMemo<AppCopyFromRecord[]>(
		() => [
			...PickListSalesOrderCopyRecords.map((record) => ({
				documentDate: record.documentDate,
				id: record.id,
				partyName: record.customerName,
				remarks: record.remarks,
				source: "Sales Order",
				sourceNo: record.sourceNo,
			})),
			...jobOrderRequests.map((request) => ({
				documentDate: request.documentDate,
				id: request.id,
				partyName: request.vceName,
				remarks: request.remarks,
				source: "Job Order",
				sourceNo: request.referenceNo || request.requestNo,
			})),
		],
		[jobOrderRequests],
	);

	function updateField(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;

		setValues((current) => ({ ...current, [name]: value }));
	}

	function updateLines(lines: InventoryCountValues["lines"]) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: lines.map(recalculateInventoryCountLine),
		}));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const error = validateInventoryCount(values);

		if (error) {
			toast.error(error);
			return;
		}

		toast.success("Inventory count saved.");
		router.push(InventoryCountHref);
	}

	function copyFromSourceTransactions(recordIds: string[]) {
		if (isReadonly) {
			return;
		}

		const selectedSalesOrders = PickListSalesOrderCopyRecords.filter((record) =>
			recordIds.includes(record.id),
		);
		const selectedJobOrders = jobOrderRequests.filter((request) =>
			recordIds.includes(request.id),
		);

		if (selectedSalesOrders.length === 0 && selectedJobOrders.length === 0) {
			toast.error("Select at least one source transaction to copy.");
			return;
		}

		const firstSalesOrder = selectedSalesOrders[0];
		const firstJobOrder = selectedJobOrders[0];
		const copiedLines = selectedJobOrders.flatMap((request) =>
			request.items
				.filter((item) => item.itemCode.trim() || item.itemName.trim())
				.map((item) =>
					createInventoryCountLine({
						barcode: item.barcode,
						brand: item.brand,
						color: item.color,
						expiryDate: item.expiryDate,
						itemCode: item.itemCode,
						itemName: item.itemName || item.description,
						lotNo: item.lotNo,
						model: item.model,
						responsibilityCenter: item.costCenter,
						serialNumber: item.serialNumber,
						size: item.size,
						uom: item.uom,
						systemQty: formatQuantity(item.stockQuantity),
						countQty: "",
						remarks: item.remarks,
					}),
				),
		);
		const sourceNos = [
			...selectedSalesOrders.map((record) => record.sourceNo),
			...selectedJobOrders.map((request) => request.referenceNo || request.requestNo),
		];
		const remarks = [
			...selectedSalesOrders.map((record) => record.remarks),
			...selectedJobOrders.map((request) => request.remarks),
		].filter(Boolean);

		setValues((current) => ({
			...current,
			partyCode:
				firstSalesOrder?.customerCode || firstJobOrder?.vceCode || current.partyCode,
			partyName:
				firstSalesOrder?.customerName || firstJobOrder?.vceName || current.partyName,
			projectRef: firstJobOrder?.projectRef || current.projectRef,
			projectName: firstJobOrder?.projectName || current.projectName,
			remarks: joinUniqueValues(remarks) || current.remarks,
			lines: copiedLines.length > 0 ? copiedLines : current.lines,
			counter: joinUniqueValues(sourceNos) || current.counter,
		}));
		toast.success("Source transaction copied to inventory count.");
	}

	return {
		copyFromRecords,
		copyFromSourceTransactions,
		handleSubmit,
		isReadonly,
		isReportPreviewOpen,
		isUploadHistoryDialogOpen,
		mode,
		setIsReportPreviewOpen,
		setIsUploadHistoryDialogOpen,
		updateField,
		updateLines,
		values,
	};
}

function getInventoryCountMode(pathname: string): InventoryCountMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

export function getInventoryCountTitle(
	mode: InventoryCountMode,
	countNo: string,
) {
	if (mode === "view") {
		return `View Inventory Count | ${countNo}`;
	}

	if (mode === "edit") {
		return "Edit Inventory Count";
	}

	return "Add Inventory Count";
}

function formatQuantity(value: number | string) {
	const quantity = Number(value);

	return Number.isFinite(quantity) ? quantity.toFixed(2) : "0.00";
}

function joinUniqueValues(values: string[]) {
	return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
}
