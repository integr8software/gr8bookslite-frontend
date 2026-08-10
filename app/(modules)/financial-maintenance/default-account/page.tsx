import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DefaultAccountListPage } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountListPage";

const PageTitle = "Default Accounts";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceDefaultAccountPage() {
  return <DefaultAccountListPage />;
}
