import {
  responsibilityCenterControllerCreateV1,
  responsibilityCenterControllerFindAllV1,
  responsibilityCenterControllerFindClassificationsV1,
  responsibilityCenterControllerFindTypesV1,
  responsibilityCenterControllerSuggestCodeV1,
  responsibilityCenterControllerUpdateStatusV1,
  responsibilityCenterControllerUpdateV1,
} from "@/app/src/generated/api/responsibility-center/responsibility-center";
import type {
  CreateResponsibilityCenterDto,
  CreateResponsibilityCenterDtoStatus,
  ResponsibilityCenterClassificationResponseDto,
  ResponsibilityCenterResponseDto,
  ResponsibilityCenterResponseDtoFinancialType,
  ResponsibilityCenterResponseDtoStatus,
  ResponsibilityCenterTypeResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  ResponsibilityCenter,
  ResponsibilityCenterCategory,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFinancialType,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterListResult,
  ResponsibilityCenterStatus,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";

export async function fetchResponsibilityCenters(): Promise<ResponsibilityCenterListResult> {
  const response = await responsibilityCenterControllerFindAllV1({
    limit: 500,
  });

  return {
    centers: response.centers.map(mapApiResponsibilityCenter),
    statistics: response.statistics,
    permissions: response.permissions,
  };
}

export async function fetchResponsibilityCenterClassifications(): Promise<ResponsibilityCenterClassification[]> {
  const response = await responsibilityCenterControllerFindClassificationsV1();

  return response.classifications.map(mapApiResponsibilityCenterClassification);
}

export async function fetchResponsibilityCenterTypes(classificationId?: string): Promise<ResponsibilityCenterTypeOption[]> {
  const response = await responsibilityCenterControllerFindTypesV1(classificationId ? { classificationId } : undefined);

  return response.types.map(mapApiResponsibilityCenterType);
}

export async function fetchResponsibilityCenterCodeSuggestion(typeId: string): Promise<string> {
  const response = await responsibilityCenterControllerSuggestCodeV1({
    typeId,
  });

  return response.code;
}

export async function createResponsibilityCenter(
  values: ResponsibilityCenterFormValues | ResponsibilityCenter,
): Promise<ResponsibilityCenter> {
  const response = await responsibilityCenterControllerCreateV1(toApiResponsibilityCenterPayload(values));

  return mapApiResponsibilityCenter(response.center);
}

export async function updateResponsibilityCenter(center: ResponsibilityCenter): Promise<ResponsibilityCenter> {
  const response = await responsibilityCenterControllerUpdateV1(center.id, toApiResponsibilityCenterPayload(center));

  return mapApiResponsibilityCenter(response.center);
}

export async function updateResponsibilityCenterStatus(center: ResponsibilityCenter): Promise<ResponsibilityCenter> {
  const response = await responsibilityCenterControllerUpdateStatusV1(center.id, {
    status: mapStatusToApi(center.status),
  });

  return mapApiResponsibilityCenter(response.center);
}

function mapApiResponsibilityCenter(center: ResponsibilityCenterResponseDto): ResponsibilityCenter {
  return {
    id: center.id,
    code: center.code,
    name: center.name,
    classificationId: center.classificationId,
    classificationCode: center.classificationCode,
    classificationName: mapFinancialTypeFromLabel(center.classificationName),
    typeId: center.typeId,
    typeName: center.typeName,
    typeCodePrefix: center.typeCodePrefix,
    category: mapCategoryFromApi(center.category, center.typeName),
    financialType: mapFinancialTypeFromApi(center.financialType),
    manager: center.manager ?? "",
    parentId: center.parentId ?? undefined,
    status: mapStatusFromApi(center.status),
    description: center.description ?? "",
    createdBy: center.createdBy ?? undefined,
    createdAt: center.createdAt,
    updatedBy: center.updatedBy,
    updatedAt: center.updatedAt,
  };
}

function mapApiResponsibilityCenterClassification(
  classification: ResponsibilityCenterClassificationResponseDto,
): ResponsibilityCenterClassification {
  return {
    id: classification.id,
    code: classification.code,
    name: mapFinancialTypeFromLabel(classification.name),
    trackingBehavior: classification.trackingBehavior,
    isSystem: classification.isSystem,
    status: classification.status,
  };
}

function mapApiResponsibilityCenterType(type: ResponsibilityCenterTypeResponseDto): ResponsibilityCenterTypeOption {
  return {
    id: type.id,
    classificationId: type.classificationId,
    classificationCode: type.classificationCode,
    classificationName: mapFinancialTypeFromLabel(type.classificationName),
    name: type.name,
    codePrefix: type.codePrefix,
    description: type.description,
    sortOrder: type.sortOrder,
    isRequired: type.isRequired,
    status: type.status,
  };
}

function toApiResponsibilityCenterPayload(center: ResponsibilityCenterFormValues | ResponsibilityCenter): CreateResponsibilityCenterDto {
  return {
    code: center.code.trim().toUpperCase(),
    name: center.name.trim(),
    classificationId: center.classificationId,
    typeId: center.typeId,
    manager: center.manager.trim(),
    parentId: center.parentId?.trim() || undefined,
    status: mapStatusToApi(center.status),
    description: center.description?.trim() ?? "",
  };
}

function mapFinancialTypeFromLabel(value: ResponsibilityCenterResponseDtoFinancialType | string): ResponsibilityCenterFinancialType {
  if (value === "COST_CENTER" || value === "PROFIT_CENTER" || value === "REVENUE_CENTER" || value === "INVESTMENT_CENTER") {
    return mapFinancialTypeFromApi(value);
  }

  const normalized = String(value).toLowerCase();
  if (normalized.includes("revenue")) return "Revenue Center";
  if (normalized.includes("profit")) return "Profit Center";
  if (normalized.includes("investment")) return "Investment Center";
  return "Cost Center";
}

function mapCategoryFromApi(value: string, typeName?: string): ResponsibilityCenterCategory {
  return (typeName?.trim() || formatResponsibilityCenterCategory(value)) as ResponsibilityCenterCategory;
}

function formatResponsibilityCenterCategory(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapFinancialTypeFromApi(value: ResponsibilityCenterResponseDtoFinancialType): ResponsibilityCenterFinancialType {
  const financialTypes: Record<ResponsibilityCenterResponseDtoFinancialType, ResponsibilityCenterFinancialType> = {
    COST_CENTER: "Cost Center",
    PROFIT_CENTER: "Profit Center",
    REVENUE_CENTER: "Revenue Center",
    INVESTMENT_CENTER: "Investment Center",
  };

  return financialTypes[value];
}

function mapStatusFromApi(value: ResponsibilityCenterResponseDtoStatus): ResponsibilityCenterStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ResponsibilityCenterStatus): CreateResponsibilityCenterDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
