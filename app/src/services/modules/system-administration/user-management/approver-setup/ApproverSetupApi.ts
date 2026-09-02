import {
	approverSetupsControllerCreateV1,
	approverSetupsControllerFindAllV1,
	approverSetupsControllerFindCompanyUsersV1,
} from "@/app/src/generated/api/approver-setups/approver-setups";
import type {
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

type ApproverSetupResponseDto = {
	id: string;
	level?: number | null;
	levelName: string;
	moduleScope: string;
	type?: string | null;
	approverCondition?: string | null;
	status?: string | null;
	updatedAt: string;
	approvers: Array<{ id: number | string; name: string; email: string }>;
};

type ApproverSetupApiRecord = ApproverSetupResponseDto & {
	levelName: string;
	validUntil?: string | null;
};

type ApproverSetupMutationPayload = CreateApproverSetupDto & {
	levelName: string;
	validUntil?: string;
};

type ApproverSetupModulesResponse = {
	modules: Array<{
		code: string;
		id: number;
		name: string;
	}>;
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
	}) as unknown as Array<{ id: number | string; name: string; email: string }>;

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
	}) as unknown as { items: ApproverSetupApiRecord[] };

	return response.items.map((record) =>
		MapApproverSetupApiRecord(record as ApproverSetupApiRecord),
	);
}

export async function CreateApproverSetup(payload: ApproverSetupMutationPayload) {
	const response = await approverSetupsControllerCreateV1(payload) as unknown as { setup: ApproverSetupApiRecord };
	return MapApproverSetupApiRecord(response.setup as ApproverSetupApiRecord);
}

export async function UpdateApproverSetup({
	id,
	payload,
}: {
	id: string;
	payload: ApproverSetupMutationPayload;
}) {
	const response = await OrvalApiClient<{ setup: ApproverSetupApiRecord }>({
		data: payload,
		method: "PUT",
		url: `/api/v1/approver-setups/${encodeURIComponent(id)}`,
	});

	return MapApproverSetupApiRecord(response.setup);
}

export async function UpdateApproverSetupStatus({
	id,
	status,
}: {
	id: string;
	status: string;
}) {
	const response = await OrvalApiClient<{ setup: ApproverSetupApiRecord }>({
		data: { status },
		method: "PATCH",
		url: `/api/v1/approver-setups/${encodeURIComponent(id)}/status`,
	});

	return MapApproverSetupApiRecord(response.setup);
}

export async function DeleteApproverSetup(id: string) {
	await OrvalApiClient<{ id: string; message: string }>({
		method: "DELETE",
		url: `/api/v1/approver-setups/${encodeURIComponent(id)}`,
	});

	return id;
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
		levelName: record.levelName,
		moduleScope: record.moduleScope,
		sequence: record.level ?? 1,
		status: (record.status || "Active") as ApproverCoverageStatus,
		userIds: approverUsers.map((user) => user.id),
	};
}

function formatApiDate(value?: string | null) {
	return value ? value.slice(0, 10) : undefined;
}
