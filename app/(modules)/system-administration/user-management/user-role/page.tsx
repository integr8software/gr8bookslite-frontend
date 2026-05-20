import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserRolePage } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRolePage";

const PageTitle = "User Role";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserRolePage() {
	return <UserRolePage />;
}
