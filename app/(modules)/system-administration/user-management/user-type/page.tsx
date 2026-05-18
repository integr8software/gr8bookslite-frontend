import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { UserTypePage } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypePage";

const PageTitle = "User Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationUserTypePage() {
  return <UserTypePage />;
}
