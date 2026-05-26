import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PartyManagementAction } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementAction";

const PageTitle = "Add Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementAddPage() {
  return <PartyManagementAction />;
}
