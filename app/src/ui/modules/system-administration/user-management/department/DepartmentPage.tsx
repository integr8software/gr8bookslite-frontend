"use client";

import { UsersRound } from "lucide-react";
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { DepartmentSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/department/DepartmentSpotlightTutorialData";
import { useDepartmentStore } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartment";
import { DepartmentHeader } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentHeader";
import { DepartmentList } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentList";
import { DepartmentSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentSpotlightTutorial";

export function DepartmentPage() {
	const departments = useDepartmentStore((state) => state.departments);
	const deleteDepartment = useDepartmentStore(
		(state) => state.deleteDepartment,
	);

	function handleDelete(id: string, name: string) {
		if (!window.confirm(`Set ${name} as inactive?`)) return;
		deleteDepartment(id);
	}

	function openSpotlightTutorial() {
		window.dispatchEvent(new Event(DepartmentSpotlightTutorialOpenEvent));
	}

	return (
		<section className="grid gap-5">
			<DepartmentSpotlightTutorial />
			<DepartmentHeader
				addHref={`${DepartmentHref}/add`}
				description="Maintain teams and department groupings for users."
				onStartSpotlightTutorial={openSpotlightTutorial}
				title="Departments"
			/>
			<DepartmentList
				baseHref={DepartmentHref}
				icon={UsersRound}
				items={departments}
				onDelete={handleDelete}
			/>
		</section>
	);
}
