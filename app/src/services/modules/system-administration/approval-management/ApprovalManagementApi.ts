import { OrvalApiClient } from "@/app/src/services/shared/api/OrvalApiClient";
import type { ApprovalManagementModuleOption } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

type ApprovalManagementModulesResponse = {
	modules: Array<ApprovalManagementModuleOption & { id: number }>;
};

export async function GetApprovalManagementModules() {
	const response = await OrvalApiClient<ApprovalManagementModulesResponse>({
		method: "GET",
		url: "/api/v1/system-administration/approval-management/modules",
	});

	return response.modules.map((module) => ({
		code: module.code,
		name: module.name,
	}));
}
