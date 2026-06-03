import type {
	MasterTenantAccessBranchType,
	MasterTenantAccessStatus,
	MasterTenantAccessUserRole,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterTenantAccessStatusBadge({
	status,
}: {
	status: MasterTenantAccessStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold",
				getStatusClassName(status),
			)}
		>
			{status}
		</span>
	);
}

export function MasterTenantAccessBranchTypeBadge({
	branchType,
}: {
	branchType: MasterTenantAccessBranchType;
}) {
	const className =
		branchType === "Head Office"
			? "bg-darknavy text-white"
			: branchType === "Satellite"
				? "bg-citron/45 text-darknavy"
				: "bg-skyblue/15 text-darknavy";

	return (
		<span className={joinClasses("rounded-md px-2.5 py-1 text-xs font-semibold", className)}>
			{branchType}
		</span>
	);
}

export function MasterTenantAccessRoleBadge({
	role,
}: {
	role: MasterTenantAccessUserRole;
}) {
	return (
		<span className="rounded-md bg-offwhite px-2.5 py-1 text-xs font-semibold text-darknavy/65 ring-1 ring-darknavy/10">
			{role}
		</span>
	);
}

function getStatusClassName(status: MasterTenantAccessStatus) {
	switch (status) {
		case "Active":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "Trial":
			return "border-skyblue/30 bg-skyblue/12 text-darknavy";
		case "Past Due":
			return "border-coralpink/25 bg-coralpink/10 text-coralpink";
		case "Pending Setup":
			return "border-amber-200 bg-amber-50 text-amber-700";
		case "Suspended":
		case "Inactive":
			return "border-darknavy/10 bg-darknavy/5 text-darknavy/55";
	}
}
