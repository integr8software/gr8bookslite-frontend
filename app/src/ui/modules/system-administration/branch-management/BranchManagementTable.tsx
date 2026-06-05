import { Building2, GitBranch } from "lucide-react";
import { getBranchDisplayLabel } from "@/app/src/data/shared/branch/BranchDisplayData";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type BranchManagementTableProps = {
	branches: MainBranch[];
	onDeleteBranch: (branchId: string, branchName: string) => void;
};

export function BranchManagementTable({
	branches,
	onDeleteBranch,
}: BranchManagementTableProps) {
	return (
		<div
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
			data-spotlight-id="branch-management-table"
		>
			<div className="grid grid-cols-[1.1fr_0.7fr_0.65fr_0.75fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50 max-lg:hidden">
				<span>Name</span>
				<span>Company Code</span>
				<span>Classification</span>
				<span>TIN</span>
				<span className="text-right">Actions</span>
			</div>
			<div className="divide-y divide-darknavy/10">
				{branches.map((branch) => (
					<BranchManagementRow
						key={branch.id}
						branch={branch}
						onDeleteBranch={onDeleteBranch}
					/>
				))}
			</div>
		</div>
	);
}
function BranchManagementRow({
	branch,
	onDeleteBranch,
}: {
	branch: MainBranch;
	onDeleteBranch: (branchId: string, branchName: string) => void;
}) {
	const classification =
		(branch.kind ?? "branch") === "satellite" ? "Satellite" : "Branch";

	return (
		<article className="grid gap-3 px-4 py-4 lg:grid-cols-[1.1fr_0.7fr_0.65fr_0.75fr_8rem] lg:items-center lg:gap-4">
			<BranchIdentity branch={branch} />
			<Detail label="Company Code" value={branch.companyCode} />
			<Detail label="Classification" value={classification} />
			<Detail label="TIN" value={branch.tin} />
			<BranchRowActions branch={branch} onDeleteBranch={onDeleteBranch} />
		</article>
	);
}
function BranchIdentity({ branch }: { branch: MainBranch }) {
	const Icon =
		(branch.kind ?? "branch") === "satellite" ? GitBranch : Building2;
	const branchDisplayName = getBranchDisplayLabel(branch);

	return (
		<div className="flex min-w-0 items-start gap-3">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<h3 className="truncate text-sm font-semibold text-darknavy">
					{branchDisplayName}
				</h3>
				<p className="mt-1 truncate text-xs text-darknavy/50">
					{branch.address || "No address set"}
				</p>
			</div>
		</div>
	);
}

function BranchRowActions({
	branch,
	onDeleteBranch,
}: {
	branch: MainBranch;
	onDeleteBranch: (branchId: string, branchName: string) => void;
}) {
	const branchDisplayName = getBranchDisplayLabel(branch);

	return (
		<ModuleTableActions data-spotlight-id="branch-management-actions">
			<ModuleTableActionLink
				variant="view"
				href={`${BranchManagementHref}/view/${branch.id}`}
				label={`View ${branchDisplayName}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${BranchManagementHref}/edit/${branch.id}`}
				label={`Edit ${branchDisplayName}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteBranch(branch.id, branch.name)}
				label={`Delete ${branchDisplayName}`}
			/>
		</ModuleTableActions>
	);
}

function Detail({ label, value }: { label: string; value?: string }) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/40 lg:hidden">
				{label}
			</p>
			<p className="mt-1 truncate text-sm font-medium text-darknavy lg:mt-0">
				{value || "-"}
			</p>
		</div>
	);
}
