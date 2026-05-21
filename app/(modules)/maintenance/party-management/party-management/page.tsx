import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/ui/Main";

const PageTitle = "Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementPage() {
  return <PartyManagementPartyManagementMain />;
}


