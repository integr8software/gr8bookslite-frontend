"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { InventoryCountHref } from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import { createInitialInventoryCountValues } from "@/app/src/data/modules/inventory/inventory-count/InventoryCountData";
import type {
	InventoryCountMode,
	InventoryCountValues,
} from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
import { validateInventoryCount } from "@/app/src/validations/modules/inventory/inventory-count/InventoryCountValidation";

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

	function updateField(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;

		setValues((current) => ({ ...current, [name]: value }));
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

	return {
		handleSubmit,
		isReadonly,
		isReportPreviewOpen,
		isUploadHistoryDialogOpen,
		mode,
		setIsReportPreviewOpen,
		setIsUploadHistoryDialogOpen,
		updateField,
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
		return `Edit Inventory Count | ${countNo}`;
	}

	return "Add Inventory Count";
}
