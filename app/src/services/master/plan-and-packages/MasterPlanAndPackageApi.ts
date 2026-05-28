import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import {
	mapCreateMasterPlanAndPackageRequest,
	mapMasterPlanAndPackageRecord,
	mapMasterPlanAndPackagesResponse,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApiMappers";
import type {
	CreateMasterPlanAndPackageResponse,
	MasterPlanAndPackageCreateModel,
	MasterPlanAndPackagesListModel,
	MasterPlanAndPackagesResponse,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApiTypes";

function getAuthorizationHeaders(accessToken: string | null) {
	if (!accessToken) {
		return undefined;
	}

	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function getMasterPlanAndPackages(accessToken: string | null = null) {
	const response = await ApiClient.get<MasterPlanAndPackagesResponse>(
		"/master/plan-and-packages",
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return mapMasterPlanAndPackagesResponse(
		response.data,
	) satisfies MasterPlanAndPackagesListModel;
}

export async function createMasterPlanAndPackage(
	accessToken: string | null,
	model: MasterPlanAndPackageCreateModel,
) {
	const response = await ApiClient.post<CreateMasterPlanAndPackageResponse>(
		"/master/plan-and-packages",
		mapCreateMasterPlanAndPackageRequest(model.formValues),
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return {
		message: response.data.message,
		plan: mapMasterPlanAndPackageRecord(response.data.plan),
	};
}
