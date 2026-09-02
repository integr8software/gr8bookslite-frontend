import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import {
	mapCreateMasterPlanAndPackageDto,
	mapMasterPlanAndPackageRecord,
	mapMasterPlanAndPackagesResponse,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApiMappers";
import type {
	MasterPlanAndPackageCreateModel,
	MasterPlanAndPackageCreateResult,
	MasterPlanAndPackagesData,
	MasterPlanAndPackagesListModel,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

export async function getMasterPlanAndPackages() {
	const response = await ApiClient.get<MasterPlanAndPackagesData>(
		"/master/plan-and-packages",
	);

	return mapMasterPlanAndPackagesResponse(
		response.data,
	) satisfies MasterPlanAndPackagesListModel;
}

export async function createMasterPlanAndPackage(
	model: MasterPlanAndPackageCreateModel,
) {
	const response = await ApiClient.post<MasterPlanAndPackageCreateResult>(
		"/master/plan-and-packages",
		mapCreateMasterPlanAndPackageDto(model.formValues),
	);

	return {
		message: response.data.message,
		plan: mapMasterPlanAndPackageRecord(response.data.plan),
	};
}
