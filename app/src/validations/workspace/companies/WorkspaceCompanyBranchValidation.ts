import {
	validateBranchForm,
} from "@/app/src/validations/modules/system-administration/branch-management/BranchManagementValidation";
import type {
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyBranchTypes";

export function validateWorkspaceCompanyBranchForm(
	values: WorkspaceCompanyBranchFormValues,
): WorkspaceCompanyBranchFormErrors {
	return validateBranchForm(values);
}
