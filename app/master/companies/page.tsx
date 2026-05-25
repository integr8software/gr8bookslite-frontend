import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterCompanyManagementPage } from "@/app/src/ui/master/company-management/MasterCompanyManagementPage";

export const metadata: Metadata = {
	title: `Company Management | ${AppName}`,
	description: `Manage subscribed companies for ${AppName}.`,
};

export default function MasterCompaniesPage() {
	return <MasterCompanyManagementPage />;
}
