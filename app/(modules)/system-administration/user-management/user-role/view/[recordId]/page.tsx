import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserRoleFormPage } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleFormPage";

const PageTitle = "View User Type";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserRoleViewPage() {
	return <UserRoleFormPage />;
}
