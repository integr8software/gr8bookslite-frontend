"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	MasterPromotionsHref,
	getMasterPromotionViewHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	InitialMasterPromotionFormValues,
	MasterPromotionRecords,
	createMasterPromotionFormValues,
	createMasterPromotionRecord,
	generateMasterPromotionCode,
	getMasterPromotionById,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import type {
	MasterPromotionFormErrors,
	MasterPromotionFormValues,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { validateMasterPromotionForm } from "@/app/src/validations/master/promotions/MasterPromotionValidation";

type UseMasterPromotionFormPageParams = {
	mode: "add" | "edit";
	recordId?: string;
	returnSource?: "list" | "view";
};

export function useMasterPromotionFormPage({
	mode,
	recordId,
	returnSource = "list",
}: UseMasterPromotionFormPageParams) {
	const router = useRouter();
	const record = useMemo(
		() => (recordId ? getMasterPromotionById(recordId) : undefined),
		[recordId],
	);
	const [values, setValues] = useState<MasterPromotionFormValues>(() =>
		mode === "edit" && record
			? createMasterPromotionFormValues(record)
			: InitialMasterPromotionFormValues,
	);
	const [errors, setErrors] = useState<MasterPromotionFormErrors>({});
	const isMissingRecord = mode === "edit" && !record;
	const backHref =
		returnSource === "view" && record
			? getMasterPromotionViewHref(record.id)
			: MasterPromotionsHref;

	function updateValues(nextValues: Partial<MasterPromotionFormValues>) {
		setValues((current) => ({ ...current, ...nextValues }));
	}

	function saveRecord() {
		const nextErrors = validateMasterPromotionForm({
			records: MasterPromotionRecords,
			values,
		});

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		createMasterPromotionRecord(values);
		toast.success(
			mode === "edit" ? "Promotion updated." : "Promotion created.",
		);
		router.push(backHref);
	}

	function generatePromotionCode() {
		setValues((current) => ({
			...current,
			code: generateMasterPromotionCode(),
		}));
		toast.success("Promotion code generated.");
	}

	return {
		backHref,
		errors,
		generatePromotionCode,
		isMissingRecord,
		mode,
		record,
		saveRecord,
		updateValues,
		values,
	};
}
