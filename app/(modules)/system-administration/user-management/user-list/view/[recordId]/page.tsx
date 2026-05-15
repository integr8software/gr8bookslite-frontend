import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserListFormPage } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListFormPage";

const PageTitle = "View User";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserListViewPage() {
  return <UserListFormPage />;
}
