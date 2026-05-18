import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementAllMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/all/Main";

const PageTitle = "All";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementAllPage() {
  return <PartyManagementPartyManagementAllMain />;
}


