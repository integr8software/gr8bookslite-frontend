import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserGroupAction } from "@/app/src/ui/modules/system-administration/user-management/user-group/Action";

const PageTitle = "Add User Group";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserGroupAddPage() {
  return <UserGroupAction />;
}
