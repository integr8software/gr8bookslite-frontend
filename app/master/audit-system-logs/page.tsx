import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Audit/System Logs | ${AppName}`,
	description: `Master audit and system logs for ${AppName}.`,
};

export default function MasterAuditSystemLogsPage() {
	return <MasterPreviewPage pageKey="auditSystemLogs" />;
}
