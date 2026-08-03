import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CustomizeReportPage } from "@/app/src/ui/workspace/reports-analytics/CustomizeReportPage";

export const metadata: Metadata = {
	title: `Customize Report | ${AppName}`,
	description: `Customize report layout designer for ${AppName}.`,
};

export default function ReportsAnalyticsPage() {
	return <CustomizeReportPage />;
}
