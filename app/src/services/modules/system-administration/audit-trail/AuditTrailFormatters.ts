import type {
	AuditTrailAction,
	AuditTrailRecord,
	AuditTrailSeverity,
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

export function formatAuditTrailModuleTrail(record: AuditTrailRecord) {
	return record.trail.join(" / ");
}

export function getAuditTrailActionTone(action: AuditTrailAction) {
	if (action === "Delete" || action === "Reject") {
		return "danger";
	}

	if (action === "Approve" || action === "Generate") {
		return "success";
	}

	return "neutral";
}

export function getAuditTrailSeverityClassName(severity: AuditTrailSeverity) {
	if (severity === "Critical") {
		return "bg-coralpink/12 text-coralpink";
	}

	if (severity === "Warning") {
		return "bg-citron/35 text-darknavy";
	}

	return "bg-skyblue/12 text-darknavy";
}
