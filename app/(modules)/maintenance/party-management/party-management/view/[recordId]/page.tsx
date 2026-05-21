import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementAction } from "@/app/src/ui/modules/maintenance/party-management/party-management/ui/Action";

const PageTitle = "View Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementViewPage() {
  return <PartyManagementPartyManagementAction />;
}


