import { MainCompanySearchItems } from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type {
	AuditTrailAction,
	AuditTrailModuleOption,
	AuditTrailRecord,
	AuditTrailSeverity,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

const Actions = [
	"View",
	"Create",
	"Update",
	"Approve",
	"Generate",
] as const satisfies readonly AuditTrailAction[];
const Severities = [
	"Info",
	"Info",
	"Info",
	"Warning",
	"Critical",
] as const satisfies readonly AuditTrailSeverity[];
const BaseCreatedAt = Date.UTC(2026, 4, 23, 7, 30, 0);
const ActiveUsers = UserListMockData.filter((user) => user.status === "Active");

export const AuditTrailModuleOptions: AuditTrailModuleOption[] =
	MainCompanySearchItems.map((item) => ({
		href: item.href,
		key: item.key,
		label: item.label,
		section: item.section,
		trail: [...item.trail, item.label],
	}));

export const MockAuditTrailRecords: AuditTrailRecord[] =
	AuditTrailModuleOptions.map((module, index) => {
		const actor = ActiveUsers[index % ActiveUsers.length] ?? ActiveUsers[0];
		const action = Actions[index % Actions.length];
		const severity = Severities[index % Severities.length];
		const recordId = `${module.key
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "-")
			.slice(0, 14)}-${String(index + 1).padStart(4, "0")}`;

		return {
			id: `audit-${module.key}-${index + 1}`,
			action,
			actorName: actor?.name ?? "System",
			actorRole: actor?.userRole ?? "System",
			createdAt: new Date(BaseCreatedAt - index * 17 * 60 * 1000).toISOString(),
			description: createAuditDescription(action, module.label, recordId),
			ipAddress: `10.0.${index % 12}.${20 + (index % 80)}`,
			moduleHref: module.href,
			moduleKey: module.key,
			moduleLabel: module.label,
			recordId,
			section: module.section,
			severity,
			trail: module.trail,
		};
	});

function createAuditDescription(
	action: AuditTrailAction,
	moduleLabel: string,
	recordId: string,
) {
	const pastTenseByAction: Record<AuditTrailAction, string> = {
		Approve: "approved",
		Create: "created",
		Delete: "deleted",
		Generate: "generated",
		Reject: "rejected",
		Update: "updated",
		View: "viewed",
	};

	if (action === "Approve") {
		return `${moduleLabel} record ${recordId} moved to the next approval stage.`;
	}

	if (action === "Generate") {
		return `${moduleLabel} generated a controlled document or transaction reference.`;
	}

	return `${moduleLabel} record ${recordId} was ${pastTenseByAction[action]}.`;
}
