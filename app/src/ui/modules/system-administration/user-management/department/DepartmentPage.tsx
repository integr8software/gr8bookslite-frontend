"use client";

import Link from "next/link";
import { Plus, Sparkles, UsersRound } from "lucide-react";
import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { DepartmentSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/department/DepartmentSpotlightTutorialData";
import { useDepartmentStore } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartment";
import { DepartmentList } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentList";
import { DepartmentSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentSpotlightTutorial";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

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
			<ModuleHeader
				variant="panel"
				data-spotlight-id="department-header"
				titleAs="h1"
				title="Departments"
				description="Maintain teams and department groupings for users."
				eyebrow={
					<>
						<UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
						User management
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
							href={`${DepartmentHref}/add`}
							data-spotlight-id="department-add"
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Group
						</Link>
					</>
				}
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
