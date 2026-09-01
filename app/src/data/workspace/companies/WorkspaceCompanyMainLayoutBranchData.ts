import type {
	MainBranch,
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import type {
	WorkspaceCompanyBranchRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

type ProfileCompanyUnit = {
	id: number;
	code: string | null;
	name: string;
	type: string;
	isActive: boolean;
	isMain: boolean;
};

type ProfileCompanyBranchSource = {
	companyId: number;
	role: "ADMIN" | "USER";
	accessScope?: string | null;
	accessibleUnitIds?: number[];
	units?: ProfileCompanyUnit[];
};

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

export function mapProfileCompanyUnitsToMainBranches({
	company,
}: {
	company: ProfileCompanyBranchSource;
}): MainBranch[] {
	const accessibleUnitIds = new Set(
		(company.accessibleUnitIds ?? []).map((unitId) => String(unitId)),
	);
	const shouldFilterUnits =
		company.role !== "ADMIN" && accessibleUnitIds.size > 0;

	return (company.units ?? [])
		.filter((unit) => unit.isActive)
		.filter(
			(unit) => !shouldFilterUnits || accessibleUnitIds.has(String(unit.id)),
		)
		.map((unit) => ({
			access: { edit: company.role === "ADMIN", view: true },
			code: unit.code ?? `UNIT-${unit.id}`,
			companyCode: String(company.companyId),
			href: "/dashboard",
			id: String(unit.id),
			isMain: unit.isMain,
			kind: unit.type === "SATELLITE" ? "satellite" : "branch",
			name: unit.name,
			tin: "",
		}));
}
