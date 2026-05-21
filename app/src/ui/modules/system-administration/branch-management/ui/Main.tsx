"use client";

import { BranchManagementSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementSpotlightTutorialData";
import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import { BranchManagementHeader } from "./BranchManagementHeader";
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
			<BranchManagementHeader onStartSpotlightTutorial={openSpotlightTutorial} />
			<BranchManagementTable
				branches={branches}
				onDeleteBranch={handleDeleteBranch}
			/>
		</section>
	);
}
