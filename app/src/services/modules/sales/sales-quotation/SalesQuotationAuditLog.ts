import { RecordWorkspaceActivity } from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogApi";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

type SalesQuotationAuditAction = "CREATE" | "UPDATE" | "DELETE";

type SalesQuotationAuditContext = {
	branchId?: number | null;
	branchName?: string | null;
};

export function recordSalesQuotationAuditLog(
	action: SalesQuotationAuditAction,
	request: Pick<SalesQuotationRecord, "id" | "transNo">,
	context: SalesQuotationAuditContext,
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
		description: `Sales Quotation ${request.transNo} was ${verb}.`,
		entityId: request.id,
		entityType: "SalesQuotation",
		module: "Sales Quotation",
		path: `/sales/sales-quotation/view/${request.id}`,
	}).catch(() => {
		// Audit logging should not block local sales quotation workflows.
	});
}

