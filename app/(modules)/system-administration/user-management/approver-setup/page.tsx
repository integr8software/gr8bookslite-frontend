import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ApproverSetupPage } from "@/app/src/ui/modules//approval-management/approver-setup/ApproverSetupPage";

const PageTitle = "Approver Setup";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApproverSetupPage() {
  return <ApproverSetupPage />;
}
