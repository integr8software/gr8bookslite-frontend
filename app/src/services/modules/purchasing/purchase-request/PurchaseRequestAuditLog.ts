import { RecordWorkspaceActivity } from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogApi";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestAuditAction = "CREATE" | "UPDATE" | "DELETE";

type PurchaseRequestAuditContext = {
	branchId?: number | null;
	branchName?: string | null;
};

export function recordPurchaseRequestAuditLog(
	action: PurchaseRequestAuditAction,
	request: Pick<PurchaseRequestRecord, "id" | "transNo">,
	context: PurchaseRequestAuditContext,
) {
	const verb =
		action === "CREATE"
			? "created"
			: action === "UPDATE"
				? "updated"
				: "deleted";

	void RecordWorkspaceActivity({
		action,
		branchId:
			context.branchId === null || context.branchId === undefined
				? undefined
				: String(context.branchId),
		branchName: context.branchName ?? undefined,
		description: `Purchase Request ${request.transNo} was ${verb}.`,
		entityId: request.id,
		entityType: "PurchaseRequest",
		module: "Purchase Request",
		path: `/purchasing/purchase-request/view/${request.id}`,
	}).catch(() => {
		// Audit logging should not block local purchase request workflows.
	});
}
