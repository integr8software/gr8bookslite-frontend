import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CompanyManagementAction } from "@/app/src/ui/workspace/companies/CompanyManagementAction";

export const metadata: Metadata = {
	title: `Add Company | ${AppName}`,
	description: `Create a workspace company for ${AppName}.`,
};

export default function AddCompanyPage() {
	return <CompanyManagementAction />;
}
