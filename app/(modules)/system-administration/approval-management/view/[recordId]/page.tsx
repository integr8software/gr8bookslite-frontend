import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ApprovalManagementFormPage } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementFormPage";

const PageTitle = "View Approval Workflow";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApprovalManagementViewPage() {
	return <ApprovalManagementFormPage />;
}
