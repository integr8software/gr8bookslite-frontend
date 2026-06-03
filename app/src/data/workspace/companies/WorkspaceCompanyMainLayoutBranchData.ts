import type {
	MainBranch,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type {
	WorkspaceCompanyBranchRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export function mapWorkspaceCompanyBranchesToMainBranches({
	branches,
	company,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	company?: { id: string; initials?: string };
}): MainBranch[] {
	return branches
		.filter((branch) => branch.status === "Active")
		.map((branch) => ({
			access: { edit: true, view: true },
			address: branch.address,
			code: branch.code,
			companyCode: company?.initials ?? branch.companyId,
			contactNo: branch.contactNumber,
			email: branch.email,
			href: "/dashboard",
			id: branch.id,
			isMain: branch.isMain,
			kind: branch.branchType === "Satellite" ? "satellite" : "branch",
			linkedMainBranchId: branch.linkedMainBranchId,
			name: branch.name,
			tin: branch.tin,
		}));
}
