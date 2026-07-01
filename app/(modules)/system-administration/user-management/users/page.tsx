import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { UserListPage } from "@/app/src/ui/modules/system-administration/user-management/users/UserListPage";

const PageTitle = "Users";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserListPage() {
  return <UserListPage />;
}
