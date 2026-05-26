import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `User Management | ${AppName}`,
	description: `Master user management for ${AppName}.`,
};

export default function MasterUsersRolesPage() {
	return <MasterPreviewPage pageKey="usersRoles" />;
}
