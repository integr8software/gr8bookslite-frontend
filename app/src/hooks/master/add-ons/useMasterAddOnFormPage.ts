"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MasterAddOnsHref } from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import { MasterAddOnMockRecords } from "@/app/src/data/master/add-ons/MasterAddOnMockData";
import type {
	MasterAddOnFormErrors,
	MasterAddOnFormValues,
} from "@/app/src/types/master/add-ons/MasterAddOnTypes";

const InitialFormValues: MasterAddOnFormValues = {
	code: "",
	name: "",
	description: "",
	status: "Active",
	featureIds: [],
	monthlyPrice: 0,
	yearlyPrice: 0,
};

type UseMasterAddOnFormPageParams = {
	mode: "add" | "edit";
	recordId?: string;
};

export function useMasterAddOnFormPage({
	mode,
	recordId,
}: UseMasterAddOnFormPageParams) {
	const router = useRouter();

	// Mock data — replace with a real query when the backend is ready.
	const records = useMemo(() => MasterAddOnMockRecords, []);
	const record = useMemo(
		() =>
			recordId
				? records.find((candidate) => candidate.id === recordId)
				: undefined,
		[recordId, records],
	);
	const [values, setValues] = useState<MasterAddOnFormValues>(
		() => InitialFormValues,
	);
	const [errors, setErrors] = useState<MasterAddOnFormErrors>({});
	const [hasLocalChanges, setHasLocalChanges] = useState(false);
	const isMissingRecord = mode === "edit" && !record;

	const activeValues = useMemo(() => {
		if (mode === "edit" && record && !hasLocalChanges) {
			return createFormValuesFromRecord(record);
		}

		return values;
	}, [hasLocalChanges, mode, record, values]);

	function updateValues(nextValues: Partial<MasterAddOnFormValues>) {
		setHasLocalChanges(true);
		setValues((current) => ({
			...(hasLocalChanges ? current : activeValues),
			...nextValues,
		}));
	}

	function saveRecord() {
		const nextErrors = validateAddOnForm(activeValues);

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		const generatedCode =
			activeValues.code?.trim() ||
			activeValues.name
				.trim()
				.toUpperCase()
				.replace(/[^A-Z0-9]+/g, "_");

		// Mock save — replace with a real mutation when the backend is ready.
		toast.success(
			mode === "edit" ? "Add-on updated." : "Add-on created.",
		);
		router.push(MasterAddOnsHref);
	}

	return {
		errors,
		isMissingRecord,
		isSaving: false,
		isLoadingRecord: false,
		mode,
		record,
		saveRecord,
		updateValues,
		values: activeValues,
	};
}

function createFormValuesFromRecord(
	record: (typeof MasterAddOnMockRecords)[number],
): MasterAddOnFormValues {
	return {
		id: record.id,
		code: record.code,
		name: record.name,
		description: record.description,
		status: record.status,
		featureIds: [...record.featureIds],
		monthlyPrice: record.pricing.monthlyPrice,
		yearlyPrice: record.pricing.yearlyPrice,
	};
}

function validateAddOnForm(
	values: MasterAddOnFormValues,
): MasterAddOnFormErrors {
	const errors: MasterAddOnFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (values.monthlyPrice < 0) {
		errors.monthlyPrice = "Monthly price cannot be negative.";
	}

	if (values.yearlyPrice < 0) {
		errors.yearlyPrice = "Yearly price cannot be negative.";
	}

	if (values.featureIds.length === 0) {
		errors.featureIds = "Select at least one module.";
	}

	return errors;
}

