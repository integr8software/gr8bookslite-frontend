import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserGroupFormPage } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupFormPage";

const PageTitle = "Add User Group";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserGroupAddPage() {
  return <UserGroupFormPage />;
}
