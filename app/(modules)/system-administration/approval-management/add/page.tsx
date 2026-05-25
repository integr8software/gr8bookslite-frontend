import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ApprovalManagementFormPage } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementFormPage";

const PageTitle = "Add Approval Workflow";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationApprovalManagementAddPage() {
	return <ApprovalManagementFormPage />;
}
