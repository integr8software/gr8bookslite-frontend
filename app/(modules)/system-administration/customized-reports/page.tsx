import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CustomizeReportPage } from "@/app/src/ui/modules/system-administration/customized-reports/CustomizeReportPage";

const PageTitle = "Customized Reports";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationCustomizedReportsPage() {
	return <CustomizeReportPage />;
}
