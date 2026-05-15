import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserGroupFormPage } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupFormPage";

const PageTitle = "Edit User Group";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserGroupEditPage() {
  return <UserGroupFormPage />;
}
