"use client";

import Link from "next/link";
import { Plus, ShieldCheck, Sparkles } from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserRoleSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorialData";
import { useUserRoleStore } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRole";
import { UserRoleList } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleList";
import { UserRoleSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorial";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserRolePage() {
	const userRoles = useUserRoleStore((state) => state.userRoles);
	const deleteUserRole = useUserRoleStore(
		(state) => state.deleteUserRole,
	);

	function handleDelete(id: string, name: string) {
		if (!window.confirm(`Set ${name} as inactive?`)) return;
		deleteUserRole(id);
	}

	function openSpotlightTutorial() {
		window.dispatchEvent(new Event(UserRoleSpotlightTutorialOpenEvent));
	}

	return (
		<section className="grid gap-5">
			<UserRoleSpotlightTutorial />
			<ModuleHeader
				variant="panel"
				data-spotlight-id="user-role-header"
				titleAs="h1"
				title="User Roles"
				description="Maintain access role templates for users."
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
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
							href={`${UserRoleHref}/add`}
							data-spotlight-id="user-role-add"
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Type
						</Link>
					</>
				}
			/>
			<UserRoleList
				baseHref={UserRoleHref}
				icon={ShieldCheck}
				items={userRoles}
				onDelete={handleDelete}
			/>
		</section>
	);
}
