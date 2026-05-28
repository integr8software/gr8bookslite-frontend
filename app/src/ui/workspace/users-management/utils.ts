import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const BranchUsersContextParam = "workspaceBranchId";
const CompanyUsersContextParam = "workspaceCompanyId";
const BranchUsersNameParam = "branchName";
const CompanyUsersNameParam = "companyName";

export function getBranchScopedUsersHref({
	branch,
	company,
	companyId,
}: {
	branch: WorkspaceCompanyBranchRecord;
	company?: WorkspaceCompanyRecord;
	companyId: string;
}) {
	const params = new URLSearchParams({
		[BranchUsersContextParam]: branch.id,
		[BranchUsersNameParam]: getBranchDisplayName(branch),
		[CompanyUsersContextParam]: company?.id ?? companyId,
		[CompanyUsersNameParam]: company?.name ?? "Company",
	});

	return `${UserListHref}?${params.toString()}`;
}

export function getBranchDisplayName(branch: WorkspaceCompanyBranchRecord) {
	return `${branch.name}${branch.isMain ? " (Head Office)" : ""}`;
}
