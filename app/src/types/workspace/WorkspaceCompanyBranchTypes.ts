import type {
	BranchManagementFormValues,
} from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import type { BranchFormErrors } from "@/app/src/types/modules/branch-manager/BranchActionTypes";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export type WorkspaceCompanyBranchFormValues = BranchManagementFormValues;

export type WorkspaceCompanyBranchFormErrors = BranchFormErrors;

export type WorkspaceCompanyBranchDrawerMode = "edit" | "view";

export type WorkspaceCompanyBranchManagementPanelProps = {
	cachedBranches: WorkspaceCompanyBranchRecord[];
	company: WorkspaceCompanyRecord;
	userCount: number;
};
