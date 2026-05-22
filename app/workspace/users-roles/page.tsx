import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { WorkspaceUsersManagementMain } from "@/app/src/ui/modules/workspace/users-management/WorkspaceUsersManagementMain";

export const metadata: Metadata = {
	title: `Users Management | ${AppName}`,
	description: `Workspace users management for ${AppName}.`,
};

export default function UsersRolesPage() {
	return <WorkspaceUsersManagementMain />;
}
