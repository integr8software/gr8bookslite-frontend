"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	ApprovalManagementEditFromParam,
	ApprovalManagementEditFromViewQuery,
	ApprovalManagementEditFromViewValue,
	ApprovalManagementHref,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import {
	ApprovalApproverOptions,
	createApprovalManagementFormValues,
	createApprovalManagementInitialFormValues,
	createApprovalManagementRecord,
	createApprovalStagesForCount,
	updateApprovalManagementRecord,
} from "@/app/src/data/modules/system-administration/approval-management/ApprovalManagementData";
import type {
	ApprovalManagementActionMode,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalStageFormValues,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import { validateApprovalManagementForm } from "@/app/src/validations/modules/system-administration/approval-management/ApprovalManagementValidation";
import { useApprovalManagementStore } from "./useApprovalManagement";

export function useApprovalManagementFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		addWorkflow,
		inactivateWorkflow,
		isMutating,
		updateWorkflow,
		workflows,
	} = useApprovalManagementStore();
	const mode = getActionMode(pathname);
	const existingWorkflow = workflows.find(
		(workflow) => workflow.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<ApprovalManagementFormValues>(() =>
		existingWorkflow
			? createApprovalManagementFormValues(existingWorkflow)
			: createApprovalManagementInitialFormValues(),
	);
	const [errors, setErrors] = useState<ApprovalManagementFormErrors>({});
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(ApprovalManagementEditFromParam) ===
			ApprovalManagementEditFromViewValue;
	const viewHref = existingWorkflow
		? `${ApprovalManagementHref}/view/${existingWorkflow.id}`
		: ApprovalManagementHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : ApprovalManagementHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : ApprovalManagementHref;
	const editHref = existingWorkflow
		? `${ApprovalManagementHref}/edit/${existingWorkflow.id}?${ApprovalManagementEditFromViewQuery}`
		: undefined;

	function updateField<TKey extends keyof ApprovalManagementFormValues>(
		field: TKey,
		value: ApprovalManagementFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			if (field === "stageCount") {
				const stageCount = Number(value);

				return {
					...current,
					stageCount,
					stages: createApprovalStagesForCount(current.stages, stageCount),
				};
			}

			return {
				...current,
				[field]: value,
			};
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, value } = event.target;

		if (name === "stageCount") {
			updateField("stageCount", Number(value));
			return;
		}

		updateField(name as keyof ApprovalManagementFormValues, value as never);
	}

	function handleModuleCodeChange(moduleCode: ApprovalManagementModuleCode) {
		updateField("moduleCode", moduleCode);
	}

	function updateStageField<TKey extends keyof ApprovalStageFormValues>(
		stageId: string,
		field: TKey,
		value: ApprovalStageFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			stages: current.stages.map((stage) =>
				stage.id === stageId ? { ...stage, [field]: value } : stage,
			),
		}));
		setErrors((current) => clearStageError(current, stageId, field));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateApprovalManagementForm({
			currentRecordId: existingWorkflow?.id,
			existingRecords: workflows,
			values,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingWorkflow) {
			updateWorkflow(updateApprovalManagementRecord(existingWorkflow, values));
			router.push(submitHref);
			return;
		}

		addWorkflow(createApprovalManagementRecord(values));
		router.push(ApprovalManagementHref);
	}

	function handleStatusChange() {
		if (!existingWorkflow) {
			return;
		}

		inactivateWorkflow(existingWorkflow.id);
		router.push(ApprovalManagementHref);
	}

	return {
		approverOptions: ApprovalApproverOptions,
		cancelHref,
		editHref,
		errors,
		existingWorkflow,
		handleInputChange,
		handleModuleCodeChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		updateStageField,
		values,
	};
}

function clearStageError<TKey extends keyof ApprovalStageFormValues>(
	errors: ApprovalManagementFormErrors,
	stageId: string,
	field: TKey,
): ApprovalManagementFormErrors {
	if (!errors.stages?.[stageId]) {
		return errors;
	}

	const nextStageErrors = {
		...errors.stages[stageId],
		[field]: undefined,
	};

	return {
		...errors,
		stages: {
			...errors.stages,
			[stageId]: nextStageErrors,
		},
	};
}

function getActionMode(pathname: string): ApprovalManagementActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
