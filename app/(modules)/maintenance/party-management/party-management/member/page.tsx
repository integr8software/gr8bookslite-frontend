import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementMemberMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/member/Main";

const PageTitle = "Member";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementMemberPage() {
  return <PartyManagementPartyManagementMemberMain />;
}


