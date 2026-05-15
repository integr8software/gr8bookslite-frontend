import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserGroupPage } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupPage";

const PageTitle = "User Group";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserGroupPage() {
  return <UserGroupPage />;
}
