import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type { BranchActionMode } from "@/app/src/types/modules/branch-manager/BranchActionTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type BranchManagementActionActionsProps = {
	branch?: MainBranch;
	isReadonly: boolean;
	mode: BranchActionMode;
	onDeleteBranch: () => void;
};

export function BranchManagementActionActions({
	branch,
	isReadonly,
	mode,
	onDeleteBranch,
}: BranchManagementActionActionsProps) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={BranchManagementHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && branch ? (
				<Link
					href={`${BranchManagementHref}/edit/${branch.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{branch ? (
				<button
					type="button"
					onClick={onDeleteBranch}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && branch ? (
				<Link
					href={`${BranchManagementHref}/view/${branch.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button
					type="submit"
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Branch
				</button>
			) : null}
		</>
	);
}
