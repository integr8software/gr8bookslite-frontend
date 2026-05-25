import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `System Logs | ${AppName}`,
	description: `Master system logs for ${AppName}.`,
};

export default function MasterSystemLogsPage() {
	return <MasterPreviewPage pageKey="systemLogs" />;
}
