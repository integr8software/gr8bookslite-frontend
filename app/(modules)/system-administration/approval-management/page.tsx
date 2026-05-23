import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ApprovalManagementListPage } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementListPage";

const PageTitle = "Approval Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApprovalManagementPage() {
	return <ApprovalManagementListPage />;
}


