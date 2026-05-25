import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Audit Logs | ${AppName}`,
	description: `Master audit logs for ${AppName}.`,
};

export default function MasterAuditLogsPage() {
	return <MasterPreviewPage pageKey="auditLogs" />;
}
