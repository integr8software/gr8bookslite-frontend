import {
	workspaceAuditLogsControllerFindAllV1,
	workspaceAuditLogsControllerRecordActivityV1,
} from "@/app/src/generated/api/workspace-audit-logs/workspace-audit-logs";
import type {
	RecordWorkspaceActivityDto,
	WorkspaceAuditLogResponseDto,
} from "@/app/src/generated/api/gR8BooksLiteAPI.schemas";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogRecord,
	WorkspaceAuditLogSeverity,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

export type WorkspaceAuditLogApiRecord = WorkspaceAuditLogResponseDto;

const WorkspaceAuditLogActions: readonly WorkspaceAuditLogAction[] = [
	"Approve",
	"Create",
	"Delete",
	"Export",
	"Login",
	"Logout",
	"Reject",
	"Update",
	"View",
];

const WorkspaceAuditLogSeverities: readonly WorkspaceAuditLogSeverity[] = [
	"Info",
	"Warning",
	"Critical",
];

export async function GetWorkspaceAuditLogs() {
	const response = await workspaceAuditLogsControllerFindAllV1();

	return response.map(MapWorkspaceAuditLogApiRecord);
}

export async function RecordWorkspaceActivity(
	input: RecordWorkspaceActivityDto,
) {
	await workspaceAuditLogsControllerRecordActivityV1(input, {
		timeout: 5000,
	});
}

export function MapWorkspaceAuditLogApiRecord(
	record: WorkspaceAuditLogApiRecord,
): WorkspaceAuditLogRecord {
	return {
		id: record.id,
		action: NormalizeAction(record.action),
		actorName: record.actorName,
		actorRole: record.actorRole,
		branchId: record.branchId,
		branchName: record.branchName,
		createdAt: record.createdAt,
		description: record.description,
		ipAddress: record.ipAddress ?? "",
		module: record.module,
		recordId: record.entityId ?? record.id,
		severity: NormalizeSeverity(record.severity),
	};
}

function NormalizeAction(value: string): WorkspaceAuditLogAction {
	const action = WorkspaceAuditLogActions.find((option) => option === value);

	return action ?? "Update";
}

function NormalizeSeverity(value: string): WorkspaceAuditLogSeverity {
	const severity = WorkspaceAuditLogSeverities.find((option) => option === value);

	return severity ?? "Info";
}
