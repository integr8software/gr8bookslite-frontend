import type { BranchManagementFormValues } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import type { BranchFormErrors } from "@/app/src/types/workspace/branch-manager/BranchActionTypes";

export function validateBranchForm(values: BranchManagementFormValues) {
	const errors: BranchFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Name is required.";
	}

	if (values.classification === "satellite") {
		if (!values.linkedMainBranchId) {
			errors.linkedMainBranchId = "Select the linked main branch.";
		}
	} else if (!values.tin.trim()) {
		errors.tin = "TIN is required for a branch.";
	}

	return errors;
}
