"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	TransactionNumberModuleOptions,
	TransactionNumberSetupEditFromParam,
	TransactionNumberSetupEditFromViewQuery,
	TransactionNumberSetupEditFromViewValue,
	TransactionNumberSetupHref,
} from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import {
	TransactionNumberSetupInitialFormValues,
	createTransactionNumberSetupFormValues,
	createTransactionNumberSetupRecord,
	updateTransactionNumberSetupRecord,
} from "@/app/src/data/modules/system-administration/transaction-number-setup/TransactionNumberSetupData";
import { MainLayoutMockData } from "@/app/src/data/shared/MainLayout/MainShellMockData";
import { formatTransactionNumber } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";
import type {
	TransactionNumberModuleCode,
	TransactionNumberSetupActionMode,
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import { validateTransactionNumberSetupForm } from "@/app/src/validations/modules/system-administration/transaction-number-setup/TransactionNumberSetupValidation";
import { useTransactionNumberSetupStore } from "./useTransactionNumberSetup";

const NumberFields = new Set<keyof TransactionNumberSetupFormValues>([
	"padding",
	"startingNumber",
	"currentNumber",
]);

export function useTransactionNumberSetupFormPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		addSetup,
		deleteSetup,
		isMutating,
		setups,
		updateSetup,
	} = useTransactionNumberSetupStore();
	const mode = getActionMode(pathname);
	const existingSetup = setups.find((setup) => setup.id === params.recordId);
	const isReadonly = mode === "view";
	const branchOptions = MainLayoutMockData.branches.map((branch) => ({
		id: branch.id,
		code: branch.code,
		name: branch.name,
	}));
	const branchNameById = new Map(
		branchOptions.map((branch) => [branch.id, branch.name]),
	);
	const [values, setValues] = useState<TransactionNumberSetupFormValues>(() =>
		existingSetup
			? createTransactionNumberSetupFormValues(existingSetup)
			: TransactionNumberSetupInitialFormValues,
	);
	const [errors, setErrors] = useState<TransactionNumberSetupFormErrors>({});
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(TransactionNumberSetupEditFromParam) ===
			TransactionNumberSetupEditFromViewValue;
	const viewHref = existingSetup
		? `${TransactionNumberSetupHref}/view/${existingSetup.id}`
		: TransactionNumberSetupHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : TransactionNumberSetupHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : TransactionNumberSetupHref;
	const editHref = existingSetup
		? `${TransactionNumberSetupHref}/edit/${existingSetup.id}?${TransactionNumberSetupEditFromViewQuery}`
		: undefined;
	const nextNumberPreview =
		values.prefix && values.padding > 0
			? formatTransactionNumber({
					currentNumber: values.currentNumber,
					padding: values.padding,
					prefix: values.prefix,
				})
			: "Set prefix and padding";

	function updateField<TKey extends keyof TransactionNumberSetupFormValues>(
		field: TKey,
		value: TransactionNumberSetupFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			const nextValues = {
				...current,
				[field]: value,
			};

			if (field === "moduleCode") {
				const moduleOption = TransactionNumberModuleOptions.find(
					(option) => option.code === value,
				);

				if (!current.prefix && moduleOption) {
					nextValues.prefix = moduleOption.defaultPrefix;
				}
			}

			if (field === "scope" && value === "all") {
				nextValues.branchIds = [];
			}

			if (field === "scope" && value === "branch") {
				nextValues.branchIds = current.branchIds.slice(0, 1);
			}

			return nextValues;
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, value } = event.target;

		if (NumberFields.has(name as keyof TransactionNumberSetupFormValues)) {
			updateField(
				name as keyof TransactionNumberSetupFormValues,
				Number(value) as never,
			);
			return;
		}

		updateField(name as keyof TransactionNumberSetupFormValues, value as never);
	}

	function handleModuleCodeChange(moduleCode: TransactionNumberModuleCode) {
		updateField("moduleCode", moduleCode);
	}

	function toggleBranch(branchId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			if (current.scope === "branch") {
				return { ...current, branchIds: [branchId] };
			}

			const branchIds = current.branchIds.includes(branchId)
				? current.branchIds.filter((currentBranchId) => currentBranchId !== branchId)
				: [...current.branchIds, branchId];

			return { ...current, branchIds };
		});
		setErrors((current) => ({ ...current, branchIds: undefined }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateTransactionNumberSetupForm({
			allBranchIds: branchOptions.map((branch) => branch.id),
			currentRecordId: existingSetup?.id,
			existingRecords: setups,
			values,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingSetup) {
			updateSetup(updateTransactionNumberSetupRecord(existingSetup, values));
			router.push(submitHref);
			return;
		}

		addSetup(createTransactionNumberSetupRecord(values));
		router.push(TransactionNumberSetupHref);
	}

	function handleStatusChange() {
		if (!existingSetup) {
			return;
		}

		deleteSetup(existingSetup.id);
		router.push(TransactionNumberSetupHref);
	}

	return {
		branchNameById,
		branchOptions,
		cancelHref,
		editHref,
		errors,
		existingSetup,
		handleInputChange,
		handleModuleCodeChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		nextNumberPreview,
		toggleBranch,
		updateField,
		values,
	};
}

function getActionMode(pathname: string): TransactionNumberSetupActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
