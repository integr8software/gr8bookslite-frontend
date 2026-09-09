import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ResponsibilityCenterLookupOption,
  ResponsibilityCenterLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupTypes";

type ResponsibilityCenterBackendResponse = {
  id: string;
  code: string;
  name: string;
  typeName?: string;
  classificationName?: string;
  [key: string]: unknown;
};

export async function fetchResponsibilityCenterLookupOptions(
  query: ResponsibilityCenterLookupQuery = {},
): Promise<ResponsibilityCenterLookupOption[]> {
  const response = await ApiClient.get<{ responsibilityCenters: ResponsibilityCenterBackendResponse[] }>(
    "/maintenance/financial-management/responsibility-centers/options",
    { params: query },
  );

  return (response.data.responsibilityCenters ?? []).map(mapCenterToLookupOption);
}

export async function fetchResponsibilityCenterLookupOptionsByType(
  typeId: string,
  query: Omit<ResponsibilityCenterLookupQuery, "typeId"> = {},
): Promise<ResponsibilityCenterLookupOption[]> {
  const response = await ApiClient.get<{ responsibilityCenters: ResponsibilityCenterBackendResponse[] }>(
    `/maintenance/financial-management/responsibility-centers/options/${encodeURIComponent(typeId)}`,
    { params: query },
  );

  return (response.data.responsibilityCenters ?? []).map(mapCenterToLookupOption);
}

function mapCenterToLookupOption(center: ResponsibilityCenterBackendResponse): ResponsibilityCenterLookupOption {
  return {
    ...center,
    name: center.name,
    label: center.code,
    value: center.code,
    description: center.name,
    centerId: center.id,
    code: center.code,
    typeName: center.typeName,
    classificationName: center.classificationName,
  };
}
