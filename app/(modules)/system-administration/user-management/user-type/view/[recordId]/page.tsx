import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserTypeAction } from "@/app/src/ui/modules/system-administration/user-management/user-type/Action";

const PageTitle = "View User Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserTypeViewPage() {
  return <UserTypeAction />;
}
