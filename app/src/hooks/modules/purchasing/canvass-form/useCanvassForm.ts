"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	loadCanvassForms,
	saveCanvassForms,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import { CanvassFormQueryKeys } from "@/app/src/services/modules/purchasing/canvass-form/CanvassFormQueryKeys";
import { useOptimisticModuleListMutation } from "@/app/src/hooks/shared/module/useOptimisticModuleListMutation";
import type { CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";

type CanvassFormStoreState = {
	forms: CanvassFormRecord[];
	addForm: (form: CanvassFormRecord) => void;
	updateForm: (form: CanvassFormRecord) => void;
	deleteForm: (formId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function useCanvassFormStore<TSelected = CanvassFormStoreState>(
	selector?: (state: CanvassFormStoreState) => TSelected,
) {
	const formsQuery = useQuery({
		queryKey: CanvassFormQueryKeys.forms(),
		queryFn: async () => loadCanvassForms(),
		initialData: loadCanvassForms,
	});
	const saveFormsMutation = useOptimisticModuleListMutation<CanvassFormRecord>({
		errorMessage: "Could not save the canvass form changes.",
		getFallbackItems: loadCanvassForms,
		persistItems: saveCanvassForms,
		queryKey: CanvassFormQueryKeys.forms(),
	});
	const state = useMemo<CanvassFormStoreState>(
		() => ({
			forms: formsQuery.data,
			addForm: (form) =>
				saveFormsMutation.mutate((currentForms) => [form, ...currentForms]),
			updateForm: (form) =>
				saveFormsMutation.mutate((currentForms) =>
					currentForms.map((currentForm) =>
						currentForm.id === form.id ? form : currentForm,
					),
				),
			deleteForm: (formId) =>
				saveFormsMutation.mutate((currentForms) =>
					currentForms.filter((form) => form.id !== formId),
				),
			isLoading: formsQuery.isLoading,
			isMutating: saveFormsMutation.isPending,
			lastSyncedAt: formsQuery.dataUpdatedAt,
		}),
		[
			formsQuery.data,
			formsQuery.dataUpdatedAt,
			formsQuery.isLoading,
			saveFormsMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
