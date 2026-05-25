"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MasterPlanAndPackagesHref } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	InitialMasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecords,
	createMasterPlanAndPackageFormValues,
	createMasterPlanAndPackageRecord,
	getMasterPlanAndPackageById,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { validateMasterPlanAndPackageForm } from "@/app/src/validations/master/plan-and-packages/MasterPlanAndPackageValidation";

type UseMasterPlanAndPackageFormPageParams = {
	mode: "add" | "edit";
	recordId?: string;
};

export function useMasterPlanAndPackageFormPage({
	mode,
	recordId,
}: UseMasterPlanAndPackageFormPageParams) {
	const router = useRouter();
	const record = useMemo(
		() => (recordId ? getMasterPlanAndPackageById(recordId) : undefined),
		[recordId],
	);
	const [values, setValues] = useState<MasterPlanAndPackageFormValues>(() =>
		mode === "edit" && record
			? createMasterPlanAndPackageFormValues(record)
			: InitialMasterPlanAndPackageFormValues,
	);
	const [errors, setErrors] = useState<MasterPlanAndPackageFormErrors>({});
	const isMissingRecord = mode === "edit" && !record;

	function updateValues(nextValues: Partial<MasterPlanAndPackageFormValues>) {
		setValues((current) => ({ ...current, ...nextValues }));
	}

	function saveRecord() {
		const nextErrors = validateMasterPlanAndPackageForm({
			records: MasterPlanAndPackageRecords,
			values,
		});

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		createMasterPlanAndPackageRecord(values);
		toast.success(mode === "edit" ? "Plan updated." : "Plan created.");
		router.push(MasterPlanAndPackagesHref);
	}

	return {
		errors,
		isMissingRecord,
		mode,
		record,
		saveRecord,
		updateValues,
		values,
	};
}
