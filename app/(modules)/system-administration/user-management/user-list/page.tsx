import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserListMain } from "@/app/src/ui/modules/system-administration/user-management/user-list/Main";

const PageTitle = "User List";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserListPage() {
  return <UserListMain />;
}
