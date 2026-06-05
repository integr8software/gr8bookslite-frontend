import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterAuditLogListPage } from "@/app/src/ui/master/audit-logs/MasterAuditLogListPage";

export const metadata: Metadata = {
	title: `Audit Logs | ${AppName}`,
	description: `Master audit logs for ${AppName}.`,
};

export default function MasterAuditLogsPage() {
	return <MasterAuditLogListPage />;
}
