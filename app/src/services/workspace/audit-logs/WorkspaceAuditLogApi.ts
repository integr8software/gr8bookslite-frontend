import {
	workspaceAuditLogsControllerFindAllV1,
	workspaceAuditLogsControllerRecordActivityV1,
} from "@/app/src/generated/api/workspace-audit-logs/workspace-audit-logs";
import type {
	RecordWorkspaceActivityDto,
	WorkspaceAuditLogResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogRecord,
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
		module: NormalizeModule(record.module),
		recordId: record.entityId ?? record.id,
	};
}

function NormalizeModule(value: string) {
	if (value.startsWith("txn-setup-")) {
		return "Transaction Number Setup";
	}

	return value;
}

function NormalizeAction(value: string): WorkspaceAuditLogAction {
	const action = WorkspaceAuditLogActions.find((option) => option === value);

	return action ?? "Update";
}
