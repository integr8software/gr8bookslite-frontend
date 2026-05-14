import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserManagementMain } from "@/app/src/ui/modules/system-administration/user-management/Main";

const PageTitle = "User Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserManagementPage() {
  return <UserManagementMain />;
}


