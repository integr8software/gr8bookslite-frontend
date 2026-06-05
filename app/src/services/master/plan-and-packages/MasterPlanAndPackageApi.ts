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

export async function getMasterPlanAndPackages() {
	const response = await ApiClient.get<MasterPlanAndPackagesResponse>(
		"/master/plan-and-packages",
	);

	return mapMasterPlanAndPackagesResponse(
		response.data,
	) satisfies MasterPlanAndPackagesListModel;
}

export async function createMasterPlanAndPackage(
	model: MasterPlanAndPackageCreateModel,
) {
	const response = await ApiClient.post<CreateMasterPlanAndPackageResponse>(
		"/master/plan-and-packages",
		mapCreateMasterPlanAndPackageRequest(model.formValues),
	);

	return {
		message: response.data.message,
		plan: mapMasterPlanAndPackageRecord(response.data.plan),
	};
}
