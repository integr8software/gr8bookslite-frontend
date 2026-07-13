import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ApprovalManagementShell } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementShell";

const PageTitle = "Approval Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApprovalManagementPage() {
	return <ApprovalManagementShell />;
}


