import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementEmployeeMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/employee/Main";

const PageTitle = "Employee";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementEmployeePage() {
  return <PartyManagementPartyManagementEmployeeMain />;
}


