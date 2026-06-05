import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CompanyInformationPage } from "@/app/src/ui/workspace/companies/CompanyInformationPage";

export const metadata: Metadata = {
	title: `View Company | ${AppName}`,
	description: `Review workspace company details for ${AppName}.`,
};

export default function ViewCompanyPage() {
	return <CompanyInformationPage />;
}
