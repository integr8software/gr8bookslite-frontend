"use client";

import Link from "next/link";
import { Building2, Plus, Sparkles } from "lucide-react";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import { BranchManagementSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementSpotlightTutorialData";
import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { BranchManagementSpotlightTutorial } from "./BranchManagementSpotlightTutorial";
import { BranchManagementTable } from "./BranchManagementTable";

export function BranchManagementMain() {
	const branches = useBranchManagementStore((state) => state.branches);
	const deleteBranch = useBranchManagementStore(
		(state) => state.deleteBranch,
	);

	function handleDeleteBranch(branchId: string, branchName: string) {
		if (!window.confirm(`Delete ${branchName}?`)) {
			return;
		}

		deleteBranch(branchId);
	}

	function openSpotlightTutorial() {
		window.dispatchEvent(new Event(BranchManagementSpotlightTutorialOpenEvent));
	}

	return (
		<section className="grid gap-5">
			<BranchManagementSpotlightTutorial />
			<ModuleHeader
				variant="panel"
				data-spotlight-id="branch-management-header"
				titleAs="h1"
				title="Branch Management"
				description="Maintain company branches and satellite offices used by the main layout switcher."
				eyebrow={
					<>
						<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
				actions={
					<>
						<button
							type="button"
							onClick={openSpotlightTutorial}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Sparkles className="h-4 w-4" aria-hidden="true" />
							Quick Tour
						</button>
						<Link
							href={`${BranchManagementHref}/add`}
							data-spotlight-id="branch-management-add"
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Branch
						</Link>
					</>
				}
			/>
			<BranchManagementTable
				branches={branches}
				onDeleteBranch={handleDeleteBranch}
			/>
		</section>
	);
}
