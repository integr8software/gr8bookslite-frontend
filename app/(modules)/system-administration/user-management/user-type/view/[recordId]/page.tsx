import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserTypeFormPage } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeFormPage";

const PageTitle = "View User Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserTypeViewPage() {
  return <UserTypeFormPage />;
}
