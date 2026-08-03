import {
	approverSetupsControllerCreateV1,
	approverSetupsControllerFindAllV1,
	approverSetupsControllerFindCompanyUsersV1,
} from "@/app/src/generated/api/approver-setups/approver-setups";
import type {
	ApproverSetupResponseDto,
	CreateApproverSetupDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
	ApproverAssignmentType,
	ApproverCondition,
	ApproverCoverageStatus,
	ApproverSetupModuleOption,
	ApproverSetupRecord,
	ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { OrvalApiClient } from "@/app/src/services/shared/api/OrvalApiClient";

type ApproverSetupModulesResponse = {
	modules: Array<{
		code: string;
		id: number;
		name: string;
	}>;
};

type ApproverSetupApiRecord = ApproverSetupResponseDto & {
	validUntil?: string | null;
};

export type CreateApproverSetupPayload = CreateApproverSetupDto & {
	validUntil?: string;
};

export async function FetchApproverSetupModules() {
	const response = await OrvalApiClient<ApproverSetupModulesResponse>({
		method: "GET",
		url: "/api/v1/approver-setups/modules",
	});

	return response.modules.map<ApproverSetupModuleOption>((module) => ({
		code: module.code,
		id: String(module.id),
		name: module.name,
	}));
}

export async function FetchApproverSetupUsers(search = "") {
	const response = await approverSetupsControllerFindCompanyUsersV1({
		page: 1,
		limit: 100,
		search: search.trim() || undefined,
	});

	return response.map<ApproverSetupUser>((user) => ({
		id: String(user.id),
		name: user.name,
		email: user.email,
	}));
}

export async function FetchApproverSetups() {
	const response = await approverSetupsControllerFindAllV1({
		page: 1,
		limit: 100,
	});

	return response.items.map(MapApproverSetupApiRecord);
}

export async function CreateApproverSetup(payload: CreateApproverSetupPayload) {
	const response = await approverSetupsControllerCreateV1(payload);
	return MapApproverSetupApiRecord(response.setup);
}

export function MapApproverSetupApiRecord(
	record: ApproverSetupApiRecord,
): ApproverSetupRecord {
	const approverUsers = record.approvers.map<ApproverSetupUser>((user) => ({
		id: String(user.id),
		name: user.name,
		email: user.email,
	}));

	return {
		id: record.id,
		approverUsers,
		assignmentType: (record.type || "Level-based") as ApproverAssignmentType,
		condition: (record.approverCondition ||
			"Any one approver") as ApproverCondition,
		effectiveTo: formatApiDate(record.validUntil),
		lastUpdatedAt: record.updatedAt.slice(0, 10),
		lastUpdatedBy: "System",
		levelName: record.level ? `Level ${record.level}` : "Approval Review",
		moduleScope: record.moduleScope,
		sequence: record.level ?? 1,
		status: (record.status || "Active") as ApproverCoverageStatus,
		userIds: approverUsers.map((user) => user.id),
	};
}

function formatApiDate(value?: string | null) {
	return value ? value.slice(0, 10) : undefined;
}
