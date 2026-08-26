import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import {
	mapCreateMasterPlanAndPackagePayload,
	mapMasterPlanAndPackageRecord,
	mapMasterPlanAndPackagesResponse,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApiMappers";
import type {
	CreateMasterPlanAndPackageResult,
	MasterPlanAndPackageCreateModel,
	MasterPlanAndPackagesApiData,
	MasterPlanAndPackagesListModel,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

export async function getMasterPlanAndPackages() {
	const response = await ApiClient.get<MasterPlanAndPackagesApiData>(
		"/master/plan-and-packages",
	);

	return mapMasterPlanAndPackagesResponse(
		response.data,
	) satisfies MasterPlanAndPackagesListModel;
}

export async function createMasterPlanAndPackage(
	model: MasterPlanAndPackageCreateModel,
) {
	const response = await ApiClient.post<CreateMasterPlanAndPackageResult>(
		"/master/plan-and-packages",
		mapCreateMasterPlanAndPackagePayload(model.formValues),
	);

	return {
		message: response.data.message,
		plan: mapMasterPlanAndPackageRecord(response.data.plan),
	};
}
