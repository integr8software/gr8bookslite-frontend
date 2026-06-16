import type {
	AuditTrailAction,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

export function formatAuditTrailCreatedAt(createdAt: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(createdAt));
}

export function getAuditTrailActionTone(action: AuditTrailAction) {
	if (action === "Delete" || action === "Disapproved") {
		return "danger";
	}

	if (action === "Approve" || action === "Save" || action === "Export") {
		return "success";
	}

	return "neutral";
}
