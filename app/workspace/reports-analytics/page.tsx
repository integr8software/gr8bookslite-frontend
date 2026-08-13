import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CustomizeReportPage } from "@/app/src/ui/modules/system-administration/customized-reports/CustomizeReportPage";

export const metadata: Metadata = {
	title: `Customize Report | ${AppName}`,
	description: `Customize report layout designer for ${AppName}.`,
};

export default function ReportsAnalyticsPage() {
	return <CustomizeReportPage />;
}
