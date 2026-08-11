import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SystemAdministrationApprovalManagementMain } from "@/app/src/ui/modules/approval-management/SystemAdministrationApprovalManagementMain";

const PageTitle = "Approval Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApprovalManagementPage() {
  return <SystemAdministrationApprovalManagementMain />;
}
