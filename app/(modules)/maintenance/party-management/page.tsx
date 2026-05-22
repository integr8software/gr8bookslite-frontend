import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementMain } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementPage";

const PageTitle = "Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPage() {
  return <PartyManagementMain />;
}
