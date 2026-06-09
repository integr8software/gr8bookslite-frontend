import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FetchBackend } from "@/app/src/services/auth/AuthBackendServer";
import {
	MapWorkspaceAuditLogApiRecord,
	type WorkspaceAuditLogApiRecord,
} from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogApi";
import { WorkspaceAuditLogListPage } from "@/app/src/ui/workspace/audit-logs/WorkspaceAuditLogListPage";

export const metadata: Metadata = {
	title: `Audit Logs | ${AppName}`,
	description: `Audit logs workspace mockup for ${AppName}.`,
};

export default async function AuditLogsPage() {
	const initialRecords = await GetInitialWorkspaceAuditLogs();

	return <WorkspaceAuditLogListPage initialRecords={initialRecords} />;
}

async function GetInitialWorkspaceAuditLogs() {
	try {
		const response = await FetchBackend("/workspace/audit-logs", {
			method: "GET",
		});

		if (!response.ok) {
			return [];
		}

		const records = (await response.json()) as WorkspaceAuditLogApiRecord[];

		return Array.isArray(records)
			? records.map(MapWorkspaceAuditLogApiRecord)
			: [];
	} catch {
		return [];
	}
}
