"use client";

import { ShieldCheck } from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserRoleSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorialData";
import { useUserRoleStore } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRole";
import { UserRoleHeader } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleHeader";
import { UserRoleList } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleList";
import { UserRoleSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorial";

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
			<UserRoleHeader
				addHref={`${UserRoleHref}/add`}
				description="Maintain access role templates for users."
				onStartSpotlightTutorial={openSpotlightTutorial}
				title="User Roles"
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
