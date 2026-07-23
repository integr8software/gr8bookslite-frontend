import { ItemVariationsApiPath } from "@/app/src/constants/modules/item-management/item-variations/ItemVariationsConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ApiItemVariation,
  ApiItemVariationSaveResponse,
  ApiItemVariationStatus,
  ApiItemVariationUsage,
  ApiItemVariationValueStatus,
  ApiItemVariationsListResponse,
  ItemVariationFormValues,
  ItemVariationRecord,
  ItemVariationStatus,
  ItemVariationUsage,
  ItemVariationValueStatus,
  ItemVariationsListResponse,
} from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";
import type { ItemVariationRecord as ItemFormVariationRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

export async function fetchItemVariations(): Promise<ItemVariationsListResponse> {
  const response = await ApiClient.get<ApiItemVariationsListResponse>(ItemVariationsApiPath, {
    timeout: 5000,
  });

  return {
    variations: response.data.variations.map(mapApiItemVariation),
    permissions: response.data.permissions,
    statistics: response.data.statistics,
  };
}

export async function fetchItemVariationOptions(): Promise<ItemFormVariationRecord[]> {
  const response = await ApiClient.get<ApiItemVariationsListResponse>(
    `${ItemVariationsApiPath}/options`,
  );

  return response.data.variations.map((variation) => ({
    id: variation.id,
    code: variation.code,
    name: variation.name,
    usage: mapUsageFromApi(variation.usage),
    values: variation.values
      .filter((value) => value.status === "ACTIVE")
      .map((value) => value.label),
    requiredOnItem: variation.requiredOnItem,
    affectsStock: variation.affectsStock,
    status: mapStatusFromApi(variation.status),
  }));
}

export async function createItemVariation(
  values: ItemVariationFormValues,
): Promise<ItemVariationRecord> {
  const response = await ApiClient.post<ApiItemVariationSaveResponse>(
    ItemVariationsApiPath,
    toApiItemVariationPayload(values),
  );

  return mapApiItemVariation(response.data.variation);
}

export async function updateItemVariation(
  variation: ItemVariationRecord,
): Promise<ItemVariationRecord> {
  const response = await ApiClient.patch<ApiItemVariationSaveResponse>(
    `${ItemVariationsApiPath}/${variation.id}`,
    toApiItemVariationPayload(variation),
  );

  return mapApiItemVariation(response.data.variation);
}

function mapApiItemVariation(variation: ApiItemVariation): ItemVariationRecord {
  return {
    id: variation.id,
    code: variation.code,
    name: variation.name,
    usage: mapUsageFromApi(variation.usage),
    values: variation.values.map((value) => ({
      id: value.id,
      label: value.label,
      isUsed: value.isUsed,
      status: mapValueStatusFromApi(value.status),
    })),
    requiredOnItem: variation.requiredOnItem,
    affectsStock: variation.affectsStock,
    status: mapStatusFromApi(variation.status),
  };
}

function toApiItemVariationPayload(variation: ItemVariationRecord | ItemVariationFormValues) {
  return {
    name: variation.name.trim(),
    usage: "usage" in variation ? mapUsageToApi(variation.usage) : undefined,
    values: variation.values.map((value, index) => ({
      id: value.id,
      label: value.label.trim(),
      isUsed: value.isUsed,
      sortOrder: index + 1,
      status: mapValueStatusToApi(value.status),
    })),
    requiredOnItem: "requiredOnItem" in variation ? variation.requiredOnItem : undefined,
    affectsStock: "affectsStock" in variation ? variation.affectsStock : undefined,
    status: mapStatusToApi(variation.status),
  };
}

function mapStatusFromApi(value: ApiItemVariationStatus): ItemVariationStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ItemVariationStatus): ApiItemVariationStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapValueStatusFromApi(value: ApiItemVariationValueStatus): ItemVariationValueStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapValueStatusToApi(value: ItemVariationValueStatus): ApiItemVariationValueStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapUsageFromApi(value: ApiItemVariationUsage): ItemVariationUsage {
  if (value === "STOCK_CLASSIFICATION") return "Stock Classification";
  if (value === "VARIANT") return "Variant";
  return "Item Detail";
}

function mapUsageToApi(value: ItemVariationUsage): ApiItemVariationUsage {
  if (value === "Stock Classification") return "STOCK_CLASSIFICATION";
  if (value === "Variant") return "VARIANT";
  return "ITEM_DETAIL";
}
