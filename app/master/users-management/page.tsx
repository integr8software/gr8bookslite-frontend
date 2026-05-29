import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessListPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessListPage";

export const metadata: Metadata = {
	title: `User Management | ${AppName}`,
	description: `Master user management for ${AppName}.`,
};

export default function MasterUsersRolesPage() {
	return <MasterTenantAccessListPage entity="user" />;
}
