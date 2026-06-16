import { MainCompanySearchItems } from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/users/UserListData";
import type {
	AuditTrailAction,
	AuditTrailModuleOption,
	AuditTrailRecord,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

const Actions = [
	"View",
	"Save",
	"Edit",
	"Approve",
	"Cancel",
	"Uncancel",
	"Export",
] as const satisfies readonly AuditTrailAction[];
const BaseCreatedAt = Date.UTC(2026, 4, 23, 7, 30, 0);
const ActiveUsers = UserListMockData.filter((user) => user.status === "Active");

export const AuditTrailModuleOptions: AuditTrailModuleOption[] =
	MainCompanySearchItems.map((item) => ({
		key: item.key,
		label: item.label,
	}));

export const MockAuditTrailRecords: AuditTrailRecord[] =
	AuditTrailModuleOptions.map((module, index) => {
		const actor = ActiveUsers[index % ActiveUsers.length] ?? ActiveUsers[0];
		const action = Actions[index % Actions.length];
		const entityId = `${module.key
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "-")
			.slice(0, 14)}-${String(index + 1).padStart(4, "0")}`;

		return {
			id: `audit-${module.key}-${index + 1}`,
			action,
			actorName: actor?.name ?? "System",
			actorRole: actor?.userRole ?? "System",
			branchId: "workspace",
			branchName: "Workspace",
			createdAt: new Date(BaseCreatedAt - index * 17 * 60 * 1000).toISOString(),
			description: createAuditDescription(action, module.label, entityId),
			entityId,
			entityType: module.key,
			ipAddress: `10.0.${index % 12}.${20 + (index % 80)}`,
			moduleKey: module.key,
			module: module.label,
		};
	});

function createAuditDescription(
	action: AuditTrailAction,
	moduleLabel: string,
	recordId: string,
) {
	const pastTenseByAction: Record<AuditTrailAction, string> = {
		Approve: "approved",
		Cancel: "cancelled",
		Delete: "deleted",
		Disapproved: "disapproved",
		Edit: "edited",
		Export: "exported",
		Save: "saved",
		Uncancel: "uncancelled",
		View: "viewed",
	};

	if (action === "Approve") {
		return `${moduleLabel} record ${recordId} moved to the next approval stage.`;
	}

	if (action === "Cancel") {
		return `${moduleLabel} record ${recordId} was cancelled before completion.`;
	}

	if (action === "Uncancel") {
		return `${moduleLabel} record ${recordId} was restored from cancelled status.`;
	}

	return `${moduleLabel} record ${recordId} was ${pastTenseByAction[action]}.`;
}
