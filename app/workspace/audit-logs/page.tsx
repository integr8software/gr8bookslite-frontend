import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceAuditLogListPage } from "@/app/src/ui/workspace/audit-logs/WorkspaceAuditLogListPage";

export const metadata: Metadata = {
	title: `Audit Logs | ${AppName}`,
	description: `Audit logs workspace mockup for ${AppName}.`,
};

export default function AuditLogsPage() {
	return <WorkspaceAuditLogListPage />;
}
