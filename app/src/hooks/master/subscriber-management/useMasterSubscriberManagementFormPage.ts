"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	MasterSubscriberManagementHref,
	getMasterSubscriberManagementViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
	InitialMasterSubscriberManagementFormValues,
	createMasterSubscriberManagementFormValues,
	getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type {
	MasterSubscriberManagementFormErrors,
	MasterSubscriberManagementFormValues,
	MasterSubscriberManagementStatus,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { validateMasterSubscriberManagementForm } from "@/app/src/validations/master/subscriber-management/MasterSubscriberManagementValidation";

type UseMasterSubscriberManagementFormPageOptions = {
	mode: "add" | "edit";
	recordId?: string;
	returnSource?: "list" | "view";
};

export function useMasterSubscriberManagementFormPage({
	mode,
	recordId,
	returnSource = "list",
}: UseMasterSubscriberManagementFormPageOptions) {
	const router = useRouter();
	const subscriber = useMemo(
		() =>
			mode === "edit"
				? getMasterSubscriberManagementSubscriber(recordId)
				: undefined,
		[mode, recordId],
	);
	const [values, setValues] = useState<MasterSubscriberManagementFormValues>(
		() =>
			subscriber
				? createMasterSubscriberManagementFormValues(subscriber)
				: InitialMasterSubscriberManagementFormValues,
	);
	const [errors, setErrors] =
		useState<MasterSubscriberManagementFormErrors>({});
	const cancelHref =
		mode === "edit" && returnSource === "view" && recordId
			? getMasterSubscriberManagementViewHref(recordId)
			: MasterSubscriberManagementHref;

	function updateValue<Key extends keyof MasterSubscriberManagementFormValues>(
		key: Key,
		value: MasterSubscriberManagementFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
		setErrors((current) => {
			const nextErrors = { ...current };
			delete nextErrors[key];
			return nextErrors;
		});
	}

	function updateStatus(status: MasterSubscriberManagementStatus) {
		updateValue("status", status);
	}

	function handleSubmit() {
		const nextErrors = validateMasterSubscriberManagementForm(values);
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		router.push(cancelHref);
	}

	return {
		cancelHref,
		errors,
		handleSubmit,
		mode,
		subscriber,
		updateStatus,
		updateValue,
		values,
	};
}
