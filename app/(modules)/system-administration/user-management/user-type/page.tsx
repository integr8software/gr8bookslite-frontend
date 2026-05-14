import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserTypeMain } from "@/app/src/ui/modules/system-administration/user-management/user-type/Main";

const PageTitle = "User Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserTypePage() {
  return <UserTypeMain />;
}
