"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { BranchManagementHref } from "@/app/src/constants/modules/system-administration/branch-manager/BranchManagementConstants";
import {
	BranchManagementInitialFormValues,
	createBranchFormValues,
	createBranchFromForm,
	getMainBranchTinOptions,
	updateBranchFromForm,
	type BranchManagementFormValues,
} from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
	BranchActionMode,
	BranchFormErrors,
} from "@/app/src/types/workspace/branch-manager/BranchActionTypes";
import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import { validateBranchForm } from "@/app/src/validations/modules/system-administration/branch-management/BranchManagementValidation";

export function useBranchManagementActionPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const branches = useBranchManagementStore((state) => state.branches);
	const addBranch = useBranchManagementStore((state) => state.addBranch);
	const updateBranch = useBranchManagementStore(
		(state) => state.updateBranch,
	);
	const deleteBranch = useBranchManagementStore(
		(state) => state.deleteBranch,
	);
	const mode = getActionMode(pathname);
	const existingBranch = branches.find(
		(branch) => branch.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState(() =>
		existingBranch
			? createBranchFormValues(existingBranch)
			: BranchManagementInitialFormValues,
	);
	const [errors, setErrors] = useState<BranchFormErrors>({});
	const mainBranchOptions = useMemo(
		() =>
			getMainBranchTinOptions(branches).filter(
				(branch) => branch.id !== existingBranch?.id,
			),
		[branches, existingBranch?.id],
	);
	const selectedMainBranch = mainBranchOptions.find(
		(branch) => branch.id === values.linkedMainBranchId,
	);

	function updateField(
		field: keyof BranchManagementFormValues,
		value: string | boolean,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "classification" && value === "satellite"
				? { isMain: false, tin: "" }
				: {}),
			...(field === "classification" && value === "branch"
				? { linkedMainBranchId: "" }
				: {}),
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const value =
			event.target.name === "tin"
				? FormatTinNumber(event.target.value)
				: event.target.name === "contactNo"
					? FormatPhilippineContactNumber(event.target.value)
					: event.target.value;

		updateField(
			event.target.name as keyof BranchManagementFormValues,
			value,
		);
	}

	const [isSaveBranchConfirmOpen, setIsSaveBranchConfirmOpen] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateBranchForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "add") {
			setIsSaveBranchConfirmOpen(true);
			return;
		}

		if (mode === "edit" && existingBranch) {
			updateBranch(
				updateBranchFromForm(
					existingBranch,
					values,
					selectedMainBranch,
				),
			);
			router.push(BranchManagementHref);
		}
	}

	function handleConfirmSave() {
		addBranch(createBranchFromForm(values, selectedMainBranch));
		setIsSaveBranchConfirmOpen(false);
		router.push(BranchManagementHref);
	}

	function handleDeleteBranch() {
		if (
			!existingBranch ||
			!window.confirm(`Delete ${existingBranch.name}?`)
		) {
			return;
		}

		deleteBranch(existingBranch.id);
		router.push(BranchManagementHref);
	}

	return {
		errors,
		existingBranch,
		handleConfirmSave,
		handleDeleteBranch,
		handleInputChange,
		handleSubmit,
		isReadonly,
		isSaveBranchConfirmOpen,
		mainBranchOptions,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		setIsSaveBranchConfirmOpen,
		updateField,
		values,
	};
}


function getActionMode(pathname: string): BranchActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
