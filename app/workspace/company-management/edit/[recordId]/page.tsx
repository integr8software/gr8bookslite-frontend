import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CompanyManagementAction } from "@/app/src/ui/workspace/companies/CompanyManagementAction";

export const metadata: Metadata = {
	title: `Edit Company | ${AppName}`,
	description: `Update workspace company details for ${AppName}.`,
};

export default function EditCompanyPage() {
	return <CompanyManagementAction />;
}
