"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MasterPlanAndPackagesHref } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	InitialMasterPlanAndPackageFormValues,
	createMasterPlanAndPackageFormValues,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import {
	createMasterPlanAndPackage,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApi";
import { MasterPlanAndPackageQueryKeys } from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageQueryKeys";
import { useMasterPlanAndPackagesQuery } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackagesQuery";
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
	const queryClient = useQueryClient();
	const plansQuery = useMasterPlanAndPackagesQuery({
		enabled: mode === "edit",
	});
	const records = useMemo(() => plansQuery.data?.plans ?? [], [plansQuery.data]);
	const record = useMemo(
		() =>
			recordId
				? records.find((candidate) => candidate.id === recordId)
				: undefined,
		[recordId, records],
	);
	const [values, setValues] = useState<MasterPlanAndPackageFormValues>(() =>
		InitialMasterPlanAndPackageFormValues,
	);
	const [errors, setErrors] = useState<MasterPlanAndPackageFormErrors>({});
	const [hasLocalChanges, setHasLocalChanges] = useState(false);
	const createMutation = useMutation({
		mutationFn: async (nextValues: MasterPlanAndPackageFormValues) =>
			createMasterPlanAndPackage({
				formValues: nextValues,
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: MasterPlanAndPackageQueryKeys.lists(),
			});
			toast.success("Plan created.");
			router.push(MasterPlanAndPackagesHref);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Unable to save plan.");
		},
	});
	const isMissingRecord = mode === "edit" && !plansQuery.isLoading && !record;
	const activeValues = useMemo(() => {
		if (mode === "edit" && record && !hasLocalChanges) {
			return createMasterPlanAndPackageFormValues(record);
		}

		return values;
	}, [hasLocalChanges, mode, record, values]);

	function updateValues(nextValues: Partial<MasterPlanAndPackageFormValues>) {
		setHasLocalChanges(true);
		setValues((current) => ({
			...(hasLocalChanges ? current : activeValues),
			...nextValues,
		}));
	}

	function saveRecord() {
		const nextErrors = validateMasterPlanAndPackageForm({
			records,
			values: activeValues,
		});

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		if (mode === "edit") {
			toast("Editing plans is next. Create is connected first.");
			return;
		}

		createMutation.mutate(activeValues);
	}

	return {
		errors,
		isMissingRecord,
		isSaving: createMutation.isPending,
		isLoadingRecord: plansQuery.isLoading,
		mode,
		record,
		saveRecord,
		updateValues,
		values: activeValues,
	};
}
